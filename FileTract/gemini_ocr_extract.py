import os
import sys
import json
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import groq
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
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

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("❌ Error: GROQ_API_KEY not found in .env file")
    print("Please create a .env file with your API key (see .env.example)")
    sys.exit(1)

# Pass httpx client explicitly to avoid proxy bug in some Python environments
http_client = httpx.Client()
client = groq.Groq(api_key=GROQ_API_KEY, http_client=http_client)

# ============================================================
# 🔹 OCR EXTRACTION FUNCTIONS
# ============================================================

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF using OCR (via PyMuPDF + Tesseract)"""
    output_text = ""
    try:
        pdf_document = fitz.open(pdf_path)
        print(f"\n📄 Total pages found in {os.path.basename(pdf_path)}: {pdf_document.page_count}")
        
        for page_num in range(pdf_document.page_count):
            print(f"  🌀 Processing page {page_num + 1}...")
            try:
                page = pdf_document.load_page(page_num)
                pix = page.get_pixmap(dpi=300)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text = pytesseract.image_to_string(img, lang="eng")
                output_text += f"\n--- PAGE {page_num+1} ---\n{text}"
            except Exception as e:
                print(f"  ⚠ Error on page {page_num + 1}: {e}")
                continue
        
        pdf_document.close()
    except Exception as e:
        print(f"❌ Error processing PDF {pdf_path}: {e}")
        return ""
    
    return output_text


def extract_text_from_image(image_path: str) -> str:
    """Extract text from a single image using OCR"""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang="eng")
        return text
    except Exception as e:
        print(f"❌ Error processing image {image_path}: {e}")
        return ""


def extract_text_from_file(file_path: str) -> str:
    """Extract text from a file (PDF or image)"""
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        return extract_text_from_image(file_path)
    else:
        print(f"⚠ Unsupported file type: {ext}")
        return ""


# ============================================================
# 🔹 GROQ API INTEGRATION
# ============================================================

def extract_fields_with_groq(extracted_text: str, fields: List[str]) -> Dict[str, Any]:
    """Use Groq API to extract specified fields from OCR text"""
    try:
        # Construct the prompt with anti-hallucination instructions
        fields_list = ", ".join(fields)
        
        # Check if OCR text is empty or too short
        if not extracted_text or len(extracted_text.strip()) < 10:
            print("  ⚠️ Warning: OCR text is empty or very short - returning null values")
            return {field: None for field in fields}
        
        system_prompt = f"""You are a precise data extraction assistant. Your job is to extract ONLY the information that is EXPLICITLY present in the OCR text below.

TASK: Extract these fields from the text provided by the user:
{fields_list}

CRITICAL RULES:
1. Extract ONLY information that is CLEARLY visible in the OCR text
2. DO NOT make up, invent, or guess any information
3. DO NOT use placeholder values like "John Doe", "ABC School", etc.
4. If a field is not found in the text, set its value to null
5. If the text is unclear or ambiguous, set the value to null
6. Return ONLY a valid JSON object - no explanations, no markdown
7. Use the EXACT field names provided above as JSON keys

CORRECT EXAMPLE (when data exists):
{{"Name": "RAPOLU SHIVA TEJA", "School": "NEW VISION CONCEPT SCHOOL"}}

CORRECT EXAMPLE (when data is missing):
{{"Name": null, "School": null}}

