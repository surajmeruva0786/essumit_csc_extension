"""
Result Fusion Module
Part of Patent-Eligible OCR Pipeline

Merges baseline and re-OCR results using confidence-weighted logic.
"""

import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

from confidence_analyzer import ConfidenceRegion
from adaptive_reocr_engine import ReOCRResult


@dataclass
class FusedRegion:
    """Represents a fused text region with confidence metadata"""
    text: str
    confidence: float
    source: str  # 'baseline' or 're-ocr'
    bbox: Tuple[int, int, int, int]


class ResultFusion:
    """
    Merges baseline and re-OCR results using confidence logic.
    
    Patent-eligible component: Confidence-weighted fusion algorithm.
    """
    
    def __init__(self, confidence_delta_threshold: float = 0.1):
        """
        Initialize result fusion engine.
        
        Args:
            confidence_delta_threshold: Minimum improvement to prefer re-OCR
        """
        self.confidence_delta_threshold = confidence_delta_threshold
    
    def compare_results(self,
                       baseline_region: ConfidenceRegion,
                       reocr_result: ReOCRResult) -> str:
        """
        Compare baseline and re-OCR results to select best.
        
        Patent-eligible decision logic: Uses confidence delta, not simple max.
        
        Args:
            baseline_region: Original ConfidenceRegion
            reocr_result: ReOCRResult from adaptive re-OCR
        
        Returns:
            'baseline' or 're-ocr'
        """
        # Calculate confidence delta
        delta = reocr_result.new_confidence - baseline_region.mean_confidence
        
        # Select based on delta threshold
        if delta > self.confidence_delta_threshold:
            return 're-ocr'
        else:
            return 'baseline'
    
    def merge_text_regions(self,
                          all_regions: List[ConfidenceRegion],
                          reocr_results: List[ReOCRResult]) -> List[FusedRegion]:
        """
        Merge baseline and re-OCR results into fused regions.
        
        Args:
            all_regions: All ConfidenceRegion objects (high and low confidence)
            reocr_results: ReOCRResult objects for low-confidence regions
        
        Returns:
            List of FusedRegion objects
        """
        fused_regions = []
        
        # Create lookup for re-OCR results
        reocr_lookup = {r.region_id: r for r in reocr_results}
        
        low_conf_idx = 0
        for region in all_regions:
            if region.is_low_confidence and low_conf_idx in reocr_lookup:
                # This region was re-processed
                reocr_result = reocr_lookup[low_conf_idx]
                
                # Compare and select
                source = self.compare_results(region, reocr_result)
                
                if source == 're-ocr':
                    fused = FusedRegion(
                        text=reocr_result.new_text,
                        confidence=reocr_result.new_confidence,
                        source='re-ocr',
                        bbox=region.bbox
                    )
                else:
                    fused = FusedRegion(
                        text=region.text,
                        confidence=region.mean_confidence,
                        source='baseline',
                        bbox=region.bbox
                    )
                
                low_conf_idx += 1
            else:
                # High confidence region, use baseline
                fused = FusedRegion(
                    text=region.text,
                    confidence=region.mean_confidence,
                    source='baseline',
                    bbox=region.bbox
                )
            
            fused_regions.append(fused)
        
        return fused_regions
    
    def annotate_confidence(self,
                           fused_regions: List[FusedRegion],
                           include_source: bool = True) -> str:
        """
        Create confidence-annotated text representation.
        
        Args:
            fused_regions: List of FusedRegion objects
            include_source: Whether to include source annotation
        
        Returns:
            Confidence-annotated text string
        """
        annotated_parts = []
        
        for region in fused_regions:
            if include_source:
                annotation = f"[conf:{region.confidence:.2f}|src:{region.source}]"
            else:
                annotation = f"[conf:{region.confidence:.2f}]"
            
            annotated_parts.append(f"{region.text} {annotation}")
        
        return ' '.join(annotated_parts)
    
    def generate_fusion_metadata(self,
                                fused_regions: List[FusedRegion],
                                reocr_results: List[ReOCRResult]) -> Dict:
        """
        Generate metadata about the fusion process.
        
        Returns:
            Dictionary with fusion statistics
        """
        total_regions = len(fused_regions)
        reocr_selected = sum(1 for r in fused_regions if r.source == 're-ocr')
        baseline_selected = total_regions - reocr_selected
        
        # Calculate average confidence
        avg_confidence = np.mean([r.confidence for r in fused_regions])
        
        # Calculate improvement statistics
        successful_improvements = sum(1 for r in reocr_results if r.success)
        total_reocr_attempts = len(reocr_results)
        
        return {
            'total_regions': total_regions,
            'reocr_selected': reocr_selected,
            'baseline_selected': baseline_selected,
            'reocr_selection_rate': (reocr_selected / total_regions * 100) if total_regions > 0 else 0,
            'average_confidence': avg_confidence,
            'successful_improvements': successful_improvements,
            'total_reocr_attempts': total_reocr_attempts,
            'improvement_success_rate': (successful_improvements / total_reocr_attempts * 100) if total_reocr_attempts > 0 else 0
        }
