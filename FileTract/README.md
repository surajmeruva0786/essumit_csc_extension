# FileTract: AI-Powered Multi-File OCR with Patent-Eligible Confidence Pipeline

FileTract is an advanced document intelligence system that extracts structured data from scanned documents using OCR and AI. It features a **patent-pending confidence-weighted pipeline** that significantly improves extraction accuracy for degraded documents through adaptive re-processing and quality-aware field extraction.

---

## 🎯 Patent-Eligible Innovation

**FileTract implements a novel, patent-pending confidence-weighted OCR pipeline** that addresses fundamental challenges in document processing:

### Core Patentable Inventions

1. **Hierarchical Confidence-Weighted Field Extraction**
   - Character-level confidence extraction from OCR
   - Spatial confidence mapping using Gaussian kernel smoothing
   - Contiguous low-confidence region identification

2. **Adaptive Re-OCR Engine**
   - Image quality metrics (contrast, edge density, noise, sharpness)
   - Heuristic parameter selection based on quality analysis
   - Selective re-processing of only low-confidence regions

3. **Confidence-Weighted Result Fusion**
   - Intelligent merging using confidence delta thresholds
   - Not simple max-confidence selection
   - Metadata tracking for fusion decisions

4. **Quality-Aware LLM Extraction**
   - Confidence metadata injection into LLM prompts
   - Multi-level quality assessment (OCR + LLM)
   - Comprehensive quality flags for each field

> **Patent Status**: Patent application pending. See [PATENT_STRATEGY.md](PATENT_STRATEGY.md) for complete technical documentation and formal patent claims.

---

## 🌟 Features

### Standard Pipeline (`gemini_ocr_extract.py`)
Fast, efficient processing for high-quality documents:

- ✅ **Multi-File Processing**: Batch process PDFs and images
- ✅ **High-Quality OCR**: Tesseract at 300 DPI
- ✅ **AI Field Extraction**: Gemini 2.5 Flash for intelligent extraction
- ✅ **Interactive CLI**: User-friendly prompts
- ✅ **Flexible Fields**: Define any custom fields
- ✅ **JSON Output**: Structured data export

### Patent-Eligible Pipeline (`patent_ocr_pipeline.py`)
Advanced processing with quality optimization:

All standard features **PLUS**:

- 🔬 **Spatial Confidence Mapping**: 2D heatmaps with Gaussian kernel smoothing (σ=5px)
- 🔄 **Adaptive Re-OCR**: Selective re-processing with optimized parameters
  - DPI adjustment (300 → 600 for low sharpness)
  - CLAHE preprocessing (low contrast)
  - Sharpening filters (blur detection)
  - Bilateral denoising (high noise)
- 📊 **Quality Metrics**: Comprehensive image analysis
  - Contrast ratio: `(max - min) / (max + min)`
  - Edge density: Sobel operator response
  - Noise level: Local variance estimation
  - Sharpness: Laplacian variance
- 🔀 **Result Fusion**: Confidence-weighted selection
  - Delta-based comparison (not simple max)
  - Configurable improvement threshold (default: 0.1)
- 📈 **Quality Reporting**: Field-level quality flags
  - `reliable`: High OCR + High LLM confidence
  - `good`: Medium OCR + High/Medium LLM confidence
  - `uncertain`: Low OCR or Medium LLM confidence
  - `low-quality`: Low OCR + Low LLM confidence

### Supported Formats
- **PDF Documents**: Multi-page support with page-by-page processing
- **Images**: PNG, JPG, JPEG, TIFF, BMP

---

## 🚀 Quick Start

### Prerequisites

1. **Python 3.11+**
2. **Tesseract OCR** installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`
   - Download: https://github.com/UB-Mannheim/tesseract/wiki
3. **Google Gemini API Key**
   - Get yours: https://ai.google.dev/

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/surajmeruva0786/FileTract.git
cd FileTract
```

2. **Create and activate virtual environment**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. **Install dependencies**
```powershell
pip install -r requirements.txt
```

