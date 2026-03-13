# FileTract Patent Strategy Document
## Novel Technical Mechanisms for OCR + LLM Document Intelligence

**Prepared for**: Patent Attorney Review  
**System**: FileTract - Multi-File OCR with AI Field Extraction  
**Date**: December 23, 2025

---

## I. PATENT-ELIGIBLE PROBLEM STATEMENTS

### Problem 1: OCR Error Propagation in Multi-Field Extraction
**Technical Deficiency**: When OCR engines misrecognize characters in scanned documents (e.g., "O" as "0", "l" as "1"), these errors propagate to downstream LLM field extraction, causing the LLM to extract incorrect values or hallucinate corrections based on corrupted input text. Current systems lack mechanisms to detect, quantify, and selectively correct OCR errors before LLM processing, resulting in unreliable structured data extraction.

**Patent-Eligible Aspect**: The problem is not abstract; it involves specific technical challenges in multi-stage document processing pipelines where error accumulation degrades system output quality in measurable ways.

### Problem 2: Field Ambiguity Resolution in Unstructured Documents
**Technical Deficiency**: In documents with inconsistent layouts (certificates, forms, handwritten notes), the same text string may represent different semantic fields depending on spatial position, surrounding context, and document type. LLMs lack spatial awareness and cannot reliably disambiguate "08/08/2002" as a date-of-birth versus issue-date without additional structural information beyond raw OCR text.

**Patent-Eligible Aspect**: Addresses the technical challenge of integrating spatial metadata with semantic extraction in a deterministic, reproducible manner.

### Problem 3: Confidence-Based Selective Re-OCR
**Technical Deficiency**: OCR engines produce character-level confidence scores, but current systems either ignore these scores or apply uniform quality thresholds. When processing mixed-quality documents (degraded scans, watermarks, poor lighting), valuable information exists in low-confidence regions that could be recovered through targeted re-processing with different OCR parameters, but no systematic method exists to identify which regions warrant re-OCR and with what parameter adjustments.

**Patent-Eligible Aspect**: Involves technical decision-making about resource allocation and parameter optimization in multi-pass document processing.

### Problem 4: LLM Hallucination Detection via Cross-Document Consistency
**Technical Deficiency**: When LLMs extract fields from multiple similar documents (e.g., batch processing 100 certificates), they may hallucinate plausible but incorrect values for missing fields. Current systems lack mechanisms to detect such hallucinations by analyzing statistical consistency patterns across document batches and flagging outlier extractions for verification.

**Patent-Eligible Aspect**: Addresses the technical problem of validating LLM outputs through deterministic cross-document analysis rather than relying solely on single-document confidence.

### Problem 5: Adaptive Field Extraction with Feedback Loop
**Technical Deficiency**: In production environments processing thousands of documents, user corrections to extracted fields represent valuable ground truth, but current systems discard this feedback. No mechanism exists to systematically capture correction patterns, identify systematic extraction errors, and dynamically adjust extraction prompts or validation rules without retraining models.

**Patent-Eligible Aspect**: Involves creating a technical feedback system that modifies extraction behavior based on observed error patterns in a deterministic, rule-based manner.

---

## II. NOVEL TECHNICAL SOLUTIONS

### Solution 1: Hierarchical OCR Confidence-Weighted Field Extraction Pipeline

**Mechanism**:
1. **Confidence Mapping Layer**: After OCR, generate a character-level confidence map aligned with extracted text positions
2. **Confidence Aggregation**: For each potential field region, compute aggregate confidence scores using weighted spatial kernels
3. **Selective Re-OCR Decision Engine**: 
   - If field-region confidence < threshold T1, trigger re-OCR with adjusted parameters (DPI, preprocessing filters)
   - If re-OCR confidence < threshold T2, mark field as "low-confidence" and pass both OCR versions to LLM
