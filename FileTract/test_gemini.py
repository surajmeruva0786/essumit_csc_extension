import google.generativeai as genai

# Configure API
GEMINI_API_KEY = "AIzaSyArTJuxZ2h0cpE_faiYFhOwlK-UmuJyY2s"
genai.configure(api_key=GEMINI_API_KEY)

# Test simple API call
print("Testing Gemini API...")
try:
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content("Say hello!")
    print(f"✅ API works! Response: {response.text}")
except Exception as e:
    print(f"❌ API Error: {e}")

# List available models
print("\nListing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
except Exception as e:
    print(f"❌ Error listing models: {e}")
