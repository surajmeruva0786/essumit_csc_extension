# FileTract — OCR + LLM extraction backend (Tesseract + Flask)
FROM python:3.11-slim

# Install Tesseract OCR and system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (from FileTract directory)
COPY . .

# Create dirs for uploads and results
RUN mkdir -p uploads results

# Env vars (override at run): GROQ_API_KEY, GEMINI_API_KEY, PORT
ENV PORT=5000
EXPOSE 5000

# Run with gunicorn for production
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 120 app:app"]
