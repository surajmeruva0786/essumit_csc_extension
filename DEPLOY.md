# CSC Sahayak — Deployment Guide

This guide walks you through deploying all four parts: **Chrome Extension**, **FileTract backend**, **Desktop app (Electron)**, and **Dashboard**.

---

## Prerequisites

- Node.js 18+
- Python 3.9+ (for FileTract)
- Docker (optional, for FileTract)
- Chrome Web Store developer account (one-time fee) if publishing the extension publicly
- Accounts on your chosen hosts (Vercel/Netlify, Railway/Render, etc.)

---

## 1. Chrome Extension

### Build and pack

1. **Build the extension UI**
   ```bash
   cd extension_frontend
   npm install
   npm run build
   cd ..
   ```

2. **Pack for Chrome Web Store**
   - **Windows (PowerShell):**
     ```powershell
     .\scripts\pack-extension.ps1
     ```
   - **Manual:** Zip the root folder including:
     - `manifest.json`, `background.js`, `content.js`, `panel.html`, `panel.js`
     - `extension_frontend/dist/` (entire folder)
     - `icons/`, `knowledge_base/`, `mic_permission.html`, `mic_permission.js`
     - Exclude: `node_modules`, `.env`, `.git`, `*.zip`, other app folders

   Output: `csc-sahayak-extension.zip` in the repo root.

### Production API URL

Before packing for production, set the FileTract API base URL to your deployed backend:

- In extension code (e.g. `extension_frontend/src/app/api/filetractApi.ts` or wherever the extraction API is called), replace `http://localhost:5000` with `https://your-filetract-api.com`.
- In `manifest.json`, update `host_permissions` and `content_security_policy` to include your API origin (e.g. `https://your-filetract-api.com/*`).
- Rebuild the extension (`npm run build` in `extension_frontend`) and pack again.

### Publish

- Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
- Create a new item (or update existing), upload `csc-sahayak-extension.zip`.
- Fill in store listing, set visibility, submit for review.

### Internal / enterprise

- Distribute the zip and have users go to `chrome://extensions` → Developer mode → Load unpacked → select the unpacked folder (unzip first), **or**
- Use Chrome Enterprise policies to force-install the extension from a network path or internal URL.

---

## 2. FileTract backend

### Option A: Docker (recommended)

1. **Build and run locally to test**
   ```bash
   cd FileTract
   docker build -t filetract .
   docker run -p 5000:5000 \
     -e GROQ_API_KEY=your_groq_key \
     -e GEMINI_API_KEY=your_gemini_key \
     filetract
   ```

2. **Deploy to a cloud that supports Docker**
   - **Railway:** Connect repo, set root to `FileTract`, use the Dockerfile, add env vars (GROQ_API_KEY, GEMINI_API_KEY) in dashboard. Expose port 5000.
   - **Render:** New Web Service, connect repo, root directory `FileTract`, Docker, add env vars.
   - **Fly.io:** `fly launch` in FileTract, set env with `fly secrets set GROQ_API_KEY=... GEMINI_API_KEY=...`, then `fly deploy`.

3. **Custom domain / HTTPS**  
   Configure in the host’s dashboard (Railway/Render/Fly provide HTTPS by default).

### Option B: VPS (e.g. Ubuntu)

1. **Server setup**
   ```bash
   sudo apt update
   sudo apt install -y python3.11 python3-pip python3-venv tesseract-ocr nginx
   ```

2. **App**
   ```bash
   cd /opt
   sudo git clone <your-repo> csc-sahayak
   cd csc-sahayak/FileTract
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Environment**
   ```bash
   sudo nano .env
   # Add: GROQ_API_KEY=... GEMINI_API_KEY=...
   ```

4. **Run with gunicorn**
   ```bash
   gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app
   ```
   Use systemd or supervisor to keep it running. Put Nginx in front for HTTPS and proxy to `127.0.0.1:5000`.

### CORS

Ensure CORS allows your extension and dashboard origins. In FileTract, `CORS(app)` may allow all; for production you can restrict to specific origins (e.g. `chrome-extension://<id>`, your dashboard URL).

---

## 3. Desktop app (Electron)

The desktop app is now an Electron app. You distribute **installers**, not a website.

### Develop locally

```bash
cd csc_desktop_application_frontend
npm install
npm run electron:dev
```

This starts Vite and opens the Electron window (Ollama chatbot uses `localhost:11434` on the user’s machine).

### Build installers

```bash
cd csc_desktop_application_frontend
npm install
npm run electron:build
# or: npm run dist
```

- **Windows:** Installer and portable build appear in `release/` (e.g. `CSC Sahayak Desktop Setup 1.0.0.exe`).
- **macOS:** Run on a Mac to produce `.dmg` / `.app` in `release/`.
- **Linux:** AppImage or deb in `release/`.

### Distribute

- **Internal:** Put the `.exe` (Windows) or `.dmg` (Mac) on a shared drive or internal download page. Users install and run. No server needed.
- **Public:** Upload the installer to GitHub Releases, your website, or an app store. Optionally add auto-updates later (e.g. electron-updater).

### Note

The app uses Ollama at `http://localhost:11434`. Each operator must have Ollama installed and running locally (e.g. `ollama run llama3.2`). No change needed for “deployment”; deployment here means distributing the installer.

---

## 4. Dashboard (web)

The dashboard is a static Vite/React app.

### Build

```bash
cd csc_extension_dashboard_frontend
npm install
npm run build
```

Output: `dist/`.

### Deploy to Vercel

1. Connect the repo to Vercel.
2. Root directory: `csc_extension_dashboard_frontend`.
3. Build command: `npm run build`, output directory: `dist`.
4. Add env vars in Vercel if the app uses an API (e.g. `VITE_API_URL`).

### Deploy to Netlify

1. Connect the repo.
2. Base directory: `csc_extension_dashboard_frontend`.
3. Build command: `npm run build`, publish directory: `dist`.
4. Set env vars in Netlify if needed.

### Other hosts

Upload the contents of `dist/` to any static host (S3 + CloudFront, Firebase Hosting, etc.).

---

## 5. Summary

| Component   | Deploy action                    | Result |
|------------|-----------------------------------|--------|
| Extension  | Pack zip → Chrome Web Store / GPO | Users install from store or policy |
| FileTract  | Docker or VPS + gunicorn          | HTTPS API (e.g. api.yourdomain.com) |
| Desktop    | `npm run electron:build`         | Installer in `release/` → distribute |
| Dashboard  | Build → Vercel/Netlify/static     | Live URL (e.g. dashboard.yourdomain.com) |

After deployment, point the extension’s API base URL and manifest to your live FileTract URL, then rebuild and re-upload the extension.