4. **LLM Prompt Augmentation**: Inject confidence metadata into LLM prompt: "Text: [RAPOLU], Confidence: 0.87"
5. **Extraction Validation**: LLM outputs include confidence-aware field values with quality flags

**Non-Obvious Aspects**:
- Spatial confidence aggregation using kernel weighting (not simple averaging)
- Dynamic parameter selection for re-OCR based on confidence distribution patterns
- Bidirectional feedback between OCR confidence and LLM extraction logic

### Solution 2: Spatial-Semantic Field Disambiguation System

**Mechanism**:
1. **Bounding Box Preservation**: Retain OCR bounding box coordinates for all text elements
2. **Spatial Relationship Graph**: Construct directed graph where nodes = text elements, edges = spatial relationships (above, below, left-of, right-of, distance)
3. **Field Anchor Detection**: Identify "anchor keywords" (e.g., "Name:", "DOB:", "School:") with high confidence
4. **Proximity-Based Field Binding**: For each anchor, bind nearest text element within spatial threshold as candidate field value
5. **LLM Contextual Validation**: Pass spatial-bound candidates to LLM with structured prompt: "Field 'Name' has candidate 'RAPOLU SHIVA TEJA' located 15px right of anchor 'Name:'"
6. **Conflict Resolution**: If multiple candidates exist, LLM selects based on spatial proximity score + semantic plausibility

**Non-Obvious Aspects**:
- Graph-based spatial relationship encoding (not simple coordinate passing)
- Deterministic anchor-candidate binding algorithm with distance weighting
- Hybrid spatial-semantic scoring for disambiguation

### Solution 3: Multi-Pass Adaptive OCR with Region-Specific Parameter Optimization

**Mechanism**:
1. **Initial OCR Pass**: Process document at baseline parameters (300 DPI, standard preprocessing)
2. **Confidence Heatmap Generation**: Create 2D confidence heatmap of document
3. **Low-Confidence Region Segmentation**: Identify contiguous regions where confidence < threshold
4. **Parameter Space Search**:
   - For each low-confidence region, define parameter search space: {DPI: [150, 300, 600], Filters: [none, sharpen, denoise, binarize]}
   - Apply heuristic selection: if region has high contrast, try higher DPI; if blurry, try sharpen filter
5. **Selective Re-OCR**: Re-process only low-confidence regions with optimized parameters
6. **Result Fusion**: Merge high-confidence baseline results with improved re-OCR results
7. **LLM Extraction**: Pass fused text with region-specific confidence annotations

**Non-Obvious Aspects**:
- Heuristic parameter selection based on image quality metrics (contrast, blur, noise)
- Selective region re-processing (not full document re-OCR)
- Confidence-weighted result fusion algorithm

### Solution 4: Statistical Outlier Detection for LLM Hallucination Mitigation

**Mechanism**:
1. **Batch Processing Context**: When processing N similar documents, maintain extraction history
2. **Field Distribution Analysis**: For each field type (e.g., "School"), build statistical distribution of extracted values
3. **Outlier Scoring**:
   - Compute frequency of each unique value
   - Calculate edit distance to most common values
   - Assign outlier score = f(frequency, edit_distance, field_type)
4. **Hallucination Flagging**: If outlier_score > threshold AND LLM confidence < threshold, flag as potential hallucination
5. **Verification Prompt**: Re-query LLM with explicit verification: "You extracted 'XYZ School'. This is unusual in this document batch. Verify this is correct or return null."
6. **User Review Queue**: Route high-outlier-score extractions to manual review

**Non-Obvious Aspects**:
- Cross-document statistical analysis for single-field validation
- Dual-threshold gating (outlier score + LLM confidence)
- Automated verification re-prompting with batch context

### Solution 5: Dynamic Prompt Refinement via Correction Pattern Analysis

