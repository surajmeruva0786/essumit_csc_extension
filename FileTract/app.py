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
import requests
from typing import Dict, List

# Local DB for Desktop App Offline Storage
import local_db

# Import patent pipeline modules
from patent_ocr_pipeline import process_document_with_patent_pipeline, extract_text_with_confidence_pipeline
from gemini_ocr_extract import extract_text_from_pdf, extract_text_from_image, extract_fields_with_groq

# Serve the new React/Vite frontend build (extension_frontend/dist) instead of filetract_web
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "extension_frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)


@app.route("/")
def serve_frontend():
    """Serve the new CSC Sahayak frontend SPA."""
    index_path = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, "index.html")
    # Fallback message if frontend hasn't been built yet
    return "Frontend build not found. Please run the extension_frontend build.", 200

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
                    from gemini_ocr_extract import extract_text_from_pdf, extract_fields_with_groq
                    text = extract_text_from_pdf(file_path)
                else:
                    from gemini_ocr_extract import extract_text_from_image, extract_fields_with_groq
                    text = extract_text_from_image(file_path)
                
                extracted_data = extract_fields_with_groq(text, fields)
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
            
        elif pipeline == 'ollama':
            print(f"Starting OLLAMA local pipeline for job {job_id}...")
            jobs[job_id]['current_stage'] = 1
            
            # 1. Extract raw text from image/PDF
            ext = os.path.splitext(file_path)[1].lower()
            if ext == '.pdf':
                from gemini_ocr_extract import extract_text_from_pdf
                text = extract_text_from_pdf(file_path)
            else:
                from gemini_ocr_extract import extract_text_from_image
                text = extract_text_from_image(file_path)
                
            jobs[job_id]['current_stage'] = 2
            
            # 2. Query Local Ollama API (Llama3.2)
            try:
                system_prompt = "You are a data extraction assistant. Extract the requested fields from the OCR text. Return ONLY a pure JSON object, no markdown."
                user_prompt = f"Extract these fields: {', '.join(fields)}\n\nText:\n{text}"
                
                response = requests.post('http://127.0.0.1:11434/api/generate', json={
                    "model": "llama3.2:latest",
                    "prompt": f"{system_prompt}\n\n{user_prompt}",
                    "stream": False,
                    "format": "json",
                }, timeout=120)
                response.raise_for_status()
                
                try:
                    llm_json = json.loads(response.json()['response'])
                    # Format to match Groq output structure expected by frontend
                    extracted_data = {}
                    for field, value in llm_json.items():
                        extracted_data[field] = {
                            "value": str(value),
                            "confidence": 0.95
                        }
                except Exception as parse_e:
                    print(f"Ollama JSON parse error: {parse_e}")
                    extracted_data = {"error": {"value": str(parse_e), "confidence": 0}}
                    
            except requests.exceptions.RequestException as req_e:
                print(f"Ollama connection error (Is Ollama running?): {req_e}")
                jobs[job_id]['warning'] = 'Ollama connection failed, falling back to Groq.'
                # Fallback to standard Groq if Ollama is not actually running
                from gemini_ocr_extract import extract_fields_with_groq
                extracted_data = extract_fields_with_groq(text, fields)

            # Save results
            result_path = os.path.join(RESULTS_FOLDER, f"{job_id}_results.json")
            with open(result_path, 'w', encoding='utf-8') as f:
                json.dump({
                    'job_id': job_id,
                    'pipeline': 'ollama',
                    'timestamp': datetime.now().isoformat(),
                    'results': extracted_data
                }, f, indent=2)
                
            jobs[job_id]['status'] = 'complete'
            jobs[job_id]['current_stage'] = 2
            jobs[job_id]['results'] = extracted_data
            
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
            extracted_data = extract_fields_with_groq(text, fields)
            
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

