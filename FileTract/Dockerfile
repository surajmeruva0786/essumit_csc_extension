# Use an official Python runtime as the base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set Tesseract path environment variable (CRITICAL - must be before COPY)
ENV TESSERACT_CMD=/usr/bin/tesseract
ENV FLASK_ENV=production

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p uploads results

# Expose port (Render will override with PORT env var)
EXPOSE 5000

# Run the application with gunicorn
CMD gunicorn app:app --bind 0.0.0.0:$PORT
