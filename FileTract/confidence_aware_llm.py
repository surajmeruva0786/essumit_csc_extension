"""
Confidence-Aware LLM Module
Part of Patent-Eligible OCR Pipeline

Constructs confidence-aware prompts and extracts fields with quality metadata.
"""

import json
import google.generativeai as genai
from typing import List, Dict, Any
from dataclasses import dataclass

from result_fusion import FusedRegion


@dataclass
class FieldWithQuality:
    """Extracted field with quality metadata"""
    value: str
    ocr_confidence: float
    llm_confidence: str  # 'high', 'medium', 'low'
    quality_flag: str  # 'reliable', 'uncertain', 'low-quality'


class ConfidenceAwareLLM:
    """
    LLM extraction with confidence metadata integration.
    
    Patent-eligible component: Confidence injection into LLM prompts.
    """
    
    def __init__(self, model_name: str = 'gemini-2.5-flash'):
        """
        Initialize confidence-aware LLM extractor.
        
        Args:
            model_name: Gemini model to use
        """
        self.model = genai.GenerativeModel(model_name)
        self.low_confidence_threshold = 0.75
        self.medium_confidence_threshold = 0.85
    
    def build_confidence_prompt(self,
                               fused_regions: List[FusedRegion],
                               fields: List[str],
                               annotated_text: str) -> str:
        """
        Build LLM prompt with confidence annotations.
        
        Patent-eligible method: Structured confidence injection.
        
        Args:
            fused_regions: List of FusedRegion objects
            fields: Field names to extract
            annotated_text: Confidence-annotated text
        
        Returns:
            Formatted prompt string
        """
        fields_list = ", ".join(fields)
        
        # Calculate confidence statistics
        low_conf_count = sum(1 for r in fused_regions if r.confidence < self.low_confidence_threshold)
        total_regions = len(fused_regions)
        
        prompt = f"""You are an expert at extracting structured data from OCR text with quality awareness.

The following text was extracted using OCR. Each text segment is annotated with its confidence score (0.0-1.0).
Confidence scores indicate OCR reliability: >0.85 is high quality, 0.75-0.85 is medium, <0.75 is low quality.

DOCUMENT QUALITY SUMMARY:
- Total text regions: {total_regions}
- Low confidence regions: {low_conf_count}
- Overall quality: {"Good" if low_conf_count / total_regions < 0.2 else "Fair" if low_conf_count / total_regions < 0.5 else "Poor"}

OCR TEXT WITH CONFIDENCE ANNOTATIONS:
{annotated_text}

TASK: Extract the following fields from the above text:
{fields_list}

INSTRUCTIONS:
1. For each field, extract the most likely value from the OCR text
2. Consider confidence scores when making extraction decisions
3. If a field value comes from low-confidence text (conf < 0.75), note this uncertainty
4. Return a JSON object with the following structure for each field:
   {{
     "field_name": {{
       "value": "extracted value or null if not found",
       "llm_confidence": "high|medium|low",
       "notes": "any relevant notes about extraction quality"
     }}
   }}

5. Do NOT include markdown formatting or code blocks, return only the raw JSON object

EXAMPLE OUTPUT:
{{"Name": {{"value": "JOHN DOE", "llm_confidence": "high", "notes": ""}}, "School": {{"value": "ABC School", "llm_confidence": "medium", "notes": "OCR confidence was low"}}}}

Now extract the fields and return the JSON:"""
        
        return prompt
    
    def extract_with_quality(self,
                            fused_regions: List[FusedRegion],
                            annotated_text: str,
                            fields: List[str]) -> Dict[str, FieldWithQuality]:
        """
        Extract fields with quality awareness.
        
        Args:
            fused_regions: List of FusedRegion objects
            annotated_text: Confidence-annotated text
            fields: Field names to extract
        
        Returns:
            Dictionary mapping field names to FieldWithQuality objects
        """
        # Build prompt
        prompt = self.build_confidence_prompt(fused_regions, fields, annotated_text)
        
        try:
            # Call Gemini API
            print("  🤖 Sending confidence-aware request to Gemini API...")
            response = self.model.generate_content(prompt)
            
            # Parse response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            elif response_text.startswith("```"):
                response_text = response_text[3:]
            
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            llm_output = json.loads(response_text)
            
            # Convert to FieldWithQuality objects
            result = {}
            for field_name in fields:
                if field_name in llm_output:
                    field_data = llm_output[field_name]
                    
                    # Find OCR confidence for this field value
                    ocr_conf = self._find_ocr_confidence(
                        field_data.get('value'),
                        fused_regions
                    )
                    
                    # Determine quality flag
                    quality_flag = self._determine_quality_flag(
                        ocr_conf,
                        field_data.get('llm_confidence', 'medium')
                    )
                    
                    result[field_name] = FieldWithQuality(
                        value=field_data.get('value'),
                        ocr_confidence=ocr_conf,
                        llm_confidence=field_data.get('llm_confidence', 'medium'),
                        quality_flag=quality_flag
                    )
                else:
                    # Field not found
                    result[field_name] = FieldWithQuality(
                        value=None,
                        ocr_confidence=0.0,
                        llm_confidence='low',
                        quality_flag='not-found'
                    )
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"  ⚠ Error parsing LLM response: {e}")
            print(f"  Response: {response_text[:200]}...")
            return {field: FieldWithQuality(None, 0.0, 'low', 'error') for field in fields}
        except Exception as e:
            print(f"  ❌ Error calling Gemini API: {e}")
            return {field: FieldWithQuality(None, 0.0, 'low', 'error') for field in fields}
    
    def _find_ocr_confidence(self, value: str, fused_regions: List[FusedRegion]) -> float:
        """Find OCR confidence for an extracted value"""
        if not value:
            return 0.0
        
        # Find regions containing this value
        matching_regions = [
            r for r in fused_regions 
            if value.lower() in r.text.lower()
        ]
        
        if matching_regions:
            return max(r.confidence for r in matching_regions)
        else:
            return 0.5  # Default if not found
    
    def _determine_quality_flag(self, ocr_conf: float, llm_conf: str) -> str:
        """Determine overall quality flag"""
        if ocr_conf >= self.medium_confidence_threshold and llm_conf == 'high':
            return 'reliable'
        elif ocr_conf >= self.low_confidence_threshold and llm_conf in ['high', 'medium']:
            return 'good'
        elif ocr_conf >= self.low_confidence_threshold or llm_conf == 'medium':
            return 'uncertain'
        else:
            return 'low-quality'
    
    def generate_quality_report(self, extracted_fields: Dict[str, FieldWithQuality]) -> Dict:
        """Generate quality report for extracted fields"""
        total_fields = len(extracted_fields)
        reliable_count = sum(1 for f in extracted_fields.values() if f.quality_flag == 'reliable')
        uncertain_count = sum(1 for f in extracted_fields.values() if f.quality_flag in ['uncertain', 'good'])
        low_quality_count = sum(1 for f in extracted_fields.values() if f.quality_flag == 'low-quality')
        not_found_count = sum(1 for f in extracted_fields.values() if f.value is None)
        
        return {
            'total_fields': total_fields,
            'reliable_fields': reliable_count,
            'uncertain_fields': uncertain_count,
            'low_quality_fields': low_quality_count,
            'not_found_fields': not_found_count,
            'overall_quality': 'High' if reliable_count / total_fields > 0.7 else 'Medium' if reliable_count / total_fields > 0.4 else 'Low'
        }