**Mechanism**:
1. **Correction Logging**: Capture all user corrections: {document_id, field_name, extracted_value, corrected_value, timestamp}
2. **Error Pattern Mining**:
   - Group corrections by field_name
   - Identify systematic patterns: e.g., "Father Name" frequently extracts "Father's Name:" (including label)
   - Compute pattern frequency and confidence
3. **Rule Generation**: If pattern frequency > threshold, generate extraction rule: "For field 'Father Name', exclude text matching regex '^Father.*Name:'"
4. **Prompt Template Update**: Dynamically inject rules into LLM prompt template:
   ```
   EXTRACTION RULES:
   - Father Name: Exclude label text, extract only person name
   - Date of Birth: Format as MM/DD/YYYY, not DD/MM/YYYY
   ```
5. **A/B Validation**: Apply updated prompts to new documents, measure correction rate reduction
6. **Rule Persistence**: Store validated rules in configuration database for future extractions

**Non-Obvious Aspects**:
- Automated rule mining from correction logs (not manual prompt engineering)
- Deterministic pattern detection with frequency thresholds
- Dynamic prompt template modification without model retraining
- Closed-loop validation of rule effectiveness

---

## III. CORE INVENTION (DETAILED)

**Selected Invention**: **Hierarchical OCR Confidence-Weighted Field Extraction Pipeline with Adaptive Re-OCR**

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT DOCUMENT (PDF/Image)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              INITIAL OCR PROCESSING MODULE                   │
│  - Tesseract OCR at baseline parameters (300 DPI)           │
│  - Extract: text, bounding boxes, character confidences     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           CONFIDENCE MAPPING & ANALYSIS MODULE               │
│  - Generate character-level confidence map                   │
│  - Compute spatial confidence kernels                        │
│  - Identify low-confidence regions (confidence < T1)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
         High Conf  │         │  Low Conf
                    ▼         ▼
         ┌──────────────┐  ┌─────────────────────────────────┐
         │  DIRECT PATH │  │  ADAPTIVE RE-OCR MODULE          │
         │              │  │  - Parameter optimization        │
         │              │  │  - Selective region re-processing│
         │              │  │  - Confidence re-evaluation      │
         └──────┬───────┘  └──────────┬──────────────────────┘
                │                     │
                └──────────┬──────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              RESULT FUSION MODULE                            │
│  - Merge high-confidence baseline + improved re-OCR         │
│  - Generate confidence-annotated text                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         CONFIDENCE-AWARE LLM EXTRACTION MODULE               │
│  - Inject confidence metadata into prompt                    │
│  - Request confidence-weighted field extraction              │
│  - Output: {field: value, confidence: score, source: ocr_version}│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              STRUCTURED OUTPUT + QUALITY FLAGS               │
│  {Name: "RAPOLU SHIVA TEJA", confidence: 0.95, quality: "high"}│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Stage 1: Initial OCR**
- Input: Document image/PDF
- Process: Tesseract OCR with parameters {DPI: 300, lang: "eng"}
- Output: 
  ```
  {
    text: "RAPOLU SHIVA TEJA...",
    char_confidences: [0.92, 0.88, 0.95, ...],
    bounding_boxes: [{x, y, w, h, text, conf}, ...],
    page_metadata: {dpi, dimensions}
  }
  ```

**Stage 2: Confidence Analysis**
- Input: OCR output with character confidences
- Process:
  1. Map character confidences to 2D spatial grid
  2. Apply Gaussian kernel smoothing (σ = 5px) to generate confidence heatmap
  3. Segment regions where mean_confidence < T1 (e.g., 0.75)
  4. For each low-confidence region, compute quality metrics:
     - Contrast ratio
     - Edge density (blur indicator)
     - Noise level (variance)
- Output:
  ```
  {
    high_conf_regions: [{bbox, text, conf}, ...],
    low_conf_regions: [{bbox, text, conf, quality_metrics}, ...],
    reocr_candidates: [{region_id, suggested_params}, ...]
  }
  ```

