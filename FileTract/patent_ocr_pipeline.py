"""
FileTract - Patent-Eligible Confidence-Weighted OCR Pipeline
Main integrated script with adaptive re-OCR and quality-aware extraction

This implementation includes the patent-eligible innovations:
1. Hierarchical confidence-weighted field extraction
2. Spatial confidence mapping with Gaussian kernel smoothing
3. Adaptive re-OCR with parameter optimization
4. Confidence-weighted result fusion
5. Quality-aware LLM extraction
"""

import os
import sys
import json
import cv2
import numpy as np
import fitz  # PyMuPDF
import pytesseract
from pytesseract import Output
from PIL import Image
import io
import google.generativeai as genai
from typing import List, Dict, Any
from dotenv import load_dotenv

# Import patent-eligible modules
from confidence_analyzer import ConfidenceAnalyzer, ConfidenceRegion
from image_quality_analyzer import ImageQualityAnalyzer
from adaptive_reocr_engine import AdaptiveReOCREngine
from result_fusion import ResultFusion, FusedRegion
from confidence_aware_llm import ConfidenceAwareLLM, FieldWithQuality

# Load environment variables
load_dotenv()

# Path to Tesseract executable - environment-aware for deployment
# CRITICAL: Force Linux path in Docker/container environments
import platform

# Check if running in Docker/container
def is_docker():
    """Detect if running inside Docker container"""
    try:
        with open('/proc/1/cgroup', 'r') as f:
            return 'docker' in f.read() or 'containerd' in f.read()
    except:
        return False

# Determine Tesseract path
if is_docker() or os.path.exists('/.dockerenv'):
    # Running in Docker - use system tesseract
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'
    print("✓ Docker detected - Using system Tesseract")
elif os.environ.get('TESSERACT_CMD'):
    # Use environment variable if explicitly set
    pytesseract.pytesseract.tesseract_cmd = os.environ.get('TESSERACT_CMD')
    print(f"✓ Using Tesseract from TESSERACT_CMD: {os.environ.get('TESSERACT_CMD')}")
elif os.name == 'nt':
    # Windows
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    print("✓ Using Windows Tesseract path")
else:
    # Linux/Unix fallback
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'
    print("✓ Using system Tesseract (Linux)")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌ Error: GEMINI_API_KEY not found in .env file")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

# ============================================================
# 🔹 PATENT-ELIGIBLE OCR PIPELINE
# ============================================================

