"""
Confidence Analyzer Module
Part of Patent-Eligible OCR Pipeline

Analyzes OCR confidence scores and identifies regions requiring re-processing.
Implements spatial confidence mapping with Gaussian kernel smoothing.
"""

import numpy as np
from scipy.ndimage import gaussian_filter
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass


@dataclass
class ConfidenceRegion:
    """Represents a spatial region with confidence metadata"""
    bbox: Tuple[int, int, int, int]  # (x, y, width, height)
    text: str
    mean_confidence: float
    char_confidences: List[float]
    is_low_confidence: bool


class ConfidenceAnalyzer:
    """
    Analyzes OCR confidence scores using spatial mapping and kernel smoothing.
    
    This is a core component of the patent-eligible confidence-weighted pipeline.
    """
    
    def __init__(self, 
                 low_confidence_threshold: float = 0.75,
                 kernel_sigma: float = 5.0):
        """
        Initialize confidence analyzer.
        
        Args:
            low_confidence_threshold: Threshold below which regions are flagged
            kernel_sigma: Standard deviation for Gaussian smoothing kernel
        """
        self.low_confidence_threshold = low_confidence_threshold
        self.kernel_sigma = kernel_sigma
    
    def generate_confidence_map(self, 
                                ocr_data: Dict,
                                image_dimensions: Tuple[int, int]) -> np.ndarray:
        """
        Generate 2D spatial confidence map from OCR data.
        
        Patent-eligible method: Maps character-level confidences to spatial grid
        and applies Gaussian kernel smoothing for region-based analysis.
        
        Args:
            ocr_data: Dictionary with 'text', 'conf', 'left', 'top', 'width', 'height'
            image_dimensions: (width, height) of original image
        
        Returns:
            2D numpy array representing confidence heatmap
        """
        width, height = image_dimensions
        confidence_grid = np.zeros((height, width), dtype=np.float32)
        count_grid = np.zeros((height, width), dtype=np.int32)
        
        # Map confidence scores to spatial positions
        for i in range(len(ocr_data['text'])):
            if ocr_data['text'][i].strip() == '':
                continue
            
            conf = float(ocr_data['conf'][i]) / 100.0  # Normalize to 0-1
            if conf < 0:  # Tesseract returns -1 for invalid
                conf = 0.0
            
            x = ocr_data['left'][i]
            y = ocr_data['top'][i]
            w = ocr_data['width'][i]
            h = ocr_data['height'][i]
            
            # Fill bounding box region with confidence value
            y_end = min(y + h, height)
            x_end = min(x + w, width)
            
            confidence_grid[y:y_end, x:x_end] += conf
            count_grid[y:y_end, x:x_end] += 1
        
        # Average overlapping regions
        mask = count_grid > 0
        confidence_grid[mask] /= count_grid[mask]
        
        # Apply Gaussian smoothing (patent-eligible spatial aggregation)
        smoothed_map = gaussian_filter(confidence_grid, sigma=self.kernel_sigma)
        
        return smoothed_map
    
    def identify_low_confidence_regions(self,
                                       confidence_map: np.ndarray,
                                       ocr_data: Dict,
                                       min_region_size: int = 100) -> List[ConfidenceRegion]:
        """
        Identify contiguous low-confidence regions from confidence map.
        
        Patent-eligible method: Uses spatial confidence aggregation to identify
        regions requiring adaptive re-processing.
        
        Args:
            confidence_map: 2D confidence heatmap
            ocr_data: Original OCR data
            min_region_size: Minimum region size in pixels
        
        Returns:
            List of ConfidenceRegion objects
        """
        regions = []
        
        # Analyze each word/text block
        for i in range(len(ocr_data['text'])):
            text = ocr_data['text'][i].strip()
            if text == '':
                continue
            
            x = ocr_data['left'][i]
            y = ocr_data['top'][i]
            w = ocr_data['width'][i]
            h = ocr_data['height'][i]
            
            # Skip very small regions
            if w * h < min_region_size:
                continue
            
            # Extract region from confidence map
            region_conf = confidence_map[y:y+h, x:x+w]
            mean_conf = np.mean(region_conf)
            
            # Get character-level confidences
            word_conf = float(ocr_data['conf'][i]) / 100.0
            char_confs = [word_conf] * len(text)  # Approximate
            
            is_low = mean_conf < self.low_confidence_threshold
            
            region = ConfidenceRegion(
                bbox=(x, y, w, h),
                text=text,
                mean_confidence=mean_conf,
                char_confidences=char_confs,
                is_low_confidence=is_low
            )
            
            regions.append(region)
        
        return regions
    
    def compute_spatial_kernel(self, 
                              region_size: Tuple[int, int],
                              kernel_type: str = 'gaussian') -> np.ndarray:
        """
        Compute spatial weighting kernel for confidence aggregation.
        
        Args:
            region_size: (width, height) of region
            kernel_type: Type of kernel ('gaussian', 'uniform')
        
        Returns:
            2D kernel array
        """
        h, w = region_size
        
        if kernel_type == 'gaussian':
            # Create 2D Gaussian kernel
            y, x = np.ogrid[-h//2:h//2, -w//2:w//2]
            kernel = np.exp(-(x*x + y*y) / (2 * self.kernel_sigma**2))
            kernel = kernel / kernel.sum()
        else:
            # Uniform kernel
            kernel = np.ones((h, w)) / (h * w)
        
        return kernel
    
    def get_confidence_statistics(self, regions: List[ConfidenceRegion]) -> Dict:
        """
        Compute statistical summary of confidence across regions.
        
        Returns:
            Dictionary with confidence statistics
        """
        if not regions:
            return {
                'mean_confidence': 0.0,
                'min_confidence': 0.0,
                'max_confidence': 0.0,
                'low_confidence_count': 0,
                'total_regions': 0
            }
        
        confidences = [r.mean_confidence for r in regions]
        low_conf_count = sum(1 for r in regions if r.is_low_confidence)
        
        return {
            'mean_confidence': np.mean(confidences),
            'min_confidence': np.min(confidences),
            'max_confidence': np.max(confidences),
            'std_confidence': np.std(confidences),
            'low_confidence_count': low_conf_count,
            'total_regions': len(regions),
            'low_confidence_percentage': (low_conf_count / len(regions)) * 100
        }
