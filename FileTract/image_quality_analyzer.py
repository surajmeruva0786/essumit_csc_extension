"""
Image Quality Analyzer Module
Part of Patent-Eligible OCR Pipeline

Computes image quality metrics to guide OCR parameter optimization.
"""

import cv2
import numpy as np
from typing import Dict, Tuple
from dataclasses import dataclass
from PIL import Image


@dataclass
class QualityMetrics:
    """Image quality metrics for a region"""
    contrast_ratio: float
    edge_density: float
    noise_level: float
    brightness: float
    sharpness: float


@dataclass
class PreprocessingRecommendation:
    """Recommended preprocessing steps"""
    apply_clahe: bool
    apply_sharpen: bool
    apply_denoise: bool
    increase_dpi: bool
    recommended_dpi: int


class ImageQualityAnalyzer:
    """
    Analyzes image quality to determine optimal OCR parameters.
    
    Patent-eligible component: Maps quality metrics to preprocessing strategies.
    """
    
    def __init__(self,
                 contrast_threshold: float = 2.0,
                 edge_threshold: float = 0.3,
                 noise_threshold: float = 0.15):
        """
        Initialize quality analyzer with thresholds.
        
        Args:
            contrast_threshold: Minimum acceptable contrast ratio
            edge_threshold: Minimum acceptable edge density
            noise_threshold: Maximum acceptable noise level
        """
        self.contrast_threshold = contrast_threshold
        self.edge_threshold = edge_threshold
        self.noise_threshold = noise_threshold
    
    def compute_metrics(self, image_region: np.ndarray) -> QualityMetrics:
        """
        Compute comprehensive quality metrics for an image region.
        
        Args:
            image_region: Numpy array (grayscale or BGR)
        
        Returns:
            QualityMetrics object
        """
        # Convert to grayscale if needed
        if len(image_region.shape) == 3:
            gray = cv2.cvtColor(image_region, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_region
        
        # Compute metrics
        contrast = self._compute_contrast_ratio(gray)
        edge_density = self._compute_edge_density(gray)
        noise = self._compute_noise_level(gray)
        brightness = self._compute_brightness(gray)
        sharpness = self._compute_sharpness(gray)
        
        return QualityMetrics(
            contrast_ratio=contrast,
            edge_density=edge_density,
            noise_level=noise,
            brightness=brightness,
            sharpness=sharpness
        )
    
    def _compute_contrast_ratio(self, gray: np.ndarray) -> float:
        """
        Compute contrast ratio: (max - min) / (max + min)
        
        Higher values indicate better contrast.
        """
        min_val = float(np.min(gray))
        max_val = float(np.max(gray))
        
        # Handle edge cases to avoid overflow
        if max_val + min_val == 0 or max_val == min_val:
            return 0.0
        
        contrast = (max_val - min_val) / (max_val + min_val)
        return float(contrast)
    
    def _compute_edge_density(self, gray: np.ndarray) -> float:
        """
        Compute edge density using Sobel operator.
        
        Lower values may indicate blur.
        """
        # Sobel edge detection
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
        # Magnitude
        magnitude = np.sqrt(sobelx**2 + sobely**2)
        
        # Normalize by image size
        edge_density = np.mean(magnitude) / 255.0
        
        return float(edge_density)
    
    def _compute_noise_level(self, gray: np.ndarray) -> float:
        """
        Estimate noise level using local variance.
        
        Higher values indicate more noise.
        """
        # Compute local variance using a sliding window
        kernel_size = 5
        mean = cv2.blur(gray.astype(np.float32), (kernel_size, kernel_size))
        sqr_mean = cv2.blur((gray.astype(np.float32))**2, (kernel_size, kernel_size))
        variance = sqr_mean - mean**2
        
        # Average variance as noise estimate
        noise = np.mean(variance) / (255.0 ** 2)
        
        return float(noise)
    
    def _compute_brightness(self, gray: np.ndarray) -> float:
        """Compute average brightness (0-1 scale)"""
        return float(np.mean(gray) / 255.0)
    
    def _compute_sharpness(self, gray: np.ndarray) -> float:
        """
        Compute sharpness using Laplacian variance.
        
        Higher values indicate sharper images.
        """
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        sharpness = np.var(laplacian) / (255.0 ** 2)
        
        return float(sharpness)
    
    def suggest_preprocessing(self, metrics: QualityMetrics) -> PreprocessingRecommendation:
        """
        Suggest preprocessing steps based on quality metrics.
        
        Patent-eligible heuristic: Maps quality metrics to OCR parameters.
        
        Args:
            metrics: QualityMetrics object
        
        Returns:
            PreprocessingRecommendation object
        """
        # CLAHE for low contrast
        apply_clahe = metrics.contrast_ratio < self.contrast_threshold
        
        # Sharpening for low edge density (blur)
        apply_sharpen = metrics.edge_density < self.edge_threshold
        
        # Denoising for high noise
        apply_denoise = metrics.noise_level > self.noise_threshold
        
        # Increase DPI for low sharpness
        increase_dpi = metrics.sharpness < 0.1
        recommended_dpi = 600 if increase_dpi else 300
        
        return PreprocessingRecommendation(
            apply_clahe=apply_clahe,
            apply_sharpen=apply_sharpen,
            apply_denoise=apply_denoise,
            increase_dpi=increase_dpi,
            recommended_dpi=recommended_dpi
        )
    
    def apply_preprocessing(self, 
                           image: np.ndarray,
                           recommendation: PreprocessingRecommendation) -> np.ndarray:
        """
        Apply recommended preprocessing to image.
        
        Args:
            image: Input image (BGR or grayscale)
            recommendation: PreprocessingRecommendation object
        
        Returns:
            Preprocessed image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            processed = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            processed = image.copy()
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        if recommendation.apply_clahe:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            processed = clahe.apply(processed)
        
        # Apply denoising
        if recommendation.apply_denoise:
            processed = cv2.fastNlMeansDenoising(processed, h=10)
        
        # Apply sharpening
        if recommendation.apply_sharpen:
            kernel = np.array([[-1, -1, -1],
                             [-1,  9, -1],
                             [-1, -1, -1]])
            processed = cv2.filter2D(processed, -1, kernel)
        
        return processed
