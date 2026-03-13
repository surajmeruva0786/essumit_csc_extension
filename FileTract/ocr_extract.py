import os
import re
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
from pydantic import BaseModel, Field

# Path to Tesseract executable - environment-aware for deployment
tesseract_cmd = os.environ.get('TESSERACT_CMD')

if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
else:
    if os.name == 'nt':  # Windows
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    else:  # Linux/Unix
        pytesseract.pytesseract.tesseract_cmd = 'tesseract'

# ------------------------------------------
# 🔹 1. File paths setup
# ------------------------------------------
FILES = [
    r"10th_long_memo.pdf",
    r"Screenshot 2025-10-07 211503.png"
]

# ------------------------------------------
# 🔹 2. OCR extraction functions
# ------------------------------------------
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF using OCR (via PyMuPDF + Tesseract)"""
    output_text = ""
    pdf_document = fitz.open(pdf_path)
    print(f"\n📄 Total pages found in {os.path.basename(pdf_path)}: {pdf_document.page_count}")

    for page_num in range(pdf_document.page_count):
        print(f"🌀 Processing page {page_num + 1}...")
        try:
            page = pdf_document.load_page(page_num)
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            text = pytesseract.image_to_string(img, lang="eng")
            output_text += f"\n--- PAGE {page_num+1} ---\n{text}"
        except Exception as e:
            print(f"⚠ Error on page {page_num + 1}: {e}")
            continue

    pdf_document.close()
    return output_text

def extract_text_from_image(image_path):
    """Extract text from a single image using OCR"""
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img, lang="eng")
    return text

# ------------------------------------------
# 🔹 3. Pydantic model for structured output
# ------------------------------------------
class StudentInfo(BaseModel):
    name: str | None = Field(default=None, description="Student full name")
    father_name: str | None = Field(default=None, description="Father's full name")
    mother_name: str | None = Field(default=None, description="Mother's full name")
    school: str | None = Field(default=None, description="School name")
    medium: str | None = Field(default=None, description="Medium of study")

# ------------------------------------------
# 🔹 4. Basic field extraction logic
# ------------------------------------------
def parse_student_info(text: str) -> StudentInfo:
    """Extract structured fields from OCR text"""
    # Normalize spaces and case
    clean_text = re.sub(r"\s+", " ", text)
    clean_text_lower = clean_text.lower()

    def find_field(patterns):
        for p in patterns:
            match = re.search(p, clean_text, flags=re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    return StudentInfo(
        name=find_field([r"Name[:\- ]+([A-Za-z ]+)", r"Student Name[:\- ]+([A-Za-z ]+)"]),
        father_name=find_field([r"Father'?s Name[:\- ]+([A-Za-z ]+)", r"Father Name[:\- ]+([A-Za-z ]+)"]),
        mother_name=find_field([r"Mother'?s Name[:\- ]+([A-Za-z ]+)", r"Mother Name[:\- ]+([A-Za-z ]+)"]),
        school=find_field([r"School[:\- ]+([A-Za-z0-9 .,&\-]+)"]),
        medium=find_field([r"Medium[:\- ]+([A-Za-z ]+)"])
    )

# ------------------------------------------
# 🔹 5. Main execution
# ------------------------------------------
if __name__ == "__main__":
    for file_path in FILES:
        if not os.path.exists(file_path):
            print(f"\n❌ File not found: {file_path}")
            continue

        ext = os.path.splitext(file_path)[1].lower()
        print(f"\n================= 📝 PROCESSING {os.path.basename(file_path)} =================\n")

        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(file_path)
        elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            extracted_text = extract_text_from_image(file_path)
        else:
            print(f"⚠ Unsupported file type: {ext}")
            continue

        # Parse extracted info using Pydantic model
        structured_data = parse_student_info(extracted_text)
        print("📋 Extracted Info:")
        print(structured_data.model_dump_json(indent=4))

        # Save text + structured output
        output_txt = os.path.splitext(file_path)[0] + "_ocr_output.txt"
        with open(output_txt, "w", encoding="utf-8") as f:
            f.write(extracted_text)
        print(f"✅ Text saved to: {output_txt}")

        output_json = os.path.splitext(file_path)[0] + "_structured.json"
        with open(output_json, "w", encoding="utf-8") as f:
            f.write(structured_data.model_dump_json(indent=4))
        print(f"✅ Structured data saved to: {output_json}")

        print("\n============================================================\n")