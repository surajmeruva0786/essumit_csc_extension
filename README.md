# 🇮🇳 CSC Sahayak (Common Service Centre Assistant)

CSC Sahayak is an intelligent, AI-powered Chrome Extension explicitly built to supercharge **Common Service Centre (CSC) operators** across India. It acts as a smart co-pilot to help operators navigate complex government portals, instantly extract data from citizen documents, automatically fill out long digital forms, and provide bilingual guidance on eligibility and requirements. 

This tool is designed to drastically reduce application rejection rates, cut down data-entry time, and empower operators to serve citizens faster and more accurately.

---

## ✨ Key Features

### 1. 🤖 AI Chat & Voice Assistant
An intelligent side-panel assistant built to answer complex questions about government schemes, eligibility, and required documents.
*   **Bilingual Output:** All AI responses are mandatorily generated in both **Hindi** and **English** to ensure clear understanding.
*   **Voice Integration:** Supports live Speech-to-Text (in Hindi/English mix) using the Web Speech API. Operators can just click the mic and speak their questions.
*   **Context-Aware Knowledge Base:** The AI (powered by Groq / LLaMA) parses a local JSON knowledge base (`knowledge_base/csc_kb1.json`) to provide highly accurate, official answers instead of hallucinating.

### 2. 📄 Intelligent Document Extraction (FileTract)
Operators handle hundreds of physical documents daily (Aadhaar, PAN, Income Certificates, Ration Cards).
*   **OCR & LLM Pipeline:** The extension connects to a local Flask Python backend (`/FileTract`) which uses advanced OCR and LLM (Gemini/Groq) extraction pipelines to pull structured data from raw images/PDFs.
*   **Confidence Scoring:** Extracted fields come with confidence scores to flag potential misreads before they are submitted.

### 3. ⚡ One-Click Form Auto-Fill
Gone are the days of manual typing.
*   **DOM Injection:** Using Chrome Extension Content Scripts (`content.js` and `formMappings.js`), the extension maps the extracted document data directly into the complex HTML input fields of government web portals.
*   **Real-time Validation:** Live form validation logic ensures that the data format (like phone numbers or Aadhaar formats) matches the strict portal requirements before submission.

### 4. 📊 Operator Dashboard
A dedicated React/Vite web dashboard (`csc_extension_dashboard_frontend/`) provides operators with analytics, history of applications, and deeper insights into their daily workflows.

---

## 🏗️ Architecture & Tech Stack

### Extension Frontend (Side Panel & UI)
Located in `/extension_frontend/`.
*   **Framework:** React 18, managed by Vite.
*   **Styling:** Tailwind CSS & Radix UI components (for accessible modals, popups, and dropdowns).
*   **Routing:** React Router for fluid navigation within the Chrome Side Panel.
*   **Icons & UI Polish:** Lucide-React, Framer Motion, and custom glassmorphism styling. 

### Chrome Extension Core
Located in the project root.
*   **Manifest V3:** Adheres to the latest, most secure Chrome Extension standards.
*   **Content Scripts:** `content.js` interacts with live web pages (reading DOM, injecting auto-fill text).
*   **Service Worker:** `background.js` manages state and coordinates between the webpage, the side panel, and APIs.
*   **Permission Helper:** `mic_permission.html` & `mic_permission.js` seamlessly bypass Chrome's strict side-panel microphone blocks.

### Extraction Backend (FileTract)
Located in `/FileTract/`.
*   **Language:** Python 3
*   **Framework:** Flask
*   **Pipelines:** Contains specialised scripts like `confidence_aware_llm.py`, `gemini_ocr_extract.py`, and `patent_ocr_pipeline.py` to handle extreme variations in Indian document scans.

---

## ⚙️ Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+) & pip
*   A Groq API Key (for the AI Chat)
*   A Gemini/Google Studio API Key (for Document Extraction fallback)

### 1. Build the Extension Frontend
Because the Chrome Extension loads static HTML/JS into the side panel, you must build the React app first.
\`\`\`bash
cd extension_frontend
npm install
npm run build
\`\`\`
*(Warning: `npm run dev` will not work inside the extension environment because Chrome expects static bundled files. Always run `npm run build` after making React changes).*

### 2. Run the Extraction Backend
Open a separate terminal to start the Flask AI extraction server.
\`\`\`bash
cd FileTract
pip install -r requirements.txt
python app.py
\`\`\`
*(The backend typically runs on `http://127.0.0.1:5000`)*

### 3. Run the Dashboard Frontend (Optional)
Open a third terminal for the analytics dashboard.
\`\`\`bash
cd csc_extension_dashboard_frontend
npm install
npm run dev
\`\`\`

### 4. Load the Extension into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Turn on **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked** in the top left.
4. Select the root folder of this repository (the folder containing `manifest.json`).
5. Open any webpage, click the Extension puzzle icon, and pin **CSC Sahayak**.
6. Click the extension icon to open the Side Panel!

---

## 🔒 Permissions & Security (Manifest V3)
*   `activeTab`, `tabs`, `scripting`: Required to read form fields and inject auto-fill text.
*   `storage`: Used to securely save Operator API keys (Groq/Gemini) locally without sending them to external unverified servers.
*   `sidePanel`: Powers the persistent React UI.
*   **CSP (Content Security Policy):** Strict inline-script blocking is enforced. All logic is encapsulated in discrete `.js` and `.tsx` files.

---

*Built to bridge the digital divide and empower India's rural digital infrastructure.* 🚀