@app.route('/api/validate_field', methods=['POST'])
def validate_field():
    """Validate a single extracted field using local Ollama and the Knowledge Base"""
    data = request.json
    field_name = data.get('field_name', '')
    field_value = data.get('field_value', '')
    
    if not field_name or not field_value:
        return jsonify({'valid': True, 'reason': 'Value missing.'})
        
    try:
        # Load Knowledge Base
        kb_path = os.path.join(BASE_DIR, "..", "knowledge_base", "csc_kb1.json")
        kb_str = ""
        if os.path.exists(kb_path):
            with open(kb_path, 'r', encoding='utf-8') as f:
                content = f.read()
                try:
                    kb_data = json.loads(content)
                except Exception:
                    import ast
                    kb_data = ast.literal_eval(content)
                kb_str = json.dumps(kb_data)[:3000] # Limit context size
                
        system_prompt = """You are a helpful AI validation assistant for evaluating extracted form data.
INSTRUCTIONS:
You must determine if the "Extracted Value" logically matches the "Field Name". 

GUIDELINES:
- 'Aadhaar' / 'आधार संख्या': Valid ONLY IF it is exactly 12 digits. If it contains letters (like 'CGX' or 'BPL'), it is INVALID (likely a Voter ID or BPL number).
- 'PIN Code' / 'पिन कोड': Valid ONLY IF exactly 6 digits.
- 'Address' / 'पता': Valid ONLY IF it contains text/words. If it is ONLY a 6-digit number, it is INVALID.
- 'Name' / 'नाम' / 'Caste' / 'Date of Birth' etc.: Valid as long as it looks like a reasonable value for that field.

OUTPUT FORMAT:
If the value matches the field type and rules, you MUST output: {"valid": true, "reason": "यह जानकारी सही प्रतीत होती है।"}
If the value clearly breaks a rule or is clearly mismatched, output: {"valid": false, "reason": "Your explanation in Hindi"}
Reply with valid JSON dictionary ONLY."""
        
        user_prompt = f"Field Name: {field_name}\nExtracted Value: {field_value}\n\nValidate the extracted value. Output ONLY valid JSON containing 'valid' (boolean) and 'reason' (string)."
        
        response = requests.post('http://127.0.0.1:11434/api/generate', json={
            "model": "llama3.2:latest",
            "prompt": f"{system_prompt}\n\n{user_prompt}",
            "stream": False,
            "format": "json",
        }, timeout=30)
        
        if response.ok:
            result_text = response.json()['response'].strip()
            # Clean markdown if present
            if result_text.startswith('```json'):
                result_text = result_text[7:].strip()
            if result_text.endswith('```'):
                result_text = result_text[:-3].strip()
            try:
                result = json.loads(result_text)
                return jsonify(result)
            except Exception as e:
                print(f"Ollama JSON decode error: {e}")
                return jsonify({'valid': True, 'reason': 'Error parsing AI response'})
        else:
            return jsonify({'valid': True, 'reason': 'AI Validation failed'})
            
    except Exception as e:
        print(f"Validation error: {e}")
        return jsonify({'valid': True, 'reason': 'AI Assistant unavailable.'})

# ==========================================
# Desktop Application / Sync APIs
# ==========================================

@app.route('/api/desktop/applications', methods=['GET', 'POST'])
def handle_applications():
    if request.method == 'POST':
        app_data = request.json
        if not app_data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Save to SQLite
        try:
           app_id = local_db.save_application(app_data)
           return jsonify({'status': 'success', 'id': app_id})
        except Exception as e:
           return jsonify({'error': str(e)}), 500
    
    # GET method
    try:
        apps = local_db.get_all_applications()
        return jsonify(apps)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sync/stage', methods=['POST'])
def sync_stage():
    data = request.json
    app_id = data.get('application_id')
    if not app_id:
        return jsonify({'error': 'Application ID required'}), 400
        
    print(f"[SYNC] Staging Application ID {app_id} for Chrome Extension...")
    success = local_db.stage_application_for_sync(app_id)
    if success:
        return jsonify({'status': 'success', 'message': f'Application {app_id} staged.'})
    else:
        return jsonify({'error': 'Application not found'}), 404

@app.route('/api/sync/get_staged', methods=['GET'])
def get_staged_sync():
    print("[SYNC] Chrome Extension is requesting staged application data...")
    staged_data = local_db.get_staged_sync()
    if staged_data:
        return jsonify({'status': 'success', 'data': staged_data})
    else:
        return jsonify({'status': 'empty', 'message': 'No application staged for sync.'}), 200

@app.route('/api/sync/clear', methods=['POST'])
def clear_staged_sync():
    local_db.clear_staged_sync()
    return jsonify({'status': 'success', 'message': 'Staged data cleared.'})

if __name__ == '__main__':
    print("=" * 80)
    print("🚀 FileTract Backend API - Patent-Eligible OCR Pipeline")
    print("=" * 80)
    
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    
    # Initialize Local SQLite DB
    try:
        local_db.init_db()
        print("✅ Local SQLite Database Initialized.")
    except Exception as e:
        print(f"❌ Failed to init local_db: {e}")

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