**Stage 3: Adaptive Re-OCR**
- Input: Low-confidence regions + quality metrics
- Process:
  1. For each candidate region:
     - If contrast_ratio < 2.0 → apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
     - If edge_density < threshold → increase DPI to 600, apply sharpening filter
     - If noise_level > threshold → apply bilateral filter (noise reduction)
  2. Extract region from original image
  3. Apply selected preprocessing
  4. Re-run OCR with optimized parameters
  5. Compare new confidence with original
- Output:
  ```
  {
    improved_regions: [{region_id, new_text, new_conf, params_used}, ...],
    failed_regions: [{region_id, reason}, ...]
  }
  ```

**Stage 4: Result Fusion**
- Input: High-confidence baseline + improved re-OCR results
- Process:
  1. For each region:
     - If re-OCR confidence > baseline confidence + δ (e.g., 0.1), use re-OCR result
     - Else, retain baseline result
  2. Reconstruct full document text with confidence annotations
  3. Mark fusion points for LLM awareness
- Output:
  ```
  {
    fused_text: "RAPOLU SHIVA TEJA [conf:0.95] ...",
    confidence_map: {char_index: confidence_score},
    fusion_metadata: {regions_improved: 3, regions_failed: 1}
  }
  ```

**Stage 5: LLM Extraction**
- Input: Confidence-annotated text + user-defined fields
- Process:
  1. Construct prompt:
     ```
     You are extracting fields from OCR text. Text segments are annotated with confidence scores.
     
     OCR TEXT (with confidence):
     RAPOLU SHIVA TEJA [conf:0.95]
     Father's Name: RAPOLU MARUTHE RAO [conf:0.82]
     School: NEW VISION CONCEPT SCHOOL [conf:0.91]
     
     FIELDS TO EXTRACT: Name, Father Name, School
     
     INSTRUCTIONS:
     - For low-confidence text (conf < 0.85), indicate uncertainty in your response
     - Return JSON with extracted values and your confidence assessment
     ```
  2. Send to Gemini API
  3. Parse JSON response
- Output:
  ```json
  {
    "Name": {"value": "RAPOLU SHIVA TEJA", "llm_confidence": "high", "ocr_confidence": 0.95},
    "Father Name": {"value": "RAPOLU MARUTHE RAO", "llm_confidence": "medium", "ocr_confidence": 0.82},
    "School": {"value": "NEW VISION CONCEPT SCHOOL", "llm_confidence": "high", "ocr_confidence": 0.91}
  }
  ```

### Decision Logic

**Re-OCR Trigger Decision**:
```
IF region_confidence < T1 (0.75) THEN
  IF quality_metrics.contrast < 2.0 THEN
    preprocessing ← CLAHE
  END IF
  
  IF quality_metrics.edge_density < 0.3 THEN
    dpi ← 600
    filters ← [sharpen, unsharp_mask]
  END IF
  
  IF quality_metrics.noise > 0.15 THEN
    filters ← filters + [bilateral_filter]
  END IF
  
  new_result ← OCR(region, dpi, preprocessing, filters)
  
  IF new_result.confidence > region_confidence + δ (0.1) THEN
    ACCEPT new_result
  ELSE
    RETAIN original, FLAG as low_quality
  END IF
END IF
```

**Fusion Selection Logic**:
```
FOR each text_region IN document:
  baseline_conf ← baseline_ocr[region].confidence
  reocr_conf ← reocr_results[region].confidence
  
  IF reocr_conf > baseline_conf + 0.1 THEN
    selected_text ← reocr_results[region].text
    selected_conf ← reocr_conf
    source ← "re-ocr"
  ELSE
    selected_text ← baseline_ocr[region].text
    selected_conf ← baseline_conf
    source ← "baseline"
  END IF
  
  fused_output.append({text: selected_text, conf: selected_conf, source: source})
END FOR
```

### Why Non-Obvious

