"""
Adaptive Re-OCR Engine Module
Part of Patent-Eligible OCR Pipeline

Performs selective re-OCR on low-confidence regions with optimized parameters.
"""

import pytesseract
from pytesseract import Output
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Tuple, Optional
from dataclasses import dataclass

from image_quality_analyzer import ImageQualityAnalyzer, QualityMetrics, PreprocessingRecommendation
from confidence_analyzer import ConfidenceRegion


@dataclass
class ReOCRResult:
    """Result of adaptive re-OCR operation"""
    region_id: int
    original_text: str
    new_text: str
    original_confidence: float
    new_confidence: float
    confidence_improvement: float
    parameters_used: Dict
    success: bool


class AdaptiveReOCREngine:
    """
    Performs selective re-OCR with parameter optimization.
    
    Patent-eligible component: Heuristic parameter selection based on quality metrics.
    """
    
    def __init__(self, tesseract_cmd: str = None):
        """
        Initialize adaptive re-OCR engine.
        
        Args:
            tesseract_cmd: Path to Tesseract executable (optional, auto-detected if not provided)
        """
        # Auto-detect Tesseract path if not provided
        if tesseract_cmd is None:
            import os
            # Check if running in Docker
            if os.path.exists('/.dockerenv'):
                tesseract_cmd = 'tesseract'
            elif os.environ.get('TESSERACT_CMD'):
                tesseract_cmd = os.environ.get('TESSERACT_CMD')
            elif os.name == 'nt':
                tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            else:
                tesseract_cmd = 'tesseract'
        
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        self.quality_analyzer = ImageQualityAnalyzer()
        self.confidence_improvement_threshold = 0.1  # Minimum improvement to accept
    
    def select_ocr_parameters(self, 
                             quality_metrics: QualityMetrics) -> Dict:
        """
        Select optimal OCR parameters based on quality metrics.
        
        Patent-eligible heuristic: Maps image quality to OCR configuration.
        
        Args:
            quality_metrics: QualityMetrics object
        
        Returns:
            Dictionary of OCR parameters
        """
        # Get preprocessing recommendation
        recommendation = self.quality_analyzer.suggest_preprocessing(quality_metrics)
        
        # Build parameter dictionary
        params = {
            'dpi': recommendation.recommended_dpi,
            'apply_clahe': recommendation.apply_clahe,
            'apply_sharpen': recommendation.apply_sharpen,
            'apply_denoise': recommendation.apply_denoise,
            'psm': 6,  # Assume uniform block of text
            'oem': 3   # Default OCR Engine Mode
        }
        
        # Adjust PSM based on metrics
        if quality_metrics.edge_density < 0.2:
            params['psm'] = 7  # Single line mode for very degraded text
        
        return params
    
    def reocr_region(self,
                    original_image: np.ndarray,
                    region: ConfidenceRegion,
                    region_id: int) -> ReOCRResult:
        """
        Re-process a low-confidence region with optimized parameters.
        
        Args:
            original_image: Full document image
            region: ConfidenceRegion object
            region_id: Unique identifier for region
        
        Returns:
            ReOCRResult object
        """
        x, y, w, h = region.bbox
        
        # Extract region from original image
        region_image = original_image[y:y+h, x:x+w]
        
        # Compute quality metrics
        quality_metrics = self.quality_analyzer.compute_metrics(region_image)
        
        # Select optimal parameters
        ocr_params = self.select_ocr_parameters(quality_metrics)
        
        # Apply preprocessing
        recommendation = self.quality_analyzer.suggest_preprocessing(quality_metrics)
        preprocessed = self.quality_analyzer.apply_preprocessing(region_image, recommendation)
        
        # Resize if DPI change recommended
        if ocr_params['dpi'] > 300:
            scale = ocr_params['dpi'] / 300
            new_w = int(preprocessed.shape[1] * scale)
            new_h = int(preprocessed.shape[0] * scale)
            preprocessed = cv2.resize(preprocessed, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        
        # Perform OCR with optimized parameters
        try:
            custom_config = f'--psm {ocr_params["psm"]} --oem {ocr_params["oem"]}'
            
            # Get detailed OCR data
            ocr_data = pytesseract.image_to_data(
                preprocessed,
                output_type=Output.DICT,
                config=custom_config
            )
            
            # Extract text and confidence
            new_text = ' '.join([
                ocr_data['text'][i] 
                for i in range(len(ocr_data['text'])) 
                if ocr_data['text'][i].strip() != ''
            ])
            
            # Calculate average confidence
            valid_confs = [
                float(ocr_data['conf'][i]) / 100.0
                for i in range(len(ocr_data['conf']))
                if ocr_data['text'][i].strip() != '' and ocr_data['conf'][i] >= 0
            ]
            
            new_confidence = np.mean(valid_confs) if valid_confs else 0.0
            
            # Calculate improvement
            improvement = new_confidence - region.mean_confidence
            success = improvement > self.confidence_improvement_threshold
            
            return ReOCRResult(
                region_id=region_id,
                original_text=region.text,
                new_text=new_text if success else region.text,
                original_confidence=region.mean_confidence,
                new_confidence=new_confidence,
                confidence_improvement=improvement,
                parameters_used=ocr_params,
                success=success
            )
            
        except Exception as e:
            print(f"  ⚠ Re-OCR failed for region {region_id}: {e}")
            return ReOCRResult(
                region_id=region_id,
                original_text=region.text,
                new_text=region.text,
                original_confidence=region.mean_confidence,
                new_confidence=region.mean_confidence,
                confidence_improvement=0.0,
                parameters_used=ocr_params,
                success=False
            )
    
    def batch_reocr(self,
                   original_image: np.ndarray,
                   low_confidence_regions: list) -> list:
        """
        Perform adaptive re-OCR on multiple regions.
        
        Args:
            original_image: Full document image
            low_confidence_regions: List of ConfidenceRegion objects
        
        Returns:
            List of ReOCRResult objects
        """
        results = []
        
        for idx, region in enumerate(low_confidence_regions):
            result = self.reocr_region(original_image, region, idx)
            results.append(result)
        
        return results
