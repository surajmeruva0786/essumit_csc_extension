/* ============================================================
   CSC Sahayak — Utility Functions
   File handling, validation, and storage helpers
   ============================================================ */

const CSCUtils = (() => {
  "use strict";

  // ─── Constants ──────────────────────────────────────────────
  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
  const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // ─── File Handling ─────────────────────────────────────────

  /**
   * Validate a file before upload.
   * @param {File} file
   * @returns {{ valid: boolean, error_hi?: string, error_en?: string }}
   */
  function validateFile(file) {
    if (!file) {
      return {
        valid: false,
        error_hi: "कोई फ़ाइल नहीं चुनी गई।",
        error_en: "No file selected."
      };
    }

    // Check type
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error_hi: "⚠️ केवल PDF, JPG, PNG फ़ाइलें अनुमत हैं।",
        error_en: "Only PDF, JPG, and PNG files are allowed."
      };
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error_hi: `⚠️ फ़ाइल बहुत बड़ी है (${sizeMB}MB)। अधिकतम 5MB अनुमत है।`,
        error_en: `File too large (${sizeMB}MB). Maximum 5MB allowed.`
      };
    }

    return { valid: true };
  }

  /**
   * Read a file as base64 data URL.
   * @param {File} file
   * @returns {Promise<{ base64: string, mimeType: string, fileName: string }>}
   */
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          base64: reader.result,
          mimeType: file.type || "application/octet-stream",
          fileName: file.name,
          fileSize: file.size
        });
      };
      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Check if a file is an image (for thumbnail preview).
   * @param {string} mimeType
   * @returns {boolean}
   */
  function isImage(mimeType) {
    return mimeType === "image/jpeg" || mimeType === "image/png";
  }

  /**
   * Format file size for display.
   * @param {number} bytes
   * @returns {string}
   */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  // ─── Storage Helpers ───────────────────────────────────────

  /**
   * Save current session to chrome.storage.local.
   * @param {object} sessionData
   * @returns {Promise<void>}
   */
  function saveSession(sessionData) {
    return new Promise((resolve) => {
      try {
        // Strip base64 data from documents before saving to storage
        // (base64 is too large for chrome.storage — keep in memory only)
        const storageData = { ...sessionData };
        if (storageData.documents) {
          storageData.documents = storageData.documents.map((doc) => ({
            docType: doc.docType,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            uploaded: true
          }));
        }
        chrome.storage.local.set({ currentSession: storageData }, () => {
          console.log("Session saved:", storageData);
          resolve();
        });
      } catch (e) {
        console.log("Session data (no chrome.storage):", sessionData);
        resolve();
      }
    });
  }

  /**
   * Load current session from chrome.storage.local.
   * @returns {Promise<object|null>}
   */
  function loadSession() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get("currentSession", (result) => {
          resolve(result.currentSession || null);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  // ─── Formatting Helpers ────────────────────────────────────

  /**
   * Escape HTML special characters.
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Get current time as a formatted string.
   * @returns {string}
   */
  function getTimeString() {
    const now = new Date();
    return now.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
  }

  // ─── Public API ────────────────────────────────────────────
  return {
    validateFile,
    readFileAsBase64,
    isImage,
    formatFileSize,
    saveSession,
    loadSession,
    escapeHTML,
    getTimeString,
    ALLOWED_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE
  };
})();