1. **Spatial Confidence Aggregation**: Prior art treats OCR confidence as document-level or word-level metrics. This invention uses kernel-based spatial smoothing to identify contiguous low-confidence regions, which is not obvious from standard OCR practices.

2. **Heuristic Parameter Selection**: The mapping from image quality metrics (contrast, edge density, noise) to specific OCR parameter adjustments (DPI, filters) is a novel technical contribution. Prior systems use fixed parameters or manual tuning.

3. **Selective Re-Processing**: Re-running OCR on entire documents is computationally expensive and obvious. Selectively re-processing only low-confidence regions with optimized parameters is a non-obvious optimization.

4. **Confidence-Weighted Fusion**: The decision logic for merging baseline and re-OCR results using confidence deltas (not simple max-confidence selection) is a technical innovation.

5. **LLM Confidence Injection**: Passing OCR confidence metadata to LLMs in structured prompts to influence extraction behavior is not standard practice in current IDP systems.

---

## IV. PATENT-READY FORMAL EXPRESSION

### Title of Invention
**"System and Method for Hierarchical Confidence-Weighted Optical Character Recognition with Adaptive Re-Processing for Enhanced Field Extraction"**

### Abstract
A system and method for extracting structured data from scanned documents using hierarchical optical character recognition (OCR) with confidence-based adaptive re-processing. The system performs initial OCR to generate text and character-level confidence scores, analyzes spatial confidence distributions to identify low-confidence regions, selectively re-processes those regions with dynamically optimized OCR parameters based on image quality metrics, fuses baseline and re-OCR results using confidence-weighted selection logic, and passes confidence-annotated text to a large language model (LLM) for field extraction. The method improves extraction accuracy for degraded documents while minimizing computational overhead through selective re-processing, and provides quality-aware outputs suitable for automated validation and human review prioritization.

### Independent Claim (Method Claim)

**Claim 1**: A computer-implemented method for extracting structured field data from a document image, the method comprising:

(a) performing a first optical character recognition (OCR) operation on the document image using a first set of OCR parameters to generate:
    (i) extracted text comprising a plurality of text elements,
    (ii) spatial position data for each text element, and
    (iii) a character-level confidence score for each character in the extracted text;

(b) generating a spatial confidence map by:
    (i) mapping the character-level confidence scores to a two-dimensional spatial grid corresponding to the document image,
    (ii) applying a spatial smoothing function to the confidence scores to generate aggregated confidence values for spatial regions;

(c) identifying one or more low-confidence regions within the document image, wherein each low-confidence region is a contiguous spatial area having an aggregated confidence value below a first predetermined threshold;

(d) for each identified low-confidence region:
    (i) computing one or more image quality metrics selected from the group consisting of: contrast ratio, edge density, and noise level,
    (ii) selecting a second set of OCR parameters based on the computed image quality metrics, wherein the second set of OCR parameters differs from the first set of OCR parameters,
    (iii) performing a second OCR operation on the low-confidence region using the second set of OCR parameters to generate re-processed text and re-processed confidence scores;

(e) generating fused text by:
    (i) for each low-confidence region, comparing the re-processed confidence scores with the original character-level confidence scores,
    (ii) selecting, for each low-confidence region, either the extracted text or the re-processed text based on a confidence improvement criterion,
    (iii) combining the selected text with text from high-confidence regions to form the fused text;

(f) generating a confidence-annotated text representation by associating each text element in the fused text with its corresponding confidence score;

(g) transmitting the confidence-annotated text representation and a set of user-defined field names to a large language model (LLM) via a structured prompt that instructs the LLM to extract field values and account for confidence scores in extraction decisions;

(h) receiving, from the LLM, extracted field values for the user-defined field names; and

(i) outputting the extracted field values along with quality indicators derived from the confidence scores.

### Dependent Claims

