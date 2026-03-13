# FileTract Web Interface

Modern web interface for the patent-eligible OCR pipeline with real-time processing visualization.

## Features

- **Drag-and-drop file upload** (PDF, PNG, JPG, TIFF, BMP)
- **Dual pipeline selection** (Standard vs Patent)
- **Real-time processing visualization** with 5-stage pipeline tracker
- **Live confidence heatmap** overlay during processing
- **Quality-aware results display** with color-coded confidence levels
- **Fusion metrics dashboard** showing re-OCR performance
- **JSON export** of structured results

## Quick Start

### 1. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 2. Start Backend Server

```powershell
python app.py
```

The server will start at `http://localhost:5000`

### 3. Open Web Interface

Navigate to `http://localhost:5000` in your browser

## Usage

1. **Upload Document**: Click "Selected Source" to choose a PDF or image
2. **Configure Fields**: Enter comma-separated field names (e.g., "Name, School, Date of Birth")
3. **Select Pipeline**:
   - **Standard Pipeline**: Fast processing for high-quality documents
   - **Patent Pipeline**: Advanced processing with adaptive re-OCR
4. **View Results**: See extracted fields with quality metrics
5. **Export**: Download JSON results with quality metadata

## API Endpoints

### POST /api/upload
Upload a document for processing

**Request**: `multipart/form-data` with file

**Response**:
```json
{
  "job_id": "uuid",
  "filename": "document.pdf",
  "status": "uploaded"
}
```

### POST /api/extract
Start field extraction

**Request**:
```json
{
  "job_id": "uuid",
  "fields": ["Name", "School"],
  "pipeline": "patent"
}
```

**Response**:
```json
{
  "job_id": "uuid",
  "status": "processing",
  "pipeline": "patent"
}
```

### GET /api/status/<job_id>
Check processing status

**Response**:
```json
{
  "job_id": "uuid",
  "status": "processing",
  "current_stage": 3
}
```

### GET /api/result/<job_id>
Get extraction results

**Response** (Patent Pipeline):
```json
{
  "job_id": "uuid",
  "pipeline": "patent",
  "results": {
    "extracted_fields": {
      "Name": {
        "value": "JOHN DOE",
        "ocr_confidence": 0.95,
        "llm_confidence": "high",
        "quality_flag": "reliable"
      }
    },
    "quality_report": {...},
    "confidence_statistics": {...},
    "fusion_metadata": {...}
  }
}
```

## Architecture

```
Frontend (HTML/CSS/JS)
    ↓ HTTP REST
Flask Backend (app.py)
    ↓
Patent OCR Pipeline
    ├─ Confidence Analysis
    ├─ Adaptive Re-OCR
    ├─ Result Fusion
    └─ Quality-Aware LLM
```

## Technology Stack

- **Backend**: Flask + Flask-CORS
- **Frontend**: Vanilla JavaScript (no framework)
- **Styling**: Custom CSS with tectonic plate design
- **OCR**: Tesseract + OpenCV
- **AI**: Google Gemini 2.5 Flash

## File Structure

```
filetract_web/
├── index.html      # Main UI
├── styles.css      # Tectonic plate styling
└── app.js          # Frontend logic

app.py              # Flask backend API
uploads/            # Temporary file storage
results/            # Processed results
```

## Quality Visualization

The interface displays:

- **Reliable** (Green): OCR ≥ 0.85, LLM = High
- **Good** (Green): OCR ≥ 0.75, LLM = High/Medium
- **Uncertain** (Orange): OCR < 0.85 or LLM = Medium
- **Low Quality** (Red): OCR < 0.75, LLM = Low

## Development

### Running in Debug Mode

```powershell
python app.py
```

Flask debug mode is enabled by default for development.

### Production Deployment

For production, use a WSGI server like Gunicorn:

```powershell
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

**CORS Errors**: Flask-CORS is configured to allow all origins in development. Adjust in `app.py` for production.

**File Upload Limits**: Default max file size is 16MB. Adjust `MAX_FILE_SIZE` in `app.py`.

**Processing Timeout**: Long documents may take 30-60 seconds with patent pipeline.

## License

MIT License - See main README.md