WRONG - DO NOT DO THIS:
{{"Name": "John Doe", "School": "ABC High School"}}  ← NEVER use fake placeholder data"""
        
        
        # Generate response
        print("  🤖 Sending request to Groq API...")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"OCR TEXT:\n---\n{extracted_text}\n---\n\nNow extract the fields and return ONLY the JSON:"}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Parse JSON response
        response_text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present (Groq usually obeys json_object, but just in case)
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Debug: Print cleaned response
        print(f"  📝 Cleaned response: {response_text[:200]}...")
        
        # Parse JSON
        llm_output = json.loads(response_text)
        
        # Create a normalized map for fuzzy matching
        normalized_output = {}
        for k, v in llm_output.items():
            norm_key = ''.join(c.lower() for c in k if c.isalnum())
            normalized_output[norm_key] = v
            
        # Map back to exact fields requested
        extracted_data = {}
        for field_name in fields:
            norm_field = ''.join(c.lower() for c in field_name if c.isalnum())
            
            # 1. Exact match
            if field_name in llm_output:
                extracted_data[field_name] = llm_output[field_name]
            # 2. Normalized match
            elif norm_field in normalized_output:
                extracted_data[field_name] = normalized_output[norm_field]
            # 3. Fuzzy partial match
            else:
                match_val = None
                for k, v in llm_output.items():
                    k_norm = ''.join(c.lower() for c in k if c.isalnum())
                    if (len(k_norm) > 3 and k_norm in norm_field) or (len(norm_field) > 3 and norm_field in k_norm):
                        match_val = v
                        break
                extracted_data[field_name] = match_val
                
        print(f"  ✅ Successfully parsed {len(extracted_data)} fields (mapped from {len(llm_output)} raw keys)")
        return extracted_data
        
    except json.JSONDecodeError as e:
        print(f"  ⚠ Error parsing Groq response as JSON: {e}")
        print(f"  📄 Response text: {response_text[:500]}")
        return {field: None for field in fields}
    except Exception as e:
        print(f"  ❌ Error calling Groq API: {e}")
        import traceback
        traceback.print_exc()
        return {field: None for field in fields}


# ============================================================
# 🔹 DISPLAY FUNCTIONS
# ============================================================

def display_extracted_text(filename: str, text: str):
    """Display extracted text in a formatted way"""
    separator = "=" * 80
    print(f"\n{separator}")
    print(f"📝 EXTRACTED TEXT FROM: {filename}")
    print(separator)
    print(text)
    print(separator)


def display_extracted_fields(filename: str, fields_data: Dict[str, Any]):
    """Display extracted fields in a formatted table"""
    separator = "=" * 80
    print(f"\n{separator}")
    print(f"📊 EXTRACTED FIELDS FROM: {filename}")
    print(separator)
    
    # Calculate max field name length for alignment
    max_field_len = max(len(field) for field in fields_data.keys()) if fields_data else 0
    
    for field, value in fields_data.items():
        value_str = str(value) if value is not None else "NOT FOUND"
        print(f"  {field.ljust(max_field_len)} : {value_str}")
    
    print(separator)


# ============================================================
# 🔹 FILE OPERATIONS
# ============================================================

def save_extracted_text(file_path: str, text: str):
    """Save extracted text to a file"""
    output_path = os.path.splitext(file_path)[0] + "_extracted_text.txt"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"  ✅ Extracted text saved to: {output_path}")
    except Exception as e:
        print(f"  ⚠ Error saving text file: {e}")


def save_extracted_fields(file_path: str, fields_data: Dict[str, Any]):
    """Save extracted fields to a JSON file"""
    output_path = os.path.splitext(file_path)[0] + "_extracted_fields.json"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(fields_data, f, indent=4, ensure_ascii=False)
        print(f"  ✅ Extracted fields saved to: {output_path}")
    except Exception as e:
        print(f"  ⚠ Error saving JSON file: {e}")


# ============================================================
# 🔹 USER INPUT FUNCTIONS
# ============================================================

def get_file_paths() -> List[str]:
    """Get file paths from user input or use defaults"""
    print("\n" + "=" * 80)
    print("📂 FILE SELECTION")
    print("=" * 80)
    
    # Check for default files
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
        # Split by comma and clean up paths
        paths = [p.strip().strip('"').strip("'") for p in user_input.split(",")]
        # Validate paths
        valid_paths = []
        for path in paths:
            if os.path.exists(path):
                valid_paths.append(path)
            else:
                print(f"⚠ File not found: {path}")
        return valid_paths
    else:
        print("❌ No files provided.")
        return []


def get_fields_to_extract() -> List[str]:
    """Get field names from user input"""
    print("\n" + "=" * 80)
    print("🔍 FIELD SELECTION")
    print("=" * 80)
    print("\nCommon fields examples:")
    print("  - Name, Father Name, Mother Name")
    print("  - Date of Birth, Age")
    print("  - Address, City, State, Pincode")
    print("  - School, Class, Roll Number")
    print("  - Certificate Number, Issue Date")
    print("  - Marks, Grade, Percentage")
    print("\nEnter the fields you want to extract (comma-separated):")
    
    user_input = input("> ").strip()
    
    if not user_input:
        print("⚠ No fields provided. Using default fields.")
        return ["Name", "Father Name", "Mother Name", "School", "Medium"]
    
    # Split by comma and clean up field names
    fields = [f.strip() for f in user_input.split(",") if f.strip()]
    return fields


# ============================================================
# 🔹 MAIN EXECUTION
# ============================================================

def main():
    """Main execution function"""
    print("\n" + "=" * 80)
    print("🚀 FILETRACT - MULTI-FILE OCR WITH GEMINI AI")
    print("=" * 80)
    
    # Step 1: Get file paths
    file_paths = get_file_paths()
    
    if not file_paths:
        print("\n❌ No valid files to process. Exiting.")
        return
    
    print(f"\n✅ Processing {len(file_paths)} file(s)")
    
    # Step 2: Extract text from all files
    extracted_texts = {}
    
    for file_path in file_paths:
        print(f"\n{'=' * 80}")
        print(f"📄 PROCESSING: {os.path.basename(file_path)}")
        print(f"{'=' * 80}")
        
        text = extract_text_from_file(file_path)
        
        if text:
            extracted_texts[file_path] = text
            display_extracted_text(os.path.basename(file_path), text)
            save_extracted_text(file_path, text)
        else:
            print(f"⚠ No text extracted from {file_path}")
    
    if not extracted_texts:
        print("\n❌ No text extracted from any files. Exiting.")
        return
    
    # Step 3: Get fields to extract
    fields = get_fields_to_extract()
    
    if not fields:
        print("\n❌ No fields to extract. Exiting.")
        return
    
    print(f"\n✅ Will extract {len(fields)} field(s): {', '.join(fields)}")
    
    # Step 4: Extract fields using Groq API
    print(f"\n{'=' * 80}")
    print("🤖 EXTRACTING FIELDS USING GROQ AI")
    print(f"{'=' * 80}")
    
    for file_path, text in extracted_texts.items():
        print(f"\n📄 Processing: {os.path.basename(file_path)}")
        
        fields_data = extract_fields_with_groq(text, fields)
        display_extracted_fields(os.path.basename(file_path), fields_data)
        save_extracted_fields(file_path, fields_data)
    
    # Final summary
    print(f"\n{'=' * 80}")
    print("✅ PROCESSING COMPLETE")
    print(f"{'=' * 80}")
    print(f"\nProcessed {len(extracted_texts)} file(s)")
    print(f"Extracted {len(fields)} field(s) from each file")
    print("\nAll results saved to disk.")
    print("\n" + "=" * 80)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Process interrupted by user. Exiting...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