**Claim 2**: The method of claim 1, wherein the spatial smoothing function comprises a Gaussian kernel with a standard deviation parameter selected based on average character spacing in the document image.

**Claim 3**: The method of claim 1, wherein selecting the second set of OCR parameters comprises:
- if the contrast ratio is below a second predetermined threshold, applying contrast-limited adaptive histogram equalization (CLAHE) preprocessing;
- if the edge density is below a third predetermined threshold, increasing image resolution to at least 600 DPI and applying a sharpening filter; and
- if the noise level exceeds a fourth predetermined threshold, applying a bilateral noise reduction filter.

**Claim 4**: The method of claim 1, wherein the confidence improvement criterion comprises:
- calculating a confidence delta as the difference between a mean re-processed confidence score and a mean original confidence score for the low-confidence region; and
- selecting the re-processed text if the confidence delta exceeds a fifth predetermined threshold, otherwise retaining the extracted text.

**Claim 5**: The method of claim 1, wherein the structured prompt includes:
- inline confidence annotations in the format "[text_segment] [conf:score]" for each text element; and
- explicit instructions for the LLM to flag extracted field values as uncertain when derived from text elements having confidence scores below a sixth predetermined threshold.

**Claim 6**: The method of claim 1, further comprising:
- maintaining a processing log recording, for each low-confidence region, the image quality metrics, the selected second set of OCR parameters, and the confidence improvement achieved; and
- using the processing log to refine parameter selection heuristics for subsequent document processing operations.

---

## V. IMPLEMENTATION MAPPING TO FILETRACT

### New Modules to Add

#### Module 1: `confidence_analyzer.py`
**Purpose**: Analyze OCR confidence scores and identify low-confidence regions  
**Key Functions**:
- `generate_confidence_map(ocr_output) → ConfidenceMap`
- `identify_low_confidence_regions(confidence_map, threshold) → List[Region]`
- `compute_spatial_kernel(region, kernel_type='gaussian') → np.ndarray`

**Integration Point**: Called after initial Tesseract OCR in `gemini_ocr_extract.py`

#### Module 2: `image_quality_analyzer.py`
**Purpose**: Compute image quality metrics for document regions  
**Key Functions**:
- `compute_contrast_ratio(image_region) → float`
- `compute_edge_density(image_region) → float`
- `compute_noise_level(image_region) → float`
- `suggest_preprocessing(quality_metrics) → PreprocessingPipeline`

**Integration Point**: Called for each low-confidence region before re-OCR

#### Module 3: `adaptive_reocr_engine.py`
**Purpose**: Perform selective re-OCR with optimized parameters  
**Key Functions**:
- `select_ocr_parameters(quality_metrics) → OCRParams`
- `apply_preprocessing(image_region, preprocessing_pipeline) → ProcessedImage`
- `reocr_region(processed_image, ocr_params) → OCRResult`
- `evaluate_improvement(original_conf, new_conf) → bool`

**Integration Point**: Replaces simple single-pass OCR in current implementation

#### Module 4: `result_fusion.py`
**Purpose**: Merge baseline and re-OCR results using confidence logic  
**Key Functions**:
- `compare_results(baseline, reocr, delta_threshold) → FusionDecision`
- `merge_text_regions(decisions) → FusedText`
- `annotate_confidence(fused_text, confidence_map) → AnnotatedText`

**Integration Point**: Called before LLM extraction to prepare final text

#### Module 5: `confidence_aware_llm.py`
**Purpose**: Construct confidence-aware prompts and parse quality-flagged outputs  
**Key Functions**:
- `build_confidence_prompt(annotated_text, fields) → str`
- `parse_llm_response_with_quality(response) → Dict[str, FieldWithQuality]`
- `generate_quality_report(extracted_fields) → QualityReport`

**Integration Point**: Replaces current `extract_fields_with_gemini()` function

### Interaction with Existing Components

