"""
FileTract Flask Backend API
Serves the patent-eligible OCR pipeline via REST endpoints
"""

import os
import sys
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import threading
from typing import Dict, List

# Import patent pipeline modules
from patent_ocr_pipeline import process_document_with_patent_pipeline, extract_text_with_confidence_pipeline
from gemini_ocr_extract import extract_text_from_pdf, extract_text_from_image, extract_fields_with_gemini

app = Flask(__name__, static_folder='filetract_web', static_url_path='')
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# In-memory job storage (can be upgraded to Redis/database)
jobs = {}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_numpy_types(obj):
    """Recursively convert numpy types to Python native types for JSON serialization"""
    import numpy as np
    
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, (np.integer, np.floating)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj

def process_job_async(job_id: str, file_path: str, fields: List[str], pipeline: str):
    """Process OCR job asynchronously"""
    import time
    start_time = time.time()
    
    try:
        jobs[job_id]['status'] = 'processing'
        jobs[job_id]['current_stage'] = 1
        
        if pipeline == 'patent':
            print(f"Starting patent pipeline for job {job_id}...")
            
            # Patent pipeline with 5 stages - with timeout protection
            try:
                results = process_document_with_patent_pipeline(file_path, fields)
            except Exception as pipeline_error:
                print(f"Patent pipeline error: {pipeline_error}")
                # Fallback to standard pipeline if patent fails
                print(f"Falling back to standard pipeline for job {job_id}")
                ext = os.path.splitext(file_path)[1].lower()
                if ext == '.pdf':
                    from gemini_ocr_extract import extract_text_from_pdf, extract_fields_with_gemini
                    text = extract_text_from_pdf(file_path)
                else:
                    from gemini_ocr_extract import extract_text_from_image, extract_fields_with_gemini
                    text = extract_text_from_image(file_path)
                
                extracted_data = extract_fields_with_gemini(text, fields)
                jobs[job_id]['status'] = 'complete'
                jobs[job_id]['current_stage'] = 2
                jobs[job_id]['results'] = extracted_data
                jobs[job_id]['warning'] = 'Patent pipeline failed, used standard pipeline instead'
                return
            
            # Convert all results to JSON-serializable format
            serializable_results = {
                'extracted_fields': {
                    k: {
                        'value': v.value,
                        'ocr_confidence': float(v.ocr_confidence),
                        'llm_confidence': v.llm_confidence,
                        'quality_flag': v.quality_flag
                    } for k, v in results['fields'].items()
                },
                'quality_report': convert_numpy_types(results['quality_report']),
                'confidence_statistics': convert_numpy_types(results['confidence_stats']),
                'fusion_metadata': convert_numpy_types(results['fusion_metadata'])
            }
            
            # Save results
            result_path = os.path.join(RESULTS_FOLDER, f"{job_id}_results.json")
            with open(result_path, 'w', encoding='utf-8') as f:
                json.dump({
                    'job_id': job_id,
                    'pipeline': 'patent',
                    'timestamp': datetime.now().isoformat(),
                    'results': serializable_results,
                    'processing_time': time.time() - start_time
                }, f, indent=2)
            
            jobs[job_id]['status'] = 'complete'
            jobs[job_id]['current_stage'] = 5
            jobs[job_id]['results'] = serializable_results
            
            elapsed = time.time() - start_time
            print(f"Patent pipeline completed for job {job_id} in {elapsed:.2f}s")
            
        else:
            # Standard pipeline
            jobs[job_id]['current_stage'] = 1
            
            # Extract text
            ext = os.path.splitext(file_path)[1].lower()
            if ext == '.pdf':
                text = extract_text_from_pdf(file_path)
            else:
                text = extract_text_from_image(file_path)
            
            jobs[job_id]['current_stage'] = 2
            
            # Extract fields
            extracted_data = extract_fields_with_gemini(text, fields)
            
            # Save results
            result_path = os.path.join(RESULTS_FOLDER, f"{job_id}_results.json")
            with open(result_path, 'w', encoding='utf-8') as f:
                json.dump({
                    'job_id': job_id,
                    'pipeline': 'standard',
                    'timestamp': datetime.now().isoformat(),
                    'results': extracted_data
                }, f, indent=2)
            
            jobs[job_id]['status'] = 'complete'
            jobs[job_id]['current_stage'] = 2
            jobs[job_id]['results'] = extracted_data
            
    except Exception as e:
        jobs[job_id]['status'] = 'error'
        jobs[job_id]['error'] = str(e)
        print(f"Error processing job {job_id}: {e}")
        import traceback
        traceback.print_exc()

