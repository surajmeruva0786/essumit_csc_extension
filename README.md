# CSC Sahayak — Common Service Centre AI Co-Pilot

**CSC Sahayak** is an intelligent, AI-powered ecosystem built for **Common Service Centre (CSC) operators** across India. It reduces application rejections, speeds up data entry, and helps operators serve citizens faster on government portals—with document extraction, form auto-fill, bilingual AI assistance, and monitoring dashboards.

The project consists of **four main applications** that work together: a **Chrome Extension** (side panel + content script), a **Python extraction backend (FileTract)**, a **React Desktop Application**, and a **Monitoring Dashboard**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components in Detail](#components-in-detail)
- [Knowledge Base](#knowledge-base)
- [Data Flows](#data-flows)
- [Project Structure](#project-structure)
- [Setup & Running](#setup--running)
- [Permissions & Security](#permissions--security)
- [Technology Stack](#technology-stack)

---

## Overview

### What It Does

1. **Chrome Extension (Side Panel)**  
   Operators log in (operator ID/username), go through a guided flow: citizen details → service selection → document checklist → AI extraction (via FileTract) → data review → validation → success. The extension can **sync application data to the active tab** and trigger **one-click form auto-fill** on government websites using extracted data and optional Groq-based field matching.

2. **Content Script (`content.js`)**  
   Injects into government portal pages: detects forms, scans fields (inputs, selects, file inputs), and performs **auto-fill** when the extension sends extracted data. Handles dropdowns (best match or random if no match), file inputs (via base64 payloads), and validation rules.

3. **FileTract Backend (Flask)**  
   Document intelligence: **OCR + LLM** pipelines (Gemini/Groq or **local Ollama**) to extract structured fields from PDFs and images. Supports a **patent-eligible confidence-weighted pipeline** for degraded scans and optional **Ollama** for fully local extraction.

4. **Desktop Application (React/Vite)**  
   Standalone **CSC Sahayak Desktop** for document and application management: operator-style **New Application** (citizen info, service selection, **Ollama-powered AI chatbot** using the knowledge base), document upload, AI extraction, data review, validation, success/history. Fixed-height chat panel with local **Ollama** and KB at `public/knowledge_base/csc_kb1.json`.

5. **Dashboard (React/Vite)**  
   **CSC AI Co-Pilot Monitoring Dashboard**: operator activity, analytics, AI performance, total warnings, and rejection insights (e.g. Firestore sessions).

6. **Knowledge Base**  
   Shared **`knowledge_base/`** (and desktop `public/knowledge_base/`) — structured JSON of government services (documents, fees, processing time, rules). Used by the **extension chat (Groq)** and the **desktop chatbot (Ollama)** to give accurate, context-aware answers in Hindi/English.

### Key Features

- **AI Chat & Voice (Extension)**  
  Bilingual (Hindi/English) assistant using Groq and the knowledge base; optional voice (speech-to-text / text-to-speech) in the side panel.

- **Offline Sync (Extension)**  
  Syncs current application/session data to the active tab and can trigger **form auto-fill** with Groq-selected field mappings and optional file payloads.

- **Form Auto-Fill (Content Script)**  
  Scans inputs, selects, and file fields; fills from extension payload; ensures every `<select>` gets a selection (including `__random__` when no match).

- **Document Extraction (FileTract)**  
  OCR (Tesseract) + Gemini/Groq or **Ollama** extraction; patent pipeline for low-confidence regions; REST API for upload and job status.

- **Desktop AI Chatbot (Ollama)**  
  Local-only chat on the New Application page using **Ollama** and the knowledge base; fixed-height panel, loading/error states.

- **Operator Login & Session Storage**  
  Extension: operator login at index route, Welcome at `/welcome`; session/refId saved (e.g. session API); desktop: separate login and app flows.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CSC Sahayak Ecosystem                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Chrome Extension (Side Panel)     │  Government Portal (any tab)            │
│  - Operator Login → Welcome       │  - content.js injects                   │
│  - Citizen Details, Service       │  - SCAN_FORM_FIELDS / AUTO_FILL_FORM   │
│  - Document Checklist             │  - Dropdowns + file inputs               │
│  - AI Extraction (→ FileTract)    │  - Validation rules                    │
│  - Data Review, Validation        │                                         │
│  - Offline Sync → Auto-fill       │                                         │
│  - AI Assistant (Groq + KB)      │                                         │
├───────────────────────────────────┼─────────────────────────────────────────┤
│  Desktop App (React)              │  FileTract (Flask, Python)               │
│  - New Application + Ollama chat  │  - POST /api/upload, /api/status       │
│  - Document upload, Extraction   │  - Gemini / Groq / Ollama pipelines    │
│  - Data Review, Validation       │  - Patent confidence pipeline            │
│  - Success, History              │  - Serves extension_frontend/dist (optional)│
├───────────────────────────────────┴─────────────────────────────────────────┤
│  Dashboard (React)  │  Knowledge Base (JSON)                                │
│  - Operator activity, warnings   │  knowledge_base/csc_kb1.json             │
│  - Analytics, Firestore sessions  │  Used by Extension (Groq) & Desktop (Ollama)│
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Extension** talks to **FileTract** (localhost:5000) for extraction and to **Groq** for chat and (optionally) field mapping.  
- **Desktop** uses **Ollama** (localhost:11434) for local chat and can use the same or another extraction backend.  
- **Content script** runs on `<all_urls>`; extension sends it scan/autofill messages.

---

## Components in Detail

### 1. Chrome Extension

- **Location:** Root + `extension_frontend/`
- **Manifest:** V3; side panel points to `extension_frontend/dist/index.html`; content script `content.js` on `<all_urls>`; background `background.js`.
- **Routes (hash):** `/` Operator Login, `/welcome` Welcome, `/citizen-details`, `/service-selection`, `/documents`, `/ai-extraction`, `/data-review`, `/validation`, `/success`, `/ai-assistant`.
- **Features:** Operator login (stored in chrome.storage), welcome stepper, document checklist, AI extraction (FileTract API), data review, validation (Cancel / Submit Anyway / Verified Submit), submission success with session/refId save, AI assistant (Groq + KB, optional voice), **Offline Sync** (sync icon in header) that sends app data to the active tab and can trigger auto-fill via Groq and content script.
- **APIs:** `sessionApi`, `chatApi` (Groq + KB), `autofillApi` / useOfflineSync (Groq for field mapping, content script for fill).

### 2. Content Script (`content.js`)

- **Role:** Form detection (gov domains), scan form fields (inputs, selects with options, file inputs), dismiss loading overlays, and perform **auto-fill** when the extension sends a payload.
- **Messages:** `FORM_DETECTED` / `NO_FORM`, `SCAN_FORM_FIELDS`, `AUTO_FILL_FORM` (with field mappings and optional `filePayloads`).
- **Behaviour:** Fills text/textarea/select; for selects, uses value or text match, else placeholder-safe random; ensures every `<select>` gets a selection; injects files into file inputs from base64 payloads.

### 3. FileTract Backend (`FileTract/app.py`)

- **Role:** Flask app; upload PDF/images, run OCR + LLM extraction (Gemini, Groq, or **Ollama**), return structured fields; optional patent pipeline for confidence-weighted re-OCR.
- **Endpoints:** e.g. `/` (serve frontend if built), `/api/upload`, `/api/status/<job_id>`, etc. Runs at **http://127.0.0.1:5000** (or configured port).
- **Pipelines:** Standard (Gemini/Groq), patent (confidence-aware), Ollama (local). Can fall back to Groq if Ollama is unavailable.

### 4. Desktop Application (`csc_desktop_application_frontend/`)

- **Title:** “CSC Sahayak Desktop — Document & Application Manager”
- **Routes:** `/login`, `/services`, `/app/new`, `/app/upload`, `/app/extraction`, `/app/review`, `/app/validation`, `/app/success`, `/app/history`, `/app/help`, etc.
- **New Application page:** Citizen info, service selection, **AI chatbot** (fixed height 420px): **Ollama** + knowledge base from `public/knowledge_base/csc_kb1.json`; status (Active/Offline), loading and error states.
- **Other:** Document upload, AI extraction (can point to FileTract or similar), data review, validation (rectangular buttons), success (no Print Receipt button), history.

### 5. Dashboard (`csc_extension_dashboard_frontend/`)

- **Title:** “CSC AI Co-Pilot Monitoring Dashboard”
- **Role:** Operator activity, analytics, AI performance, total AI warnings (fixed from earlier `[object Object]0`-style bugs), rejections; can use Firestore for sessions.

### 6. Knowledge Base

- **Location:** `knowledge_base/` at repo root (e.g. `csc_kb1.json`, `csv_updated_data.csv`). Desktop app uses a copy under `csc_desktop_application_frontend/public/knowledge_base/` (e.g. `csc_kb1.json`) so the Ollama chatbot can load it at runtime.
- **Content:** JSON array of services: `service_id`, `service_name`, `documents` (type, mandatory), `processing_time`, `fees`, eligibility/general/special rules, etc. Used to build system prompts for Groq (extension) and Ollama (desktop).

---

## Knowledge Base

- **Path (extension):** Packaged as `knowledge_base/csc_kb1.json` (manifest `web_accessible_resources`). Fetched via `chrome.runtime.getURL('knowledge_base/csc_kb1.json')` in `chatApi.ts`.
- **Path (desktop):** `/knowledge_base/csc_kb1.json` from the app’s `public` folder; loaded in `ollamaChatApi.ts`, summarized and injected into the Ollama system prompt.
- **Format:** Array of service objects; each can have `documents`, `processing_time`, `fees`, `eligibility_rules`, etc. Extension and desktop both derive Q&A and context from this.

---

## Data Flows

1. **Operator login (extension)**  
   Operator ID/username → stored in chrome.storage → redirect to `/welcome`.

2. **Application flow (extension)**  
   Welcome → Citizen Details → Service Selection → Document Checklist → AI Extraction (upload to FileTract, poll status) → Data Review → Validation → Success (session save, refId).

3. **Offline sync / auto-fill (extension)**  
   User triggers sync → useOfflineSync builds payload (form data, optional document_files) → Groq (if used) for field mapping → content script receives `AUTO_FILL_FORM` → fills inputs/selects/file fields on the page.

4. **Desktop new application**  
   Login (if used) → New Application (citizen + service) → user chats with Ollama chatbot (KB context) → proceed to upload → extraction → review → validation → success/history.

5. **Extraction (FileTract)**  
   Client (extension or desktop) uploads file + fields → Flask creates job → OCR + LLM (Gemini/Groq/Ollama) → results stored and returned via status/result endpoints.

---

## Project Structure

```
essumit_csc_extension/
├── manifest.json                 # Chrome Extension manifest v3
├── background.js                 # Service worker
├── content.js                    # Form detection + auto-fill (injected)
├── panel.html / panel.js         # Legacy/alternate panel (if used)
├── knowledge_base/               # Shared KB (extension + desktop copy)
│   ├── csc_kb1.json
│   └── csv_updated_data.csv
├── extension_frontend/           # Side panel React app
│   ├── src/app/
│   │   ├── api/                  # chatApi, sessionApi, autofillApi, etc.
│   │   ├── hooks/                # useOfflineSync, useVoiceAssistant
│   │   ├── screens/              # OperatorLogin, Welcome, CitizenDetails, ...
│   │   ├── components/           # Layout, Header, etc.
│   │   └── routes.tsx
│   └── dist/                     # Built output (loaded by extension)
├── csc_desktop_application_frontend/
│   ├── public/knowledge_base/    # Copy of KB for Ollama chat
│   └── src/app/
│       ├── api/                  # ollamaChatApi.ts
│       ├── pages/                # NewApplicationPage (Ollama chat), ...
│       └── routes.ts
├── csc_extension_dashboard_frontend/  # Monitoring dashboard
├── FileTract/                    # Flask + OCR + LLM backend
│   ├── app.py                    # REST API, Gemini/Groq/Ollama
│   ├── patent_ocr_pipeline.py
│   ├── gemini_ocr_extract.py
│   └── ...
├── validationRules.js            # Validation helpers (if used)
├── aiAssistant.js                # Legacy/alternate AI script (if used)
└── README.md                     # This file
```

---

## Setup & Running

### Prerequisites

- **Node.js** (v18+)
- **Python** 3.9+ (for FileTract)
- **Tesseract OCR** (for FileTract; path in scripts if needed)
- **Groq API key** (extension chat, optional field mapping; can be in chrome.storage or env)
- **Gemini API key** (FileTract; in `.env`)
- **Ollama** (optional for local extraction in FileTract; **required** for desktop AI chatbot)

### 1. Chrome Extension

```bash
cd extension_frontend
npm install
npm run build
```

Load the **root folder** (where `manifest.json` is) in Chrome as an unpacked extension (`chrome://extensions/` → Developer mode → Load unpacked). The side panel uses `extension_frontend/dist/index.html`.

### 2. FileTract Backend

```bash
cd FileTract
pip install -r requirements.txt
# Create .env with GEMINI_API_KEY (and optional GROQ/Ollama config)
python app.py
```

Runs at **http://127.0.0.1:5000** (or port in script). Extension and desktop can call this for extraction.

### 3. Desktop Application

```bash
cd csc_desktop_application_frontend
npm install
npm run dev
```

For the **AI chatbot** to work, run **Ollama** locally and pull a model, e.g.:

```bash
ollama run llama3.2
```

The desktop app uses `llama3.2` by default in `ollamaChatApi.ts`; ensure the KB is present at `public/knowledge_base/csc_kb1.json` (copy from repo `knowledge_base/` if needed).

### 4. Dashboard

```bash
cd csc_extension_dashboard_frontend
npm install
npm run dev
```

Configure Firestore or other data source if the dashboard expects live sessions/analytics.

### 5. Knowledge Base

- **Extension:** KB is loaded from the packaged `knowledge_base/` (see manifest).
- **Desktop:** Copy `knowledge_base/csc_kb1.json` to `csc_desktop_application_frontend/public/knowledge_base/` so the Ollama chatbot can fetch it; the project may already include this copy.

---

## Permissions & Security

- **Extension (manifest):** `activeTab`, `scripting`, `storage`, `tabs`, `sidePanel`, `alarms`; host permissions for `<all_urls>`, Groq, and `http://localhost:5000`. CSP restricts extension pages to approved script and connect sources.
- **Sensitive keys:** Prefer chrome.storage or environment variables; avoid hardcoding production keys in repo.
- **Content script:** Only runs on pages; receives messages from the extension to scan/fill forms; no direct key access.

---

## Technology Stack

| Part            | Stack |
|----------------|-------|
| Extension UI   | React 18, Vite, Tailwind, React Router (hash), Radix UI, Lucide, Framer Motion |
| Content script | Vanilla JS (injected) |
| Desktop app    | React, Vite, Tailwind, React Router (browser), Lucide |
| Dashboard      | React, Vite, Tailwind |
| FileTract      | Python 3, Flask, Tesseract, PyMuPDF, OpenCV, Gemini/Groq/Ollama |
| AI (extension) | Groq (chat + optional field mapping), knowledge base |
| AI (desktop)   | Ollama (local chat), same knowledge base |

---

*Built to support India’s Common Service Centres and bridge the digital divide.*