def extract_text_with_confidence_pipeline(file_path: str) -> Dict:
    """
    Extract text using patent-eligible confidence-weighted pipeline.
    
    This implements the core patentable invention:
    - Character-level confidence extraction
    - Spatial confidence mapping
    - Low-confidence region identification
    - Adaptive re-OCR with parameter optimization
    - Confidence-weighted result fusion
    
    Args:
        file_path: Path to PDF or image file
    
    Returns:
        Dictionary with extracted text, confidence data, and metadata
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        return extract_pdf_with_confidence(file_path)
    elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        return extract_image_with_confidence(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def extract_image_with_confidence(image_path: str) -> Dict:
    """Extract from image with confidence pipeline"""
    print(f"  📸 Processing image with confidence pipeline...")
    
    # Load image
    img = Image.open(image_path)
    img_array = np.array(img)
    
    # Convert to BGR for OpenCV
    if len(img_array.shape) == 2:  # Grayscale
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
    else:
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # Stage 1: Baseline OCR with confidence extraction
    print("  🔍 Stage 1: Baseline OCR with confidence extraction...")
    ocr_data = pytesseract.image_to_data(img, output_type=Output.DICT)
    
    # Stage 2: Confidence analysis
    print("  📊 Stage 2: Spatial confidence analysis...")
    analyzer = ConfidenceAnalyzer(low_confidence_threshold=0.75)
    
    img_dimensions = (img.width, img.height)
    confidence_map = analyzer.generate_confidence_map(ocr_data, img_dimensions)
    all_regions = analyzer.identify_low_confidence_regions(confidence_map, ocr_data)
    
    # Get statistics
    stats = analyzer.get_confidence_statistics(all_regions)
    print(f"    - Total regions: {stats['total_regions']}")
    print(f"    - Low confidence regions: {stats['low_confidence_count']}")
    print(f"    - Average confidence: {stats['mean_confidence']:.2f}")
    
    # Stage 3: Adaptive re-OCR for low-confidence regions
    low_conf_regions = [r for r in all_regions if r.is_low_confidence]
    reocr_results = []
    
    # OPTIMIZATION: Limit re-OCR to prevent timeouts on free tier
    MAX_REOCR_REGIONS = 50  # Process max 50 regions to avoid timeout
    if len(low_conf_regions) > MAX_REOCR_REGIONS:
        print(f"  ⚠️ Limiting re-OCR to {MAX_REOCR_REGIONS} regions (found {len(low_conf_regions)})")
        # Sort by confidence and process worst regions first
        low_conf_regions = sorted(low_conf_regions, key=lambda r: r.mean_confidence)[:MAX_REOCR_REGIONS]
    
    if low_conf_regions:
        print(f"  🔄 Stage 3: Adaptive re-OCR on {len(low_conf_regions)} regions...")
        reocr_engine = AdaptiveReOCREngine()
        reocr_results = reocr_engine.batch_reocr(img_bgr, low_conf_regions)
        
        # Show improvement stats
        successful = sum(1 for r in reocr_results if r.success)
        print(f"    - Successful improvements: {successful}/{len(reocr_results)}")
    else:
        print("  ✓ Stage 3: No low-confidence regions found, skipping re-OCR")
    
    # Stage 4: Result fusion
    print("  🔀 Stage 4: Confidence-weighted result fusion...")
    fusion = ResultFusion(confidence_delta_threshold=0.1)
    fused_regions = fusion.merge_text_regions(all_regions, reocr_results)
    annotated_text = fusion.annotate_confidence(fused_regions, include_source=False)
    fusion_metadata = fusion.generate_fusion_metadata(fused_regions, reocr_results)
    
    print(f"    - Re-OCR selection rate: {fusion_metadata['reocr_selection_rate']:.1f}%")
    
    return {
        'text': ' '.join([r.text for r in fused_regions]),
        'annotated_text': annotated_text,
        'fused_regions': fused_regions,
        'confidence_stats': stats,
        'fusion_metadata': fusion_metadata,
        'image_array': img_bgr
    }


def extract_pdf_with_confidence(pdf_path: str) -> Dict:
    """Extract from PDF with confidence pipeline"""
    print(f"  📄 Processing PDF with confidence pipeline...")
    
    pdf_document = fitz.open(pdf_path)
    print(f"    Total pages: {pdf_document.page_count}")
    
    # Process first page only for now (can be extended)
    page = pdf_document.load_page(0)
    pix = page.get_pixmap(dpi=300)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    pdf_document.close()
    
    # Use image pipeline
    temp_path = "temp_pdf_page.png"
    img.save(temp_path)
    result = extract_image_with_confidence(temp_path)
    os.remove(temp_path)
    
    return result


def process_document_with_patent_pipeline(file_path: str, fields: List[str]) -> Dict:
    """
    Complete patent-eligible document processing pipeline.
    
    Args:
        file_path: Path to document
        fields: List of field names to extract
    
    Returns:
        Dictionary with extracted fields and quality metadata
    """
    print(f"\n{'='*80}")
    print(f"📄 PROCESSING: {os.path.basename(file_path)} (Patent Pipeline)")
    print(f"{'='*80}")
    
    # Extract with confidence pipeline
    ocr_result = extract_text_with_confidence_pipeline(file_path)
    
    # Stage 5: Quality-aware LLM extraction
    print("  🤖 Stage 5: Quality-aware LLM field extraction...")
    llm_extractor = ConfidenceAwareLLM()
    extracted_fields = llm_extractor.extract_with_quality(
        ocr_result['fused_regions'],
        ocr_result['annotated_text'],
        fields
    )
    
    # Generate quality report
    quality_report = llm_extractor.generate_quality_report(extracted_fields)
    
    print(f"\n{'='*80}")
    print(f"📊 EXTRACTION RESULTS: {os.path.basename(file_path)}")
    print(f"{'='*80}")
    
    # Display extracted fields with quality
    for field_name, field_data in extracted_fields.items():
        quality_icon = "✅" if field_data.quality_flag == "reliable" else "⚠️" if field_data.quality_flag in ["good", "uncertain"] else "❌"
        print(f"  {quality_icon} {field_name}: {field_data.value}")
        print(f"      OCR Confidence: {field_data.ocr_confidence:.2f} | LLM Confidence: {field_data.llm_confidence} | Quality: {field_data.quality_flag}")
    
    print(f"\n{'='*80}")
    print(f"📈 QUALITY REPORT")
    print(f"{'='*80}")
    print(f"  Overall Quality: {quality_report['overall_quality']}")
    print(f"  Reliable Fields: {quality_report['reliable_fields']}/{quality_report['total_fields']}")
    print(f"  Uncertain Fields: {quality_report['uncertain_fields']}/{quality_report['total_fields']}")
    print(f"  Low Quality Fields: {quality_report['low_quality_fields']}/{quality_report['total_fields']}")
    
    return {
        'fields': extracted_fields,
        'quality_report': quality_report,
        'confidence_stats': ocr_result['confidence_stats'],
        'fusion_metadata': ocr_result['fusion_metadata']
    }


# ============================================================
# 🔹 FILE OPERATIONS
# ============================================================

def save_results_with_quality(file_path: str, results: Dict):
    """Save extraction results with quality metadata"""
    base_name = os.path.splitext(file_path)[0]
    
    # Save extracted fields with quality
    output_json = base_name + "_patent_extracted.json"
    
    fields_dict = {}
    for field_name, field_data in results['fields'].items():
        fields_dict[field_name] = {
            'value': field_data.value,
            'ocr_confidence': float(field_data.ocr_confidence),  # Convert numpy float32 to Python float
            'llm_confidence': field_data.llm_confidence,
            'quality_flag': field_data.quality_flag
        }
    
    # Convert numpy types in stats to Python types
    confidence_stats = {
        k: float(v) if isinstance(v, (np.floating, np.integer)) else v
        for k, v in results['confidence_stats'].items()
    }
    
    fusion_metadata = {
        k: float(v) if isinstance(v, (np.floating, np.integer)) else v
        for k, v in results['fusion_metadata'].items()
    }
    
    output_data = {
        'extracted_fields': fields_dict,
        'quality_report': results['quality_report'],
        'confidence_statistics': confidence_stats,
        'fusion_metadata': fusion_metadata
    }
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=4, ensure_ascii=False)
    
    print(f"  ✅ Results saved to: {output_json}")


# ============================================================
# 🔹 USER INPUT
# ============================================================

def get_file_paths() -> List[str]:
    """Get file paths from user"""
    print("\n" + "=" * 80)
    print("📂 FILE SELECTION")
    print("=" * 80)
    
    default_files = [
        r"10th_long_memo.pdf",
        r"Screenshot 2025-10-07 211503.png"
    ]
    
    existing_defaults = [f for f in default_files if os.path.exists(f)]
    
    if existing_defaults:
        print(f"\nDefault files found: {len(existing_defaults)}")
        for f in existing_defaults:
            print(f"  - {f}")
        print("\nPress Enter to use default files, or type file paths (comma-separated):")
    else:
        print("\nEnter file paths (comma-separated):")
    
    user_input = input("> ").strip()
    
    if not user_input and existing_defaults:
        return existing_defaults
    elif user_input:
        paths = [p.strip().strip('"').strip("'") for p in user_input.split(",")]
        valid_paths = [p for p in paths if os.path.exists(p)]
        return valid_paths
    else:
        return []


def get_fields_to_extract() -> List[str]:
    """Get field names from user"""
    print("\n" + "=" * 80)
    print("🔍 FIELD SELECTION")
    print("=" * 80)
    print("\nEnter the fields you want to extract (comma-separated):")
    print("Examples: Name, Father Name, School, Date of Birth, CGPA")
    
    user_input = input("> ").strip()
    
    if not user_input:
        return ["Name", "Father Name", "Mother Name", "School"]
    
    fields = [f.strip() for f in user_input.split(",") if f.strip()]
    return fields


# ============================================================
# 🔹 MAIN EXECUTION
# ============================================================

def main():
    """Main execution with patent-eligible pipeline"""
    print("\n" + "=" * 80)
    print("🚀 FILETRACT - PATENT-ELIGIBLE CONFIDENCE-WEIGHTED OCR PIPELINE")
    print("=" * 80)
    print("\nPatent-Pending Features:")
    print("  ✓ Hierarchical confidence-weighted extraction")
    print("  ✓ Spatial confidence mapping with Gaussian kernel")
    print("  ✓ Adaptive re-OCR with parameter optimization")
    print("  ✓ Confidence-weighted result fusion")
    print("  ✓ Quality-aware LLM extraction")
    
    # Get files
    file_paths = get_file_paths()
    if not file_paths:
        print("\n❌ No valid files to process.")
        return
    
    # Get fields
    fields = get_fields_to_extract()
    if not fields:
        print("\n❌ No fields specified.")
        return
    
    print(f"\n✅ Processing {len(file_paths)} file(s) with {len(fields)} field(s)")
    
    # Process each file
    for file_path in file_paths:
        try:
            results = process_document_with_patent_pipeline(file_path, fields)
            save_results_with_quality(file_path, results)
        except Exception as e:
            print(f"\n❌ Error processing {file_path}: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n{'='*80}")
    print("✅ PROCESSING COMPLETE")
    print(f"{'='*80}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Process interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