@app.route('/')
def index():
    """Serve the frontend"""
    return send_from_directory('filetract_web', 'index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload document(s) for processing - supports multiple files"""
    if 'files' not in request.files and 'file' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    # Handle both single and multiple file uploads
    files = request.files.getlist('files') if 'files' in request.files else [request.files['file']]
    
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No files selected'}), 400
    
    uploaded_jobs = []
    
    for file in files:
        if file.filename == '':
            continue
            
        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type for {file.filename}. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        job_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_FOLDER, f"{job_id}_{filename}")
        file.save(file_path)
        
        # Create job entry
        jobs[job_id] = {
            'id': job_id,
            'filename': filename,
            'file_path': file_path,
            'status': 'uploaded',
            'created_at': datetime.now().isoformat(),
            'current_stage': 0
        }
        
        uploaded_jobs.append({
            'job_id': job_id,
            'filename': filename,
            'status': 'uploaded'
        })
    
    if len(uploaded_jobs) == 1:
        return jsonify(uploaded_jobs[0])
    else:
        return jsonify({
            'jobs': uploaded_jobs,
            'count': len(uploaded_jobs)
        })

@app.route('/api/extract', methods=['POST'])
def extract_fields():
    """Extract fields using patent or standard pipeline"""
    data = request.json
    
    job_id = data.get('job_id')
    fields = data.get('fields', [])
    pipeline = data.get('pipeline', 'patent')  # 'patent' or 'standard'
    
    if not job_id or job_id not in jobs:
        return jsonify({'error': 'Invalid job ID'}), 400
    
    if not fields:
        return jsonify({'error': 'No fields specified'}), 400
    
    # Parse fields if comma-separated string
    if isinstance(fields, str):
        fields = [f.strip() for f in fields.split(',') if f.strip()]
    
    # Start async processing
    job = jobs[job_id]
    thread = threading.Thread(
        target=process_job_async,
        args=(job_id, job['file_path'], fields, pipeline)
    )
    thread.start()
    
    return jsonify({
        'job_id': job_id,
        'status': 'processing',
        'pipeline': pipeline,
        'fields': fields
    })

@app.route('/api/extract/batch', methods=['POST'])
def extract_fields_batch():
    """Extract fields from multiple documents with same configuration"""
    data = request.json
    
    job_ids = data.get('job_ids', [])
    fields = data.get('fields', [])
    pipeline = data.get('pipeline', 'patent')
    
    if not job_ids:
        return jsonify({'error': 'No job IDs provided'}), 400
    
    if not fields:
        return jsonify({'error': 'No fields specified'}), 400
    
    # Parse fields if comma-separated string
    if isinstance(fields, str):
        fields = [f.strip() for f in fields.split(',') if f.strip()]
    
    # Start async processing for all jobs
    started_jobs = []
    for job_id in job_ids:
        if job_id not in jobs:
            continue
        
        job = jobs[job_id]
        thread = threading.Thread(
            target=process_job_async,
            args=(job_id, job['file_path'], fields, pipeline)
        )
        thread.start()
        started_jobs.append(job_id)
    
    return jsonify({
        'job_ids': started_jobs,
        'count': len(started_jobs),
        'status': 'processing',
        'pipeline': pipeline,
        'fields': fields
    })

@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    """Get job processing status"""
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    response = {
        'job_id': job_id,
        'status': job['status'],
        'filename': job.get('filename'),
        'current_stage': job.get('current_stage', 0)
    }
    
    if job['status'] == 'error':
        response['error'] = job.get('error')
    
    return jsonify(response)

@app.route('/api/result/<job_id>', methods=['GET'])
def get_result(job_id):
    """Get extraction results"""
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    if job['status'] != 'complete':
        return jsonify({
            'error': 'Job not complete',
            'status': job['status']
        }), 400
    
    # Read results from file
    result_path = os.path.join(RESULTS_FOLDER, f"{job_id}_results.json")
    
    if os.path.exists(result_path):
        with open(result_path, 'r', encoding='utf-8') as f:
            results = json.load(f)
        return jsonify(results)
    else:
        # Return from memory if file doesn't exist
        return jsonify({
            'job_id': job_id,
            'status': 'complete',
            'results': job.get('results', {})
        })

@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    """List all jobs"""
    return jsonify({
        'jobs': [
            {
                'job_id': job_id,
                'filename': job.get('filename'),
                'status': job['status'],
                'created_at': job.get('created_at')
            }
            for job_id, job in jobs.items()
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '2.0',
        'pipeline': 'patent-eligible',
        'active_jobs': len([j for j in jobs.values() if j['status'] == 'processing'])
    })

if __name__ == '__main__':
    print("=" * 80)
    print("🚀 FileTract Backend API - Patent-Eligible OCR Pipeline")
    print("=" * 80)
    
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    
    # Use debug=False in production
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    print(f"📡 Server: http://localhost:{port}")
    print(f"📄 Frontend: http://localhost:{port}")
    print(f"🔧 API Endpoints:")
    print(f"   POST /api/upload - Upload document")
    print(f"   POST /api/extract - Extract fields")
    print(f"   GET  /api/status/<job_id> - Check status")
    print(f"   GET  /api/result/<job_id> - Get results")
    print(f"   GET  /api/jobs - List all jobs")
    print("=" * 80)
    
    app.run(debug=debug, host='0.0.0.0', port=port)