**OCR Layer (Tesseract)**:
- Existing: Single-pass OCR at 300 DPI
- New: Dual-pass OCR (baseline + selective re-OCR)
- Modification: Extract and preserve character-level confidence scores (already available in Tesseract output)

**Gemini API Integration**:
- Existing: Simple text + field list prompt
- New: Confidence-annotated text + quality-aware instructions
- Modification: Update prompt template in `extract_fields_with_gemini()`

**Output Format**:
- Existing: `{field: value}` JSON
- New: `{field: {value, ocr_confidence, llm_confidence, quality_flag}}` JSON
- Modification: Update `save_extracted_fields()` to include quality metadata

### Proprietary Components

**Keep Proprietary**:
1. **Confidence Kernel Algorithms**: The specific spatial smoothing kernels and aggregation functions
2. **Parameter Selection Heuristics**: The mapping from quality metrics to OCR parameters
3. **Fusion Decision Logic**: The confidence delta thresholds and selection criteria
4. **Prompt Templates**: The exact structure of confidence-aware LLM prompts

**Can Be Open-Source**:
1. **Basic OCR Wrapper**: Standard Tesseract integration
2. **Image Quality Metrics**: Standard CV algorithms (contrast, edge detection)
3. **LLM API Client**: Generic Gemini API integration
4. **File I/O**: Document loading and result saving

---

## VI. ADDITIONAL PATENTABLE MECHANISMS (BRIEF)

### Invention 2: Spatial-Semantic Field Disambiguation System

**Core Innovation**: Graph-based spatial relationship encoding combined with LLM semantic validation

**Key Claims**:
- Constructing directed spatial relationship graphs from OCR bounding boxes
- Anchor keyword detection with proximity-based candidate binding
- Hybrid spatial-semantic scoring for field disambiguation

**Implementation**: New module `spatial_field_binder.py` that processes OCR bounding boxes before LLM extraction

### Invention 3: Statistical Outlier Detection for Batch Hallucination Mitigation

**Core Innovation**: Cross-document consistency analysis to detect LLM hallucinations

**Key Claims**:
- Building field value distributions across document batches
- Computing outlier scores using frequency and edit distance metrics
- Automated verification re-prompting for high-outlier extractions

**Implementation**: New module `batch_validator.py` that analyzes extraction history during multi-document processing

### Invention 4: Dynamic Prompt Refinement via Correction Pattern Mining

**Core Innovation**: Automated extraction rule generation from user correction logs

**Key Claims**:
- Systematic pattern mining from correction logs
- Deterministic rule generation with frequency thresholds
- Dynamic prompt template modification without model retraining

**Implementation**: New module `feedback_learner.py` with correction logging and rule mining engine

---

## VII. PATENT ATTORNEY HANDOFF CHECKLIST

### Materials Prepared
- ✅ 5 patent-eligible problem statements in technical language
- ✅ 5 novel technical solutions with non-obvious aspects
- ✅ 1 fully detailed core invention with architecture and data flow
- ✅ Formal patent expression (title, abstract, 6 claims)
- ✅ Implementation mapping to existing system
- ✅ Proprietary component identification

### Next Steps for Patent Attorney
1. **Prior Art Search**: Conduct comprehensive search for similar confidence-based OCR systems
2. **Claim Refinement**: Narrow or broaden claims based on prior art findings
3. **Enablement Review**: Verify that disclosure is sufficient for skilled practitioner to implement
4. **Obviousness Analysis**: Assess whether combination of known techniques is non-obvious
5. **Provisional Filing**: Consider provisional patent application for core invention
6. **Continuation Strategy**: Evaluate filing continuation applications for additional inventions

### Technical Contact
For implementation questions or technical clarifications, contact FileTract development team with reference to this document.

---

**Document Status**: Ready for Patent Attorney Review  
**Confidentiality**: Attorney-Client Privileged - Patent Pending Material  
**Version**: 1.0  
**Date**: December 23, 2025