4. **Configure API Key**
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your-actual-api-key-here
```

---

## 📖 Usage

### Standard Pipeline (Recommended for High-Quality Documents)

```powershell
python gemini_ocr_extract.py
```

**Workflow:**
1. Select files (or press Enter for defaults)
2. Define fields to extract (e.g., "Name, School, Date of Birth")
3. View results in terminal
4. Results saved to `*_extracted_fields.json`

**Best For:**
- Clean scans
- High-resolution images
- Well-lit photographs
- Fast processing needs

### Patent Pipeline (Recommended for Degraded Documents)

```powershell
python patent_ocr_pipeline.py
```

**Workflow:**
1. Select files (or press Enter for defaults)
2. Define fields to extract
3. **5-Stage Processing:**
   - Stage 1: Baseline OCR with confidence extraction
   - Stage 2: Spatial confidence analysis
   - Stage 3: Adaptive re-OCR on low-confidence regions
   - Stage 4: Confidence-weighted result fusion
   - Stage 5: Quality-aware LLM extraction
4. View results with quality metadata
5. Results saved to `*_patent_extracted.json`

**Best For:**
- Degraded scans
- Low-resolution images
- Poor lighting conditions
- Watermarked documents
- Blurry or noisy images
- Maximum accuracy requirements

---

## 📊 Example Output

### Input Document
SSC Certificate (PDF or Image)

### Fields Requested
```
Name, Father Name, School, Date of Birth, CGPA
```

### Standard Pipeline Output (`*_extracted_fields.json`)
```json
{
    "Name": "RAPOLU SHIVA TEJA",
    "Father Name": "RAPOLU MARUTHE RAO",
    "School": "NEW VISION CONCEPT SCHOOL",
    "Date of Birth": "08/08/2002",
    "CGPA": "9.8"
}
```

### Patent Pipeline Output (`*_patent_extracted.json`)
```json
{
    "extracted_fields": {
        "Name": {
            "value": "RAPOLU SHIVA TEJA",
            "ocr_confidence": 0.95,
            "llm_confidence": "high",
            "quality_flag": "reliable"
        },
        "Father Name": {
            "value": "RAPOLU MARUTHE RAO",
            "ocr_confidence": 0.82,
            "llm_confidence": "medium",
            "quality_flag": "good"
        },
        "School": {
            "value": "NEW VISION CONCEPT SCHOOL",
            "ocr_confidence": 0.91,
            "llm_confidence": "high",
            "quality_flag": "reliable"
        },
        "Date of Birth": {
            "value": "08/08/2002",
            "ocr_confidence": 0.93,
            "llm_confidence": "high",
            "quality_flag": "reliable"
        },
        "CGPA": {
            "value": "9.8",
            "ocr_confidence": 0.89,
            "llm_confidence": "high",
            "quality_flag": "reliable"
        }
    },
    "quality_report": {
        "overall_quality": "High",
        "reliable_fields": 4,
        "uncertain_fields": 1,
        "low_quality_fields": 0,
        "total_fields": 5
    },
    "confidence_statistics": {
        "mean_confidence": 0.89,
        "min_confidence": 0.82,
        "max_confidence": 0.95,
        "low_confidence_count": 12,
        "total_regions": 84,
        "low_confidence_percentage": 14.3
    },
    "fusion_metadata": {
        "total_regions": 84,
        "reocr_selected": 31,
        "baseline_selected": 53,
        "reocr_selection_rate": 36.9,
        "successful_improvements": 31,
        "total_reocr_attempts": 80,
        "improvement_success_rate": 38.8
    }
}
```

---

## 🛠️ Technology Stack

### Core Technologies
- **OCR Engine**: Tesseract OCR 5.x
- **PDF Processing**: PyMuPDF (fitz)
- **Image Processing**: OpenCV, Pillow
- **AI Model**: Google Gemini 2.5 Flash
- **Numerical Computing**: NumPy, SciPy
- **Data Validation**: Pydantic
- **Language**: Python 3.11+

### Patent-Eligible Components
- **Confidence Analysis**: Gaussian kernel smoothing (scipy.ndimage)
- **Quality Metrics**: OpenCV image analysis
- **Adaptive Processing**: Heuristic parameter optimization
- **Result Fusion**: Confidence-weighted selection algorithms

---

## 📁 Project Structure

```
FileTract/
├── gemini_ocr_extract.py          # Standard pipeline (fast)
├── patent_ocr_pipeline.py         # Patent pipeline (advanced)
├── confidence_analyzer.py         # Spatial confidence mapping
├── image_quality_analyzer.py      # Quality metrics computation
├── adaptive_reocr_engine.py       # Selective re-OCR engine
├── result_fusion.py               # Confidence-weighted fusion
├── confidence_aware_llm.py        # Quality-aware LLM extraction
├── ocr_extract.py                 # Legacy script (preserved)
├── test_gemini.py                 # API testing utility
├── requirements.txt               # Python dependencies
├── .env                           # API key (not in repo)
├── .env.example                   # Template for .env
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
├── PATENT_STRATEGY.md             # Patent documentation
└── venv/                          # Virtual environment (not in repo)
```

---

## 🔧 Configuration

### Environment Variables (`.env`)
```bash
GEMINI_API_KEY=your-api-key-here
```

### Tesseract Path
Update in scripts if installed elsewhere:
```python
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

### OCR Settings
- **DPI**: 300 (baseline), 600 (adaptive re-OCR)
- **Language**: English (`lang="eng"`)
- **PSM**: 6 (uniform block), 7 (single line for degraded)

### Confidence Thresholds
Configurable in patent pipeline:
```python
# confidence_analyzer.py
low_confidence_threshold = 0.75  # Below this triggers re-OCR

# adaptive_reocr_engine.py
confidence_improvement_threshold = 0.1  # Minimum improvement to accept

# result_fusion.py
confidence_delta_threshold = 0.1  # Minimum delta to prefer re-OCR
```

---

## 🎯 Use Cases

### Educational Institutions
- Extract student data from certificates and mark sheets
- Process admission forms and applications
- Digitize historical academic records

### HR Departments
- Process employee documents and ID cards
- Extract data from resumes and applications
- Verify credentials from certificates

### Government Offices
- Digitize citizen records and applications
- Process license and permit applications
- Extract data from official documents

### Healthcare
- Extract patient information from medical forms
- Process insurance claims and documents
- Digitize medical records

### Legal
- Process contracts and legal documents
- Extract data from court filings
- Organize case documents

---

## 🔍 How It Works

### Standard Pipeline Flow
```
Input Document
    ↓
Tesseract OCR (300 DPI)
    ↓
Text Extraction
    ↓
Gemini AI Field Extraction
    ↓
JSON Output
```

### Patent Pipeline Flow (5 Stages)
```
Input Document
    ↓
Stage 1: Baseline OCR
├─ Tesseract with confidence extraction
├─ Bounding box preservation
└─ Character-level confidence scores
    ↓
Stage 2: Confidence Analysis
├─ 2D spatial confidence grid
├─ Gaussian kernel smoothing (σ=5px)
├─ Low-confidence region identification
└─ Confidence statistics
    ↓
Stage 3: Adaptive Re-OCR
├─ Quality metrics computation
│  ├─ Contrast ratio
│  ├─ Edge density
│  ├─ Noise level
│  └─ Sharpness
├─ Parameter optimization
│  ├─ DPI adjustment
│  ├─ CLAHE preprocessing
│  ├─ Sharpening filters
│  └─ Denoising filters
└─ Selective region re-processing
    ↓
Stage 4: Result Fusion
├─ Confidence delta calculation
├─ Intelligent result selection
├─ Confidence annotation
└─ Fusion metadata
    ↓
Stage 5: Quality-Aware LLM Extraction
├─ Confidence-annotated prompts
├─ Gemini AI field extraction
├─ Quality flag generation
└─ Quality reporting
    ↓
JSON Output with Quality Metadata
```

---

## 📈 Performance Metrics

### Typical Results (Patent Pipeline)

**High-Quality Documents:**
- Regions processed: 50-100
- Low-confidence regions: 5-15%
- Re-OCR improvements: 60-80%
- Overall quality: High

**Degraded Documents:**
- Regions processed: 200-400
- Low-confidence regions: 60-80%
- Re-OCR improvements: 30-50%
- Overall quality: Medium-High

**Processing Time:**
- Standard pipeline: 5-10 seconds per document
- Patent pipeline: 15-45 seconds per document (depends on re-OCR count)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is open-source and available under the MIT License.

**Patent Notice**: The confidence-weighted OCR pipeline and related algorithms are patent-pending. Commercial use of patent-eligible components may require licensing. See [PATENT_STRATEGY.md](PATENT_STRATEGY.md) for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent field extraction
- **Tesseract OCR** for text recognition
- **PyMuPDF** for PDF processing
- **OpenCV** for image quality analysis
- **SciPy** for Gaussian kernel operations

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review [PATENT_STRATEGY.md](PATENT_STRATEGY.md) for technical details

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Batch processing with cross-document validation
- [ ] Dynamic prompt refinement from user corrections
- [ ] Spatial-semantic field disambiguation
- [ ] Statistical outlier detection for hallucination mitigation
- [ ] Web-based UI for easier access
- [ ] Multi-language OCR support
- [ ] Cloud deployment options
- [ ] REST API for integration

### Patent Pipeline Enhancements
- [ ] Adaptive kernel sizing based on document characteristics
- [ ] Machine learning for parameter optimization
- [ ] Real-time confidence visualization
- [ ] Batch quality analytics dashboard

---

**FileTract** - Transform stacks of documents into structured, actionable data with the power of AI and patent-pending confidence optimization.

**Version**: 2.0 (Patent-Eligible)  
**Last Updated**: December 2025  
**Status**: Production Ready