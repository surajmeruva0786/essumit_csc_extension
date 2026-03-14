/* ============================================================
   CSC Sahayak — Content Script
   Form Detection + Auto-Fill Logic
   ============================================================ */

(() => {
  "use strict";

  // ─── Known government form domains ─────────────────────────
  const GOV_DOMAINS = [
    "digilocker.gov.in",
    "umang.gov.in",
    "serviceonline.gov.in",
    "edistrict",
    "cgedistrict",
    "pmjay.gov.in",
    "pmkisan.gov.in",
    "nrega.nic.in",
    "passport.gov.in",
    "incometax.gov.in",
    "epfindia.gov.in",
    "csc.gov.in",
    "apnacsc.com",
    "uidai.gov.in",
    "meeseva",
    "emitra",
    "jansunwai",
    "parivahan.gov.in",
    "sarathi.parivahan.gov.in",
    "vahan.parivahan.gov.in",
    "aadhaar",
    "pan.utiitsl.com",
    "tin-nsdl.com",
    "sw.cg.gov.in",
    "kisan.cg.nic.in",
    "khadya.cg.nic.in",
    "cgstate.gov.in"
  ];

  // ─── Form Detection ───────────────────────────────────────
  function detectGovernmentForm() {
    const hostname = window.location.hostname.toLowerCase();
    const href = window.location.href.toLowerCase();

    for (const domain of GOV_DOMAINS) {
      if (hostname.includes(domain) || href.includes(domain)) {
        return domain;
      }
    }
    return null;
  }

  // Run detection
  const detectedDomain = detectGovernmentForm();

  if (detectedDomain) {
    chrome.runtime.sendMessage({
      type: "FORM_DETECTED",
      domain: detectedDomain,
      url: window.location.href,
      title: document.title
    });
  } else {
    chrome.runtime.sendMessage({
      type: "NO_FORM"
    });
  }

  // ─── Auto‐Fill + Form Scanning (triggered by panel) ────────

  /**
   * Dismiss common full-page loading overlays so the form is accessible after auto-fill.
   * Many government portals keep a loading overlay visible; we hide likely candidates
   * and also re-enable pointer events on the main page.
   */
  function dismissPageLoadingOverlay() {
    try {
      // 1) Remove obvious full-screen overlay elements
      const candidates = [
        "[class*='loading'][class*='overlay']",
        "[id*='loading'][id*='overlay']",
        "[class*='loader']",
        ".loading-overlay",
        ".page-loader",
        "[class*='blockui']",
        "[id*='blockui']",
        "[class*='modal-backdrop']",
        "[class*='spinner']",
        "[class*='overlay'][style*='fixed']",
        "div[style*='position: fixed'][style*='z-index']"
      ];
      const toHide = [];
      candidates.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(el => {
            const style = window.getComputedStyle(el);
            const isFixed = style.position === "fixed" || el.style.position === "fixed";
            const zIndex = parseInt(style.zIndex || el.style.zIndex || "0", 10);
            const coversScreen =
              isFixed &&
              (zIndex > 50 || (el.offsetWidth >= window.innerWidth * 0.6 && el.offsetHeight >= window.innerHeight * 0.4));
            const cls = el.className ? String(el.className).toLowerCase() : "";
            if (coversScreen || cls.includes("loading") || cls.includes("overlay") || cls.includes("blockui")) {
              toHide.push(el);
            }
          });
        } catch (e) { /* ignore invalid selector */ }
      });
      toHide.forEach(el => {
        if (el && el.parentNode) {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("pointer-events", "none", "important");
          el.setAttribute("data-csc-dismissed", "1");
        }
      });

      // 2) Some sites gray out the whole page via a "loading" class on body/html
      const roots = [document.body, document.documentElement];
      roots.forEach(root => {
        if (!root || !root.classList) return;
        const classesToRemove = [];
        root.classList.forEach(cls => {
          const lower = cls.toLowerCase();
          if (lower.includes("loading") || lower.includes("overlay") || lower.includes("blockui")) {
            classesToRemove.push(cls);
          }
        });
        classesToRemove.forEach(c => root.classList.remove(c));
        root.style.setProperty("pointer-events", "auto", "important");
        root.style.removeProperty("filter");
        root.style.removeProperty("opacity");
      });
    } catch (e) {
      // Non-fatal; best-effort only
    }
  }

  /**
   * After autofill, run overlay dismissal multiple times (in case the site
   * toggles its loader a bit later).
   */
  function scheduleOverlayCleanup() {
    dismissPageLoadingOverlay();
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts += 1;
      dismissPageLoadingOverlay();
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);
  }

  /**
   * Some portals keep re-attaching loaders or toggling classes dynamically.
   * Watch the DOM for a short period after auto-fill and continuously remove blockers.
   */
  let cscOverlayObserver = null;
  function startTemporaryOverlayObserver(durationMs = 20000) {
    try {
      if (cscOverlayObserver) {
        cscOverlayObserver.disconnect();
        cscOverlayObserver = null;
      }
      cscOverlayObserver = new MutationObserver(() => {
        dismissPageLoadingOverlay();
      });
      cscOverlayObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "aria-busy", "disabled"]
      });
      setTimeout(() => {
        try {
          if (cscOverlayObserver) cscOverlayObserver.disconnect();
          cscOverlayObserver = null;
        } catch (e) {}
      }, durationMs);
    } catch (e) {
      // best-effort only
    }
  }

  /**
   * Many CG/eDistrict portals use a global loadingToggle() function with a
   * .loading + .overlay spinner that can get stuck. Patch it so that even if
   * the page calls loadingToggle(1) and never calls loadingToggle(0),
   * we auto-hide the overlay after a short grace period.
   */
  function patchPortalLoadingToggle() {
    try {
      const w = window;
      if (!w || typeof w.loadingToggle !== "function") return;
      if (w.loadingToggle && w.loadingToggle.__csc_patched) return;

      const original = w.loadingToggle;
      const patched = function patchedLoadingToggle(flag) {
        try {
          // Call original implementation so the site logic still works.
          original.apply(this, arguments);
        } catch (e) {
          // Ignore original errors; we still enforce our cleanup below.
        }

        try {
          const wrappers = document.querySelectorAll(".loading, .overlay");
          wrappers.forEach(el => {
            if (!el) return;
            if (flag === 0) {
              // Explicit hide request
              el.style.setProperty("display", "none", "important");
              el.style.setProperty("pointer-events", "none", "important");
            } else {
              // Show request: ensure it cannot block forever
              el.style.setProperty("display", "block", "important");
              el.style.setProperty("pointer-events", "auto", "important");
              setTimeout(() => {
                try {
                  el.style.setProperty("display", "none", "important");
                  el.style.setProperty("pointer-events", "none", "important");
                } catch (e) {}
              }, 8000); // max 8s before we force-hide
            }
          });
        } catch (e) {}
      };

      patched.__csc_patched = true;
      w.loadingToggle = patched;
    } catch (e) {
      // best-effort only
    }
  }

  /** Ensure the page can be interacted with (pointer events / scrolling). */
  function forceUnblockPageInteraction() {
    try {
      const roots = [document.body, document.documentElement];
      roots.forEach(root => {
        if (!root) return;
        root.style.setProperty("pointer-events", "auto", "important");
        // Many loaders also lock scrolling
        if ((root.style.overflow || "").toLowerCase() === "hidden") {
          root.style.setProperty("overflow", "auto", "important");
        }
      });
      // Remove any lingering cursor-wait on body
      if (document.body) document.body.style.removeProperty("cursor");
    } catch (e) {}
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTO_FILL_FORM") {
      var fields = Object.assign({}, message.fields || {});
      var selectors = Object.assign({}, message.selectors || {});
      var confidenceMap = Object.assign({}, message.confidenceMap || {});
      var filledSelectors = new Set(Object.values(selectors));
      var scanned = scanFormFields();
      scanned.forEach(function (f) {
        if (!f.options || !f.options.length) return;
        if (filledSelectors.has(f.selector)) return;
        var key = f.fieldKey || ("dropdown_" + (f.selector || "").replace(/[^a-zA-Z0-9]/g, "_"));
        fields[key] = "__random__";
        selectors[key] = f.selector;
        confidenceMap[key] = 0.5;
        filledSelectors.add(f.selector);
      });
      const result = autoFillForm(fields, selectors, confidenceMap, message.filePayloads || {});
      // Give the page a moment to show its own loader, then repeatedly clear it.
      setTimeout(() => {
        patchPortalLoadingToggle();
        scheduleOverlayCleanup();
        startTemporaryOverlayObserver(20000);
        forceUnblockPageInteraction();
      }, 300);
      sendResponse(result);
    } else if (message.type === "SCAN_FORM_FIELDS") {
      const scannedFields = scanFormFields();
      sendResponse(scannedFields);
    } else if (message.action === "FILL_FORM_DESKTOP") {
      // Handle the data specifically coming from the offline desktop sync
      const desktopFields = message.data || [];
      const liveFormFields = scanFormFields(); // Discover fields on current page
      
      const mappedFields = {};
      const mappedSelectors = {};
      const confidenceMap = {};
      
      // Attempt to map desktop fieldEn / field to a live form field
      desktopFields.forEach(df => {
        const val = df.extracted;
        if (!val || val === '—' || val === '-') return;
        
        // Find best match in live fields based on English or Hindi label
        const match = liveFormFields.find(lf => {
           const labelLower = (lf.label || "").toLowerCase();
           const labelHiLower = (lf.labelHi || "").toLowerCase();
           const nameLower = (lf.fieldKey || "").toLowerCase();
           
           const targetEn = (df.fieldEn || "").toLowerCase();
           const targetHi = (df.field || "").toLowerCase();
           
           // If they share common words
           return (targetEn && (labelLower.includes(targetEn) || targetEn.includes(labelLower) || targetEn.includes(nameLower))) || 
                  (targetHi && (labelHiLower.includes(targetHi) || targetHi.includes(labelHiLower)));
        });
        
        if (match) {
           mappedFields[match.fieldKey] = val;
           mappedSelectors[match.fieldKey] = match.selector;
           confidenceMap[match.fieldKey] = 0.95; // Assume high confidence for reviewed offline data
        }
      });
      var filledSel = new Set(Object.values(mappedSelectors));
      liveFormFields.forEach(function (f) {
        if (!f.options || !f.options.length) return;
        if (filledSel.has(f.selector)) return;
        var key = f.fieldKey || ("dropdown_" + (f.selector || "").replace(/[^a-zA-Z0-9]/g, "_"));
        mappedFields[key] = "__random__";
        mappedSelectors[key] = f.selector;
        confidenceMap[key] = 0.5;
        filledSel.add(f.selector);
      });
      const result = autoFillForm(mappedFields, mappedSelectors, confidenceMap, {});
      
      setTimeout(() => {
        patchPortalLoadingToggle();
        scheduleOverlayCleanup();
        startTemporaryOverlayObserver(20000);
        forceUnblockPageInteraction();
      }, 300);
      
      sendResponse(result);
    }
    return true;
  });

  // ─── Dynamic Form Field Scanner ───────────────────────────

  /**
   * Scan the current page for all form fields.
   * Returns an array of discovered fields with their selectors and labels.
   *
   * @returns {Array<{ fieldKey, label, labelHi, selector, type, tagName, options? }>}
   */
  function scanFormFields() {
    const fields = [];
    const seen = new Set();

    // Common Hindi → English label mapping for known government fields
    const HINDI_LABEL_MAP = {
      "जन्म की तारीख": "dateOfBirth", "जन्म तिथि": "dateOfBirth",
      "वार्षिक आय": "annualIncome", "आय": "annualIncome",
      "पिता का नाम": "fatherName", "पिता": "fatherName",
      "माँ का नाम": "motherName", "माता का नाम": "motherName",
      "लिंग": "gender", "कृपया लिंग चुनें": "gender",
      "जिला": "district", "ज़िला": "district",
      "पिन कोड": "pinCode", "पिनकोड": "pinCode",
      "राष्ट्रीयता": "nationality",
      "वोटर आई.डी": "voterId", "वोटर": "voterId",
      "जाति": "caste", "कास्ट": "caste",
      "कास्ट श्रेणी": "casteCategory", "जाति श्रेणी": "casteCategory",
      "श्रेणी": "category",
      "शिक्षा": "education", "कृपया शिक्षा का चयन करें": "education",
      "पेशा": "occupation", "पेशे": "occupation", "व्यवसाय": "occupation",
      "वैवाहिक स्थिति": "maritalStatus",
      "बीपीएल संख्या": "bplNumber", "बीपीएल": "bplNumber",
      "आवेदक का नाम": "applicantName", "नाम": "applicantName",
      "पता": "address",
      "मोबाइल": "mobileNumber", "मोबाइल नंबर": "mobileNumber",
      "आधार": "aadhaarNumber", "आधार नंबर": "aadhaarNumber",
      "बैंक खाता": "bankAccountNumber",
      "आईएफएससी": "ifscCode", "ifsc": "ifscCode",
      "बैंक का नाम": "bankName",
      "तहसील": "tehsil",
      "गाँव": "village", "ग्राम": "village"
    };

    const SKIP_TYPES = new Set(["hidden", "submit", "button", "reset", "image", "password"]);

    const elements = document.querySelectorAll("input, select, textarea");

    elements.forEach((el) => {
      // Skip unwanted types (file is included so we can extract upload fields and later fill them)
      const inputType = (el.type || "text").toLowerCase();
      if (SKIP_TYPES.has(inputType)) return;

      // Skip invisible elements
      if (el.offsetParent === null && el.type !== "hidden") return;

      // Build the best CSS selector
      const selector = buildSelector(el);
      if (seen.has(selector)) return;
      seen.add(selector);

      // Find the label text
      const labelInfo = findLabelForElement(el);
      const labelText = labelInfo.text;

      // Derive a fieldKey
      let fieldKey = null;

      // Try Hindi mapping first
      const labelLower = labelText.replace(/[*:\s]+/g, " ").trim();
      for (const [hindiPattern, key] of Object.entries(HINDI_LABEL_MAP)) {
        if (labelLower.includes(hindiPattern)) {
          fieldKey = key;
          break;
        }
      }

      // Fallback: use name or id attribute
      if (!fieldKey && el.name && el.name.length > 1 && !/^\d+$/.test(el.name)) {
        fieldKey = toCamelCase(el.name);
      }
      if (!fieldKey && el.id && el.id.length > 1 && !/^\d+$/.test(el.id)) {
        fieldKey = toCamelCase(el.id);
      }

      // Fallback: derive from English part of label
      if (!fieldKey && labelText) {
        const englishPart = labelText.replace(/[^\x00-\x7F()]/g, "").replace(/[*:()]/g, "").trim();
        if (englishPart.length >= 2) {
          fieldKey = toCamelCase(englishPart);
        }
      }

      // Last resort: use selector hash
      if (!fieldKey) {
        fieldKey = `field_${el.name || el.id || Math.random().toString(36).slice(2, 8)}`;
      }

      // Avoid duplicate keys
      if (fields.find(f => f.fieldKey === fieldKey)) {
        fieldKey = fieldKey + "_" + (el.name || el.id || fields.length);
      }

      const fieldInfo = {
        fieldKey: fieldKey,
        label: labelInfo.text || fieldKey,
        labelHi: labelInfo.textHi || "",
        selector: selector,
        type: inputType,
        tagName: el.tagName.toLowerCase()
      };

      // For select elements, include all dropdown options (value + text)
      if (el.tagName === "SELECT") {
        fieldInfo.options = Array.from(el.options)
          .slice(0, 100)
          .map(opt => ({ value: (opt.value || "").trim(), text: (opt.textContent || "").trim() }));
      }

      // For file inputs, include accept and hint for matching (e.g. Aadhaar, Photo)
      if (inputType === "file") {
        fieldInfo.accept = (el.accept || "").trim() || null;
        fieldInfo.multiple = !!el.multiple;
      }

      fields.push(fieldInfo);
    });

    return fields;
  }

  /**
   * Build the most reliable CSS selector for an element.
   */
  function buildSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    if (el.name) return `${el.tagName.toLowerCase()}[name="${CSS.escape(el.name)}"]`;
    // Fallback: nth-child-based
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.querySelectorAll(el.tagName.toLowerCase()));
      const idx = siblings.indexOf(el);
      if (idx >= 0) {
        const parentSel = parent.id ? `#${CSS.escape(parent.id)}` : el.tagName.toLowerCase();
        return `${parentSel} > ${el.tagName.toLowerCase()}:nth-of-type(${idx + 1})`;
      }
    }
    return el.tagName.toLowerCase();
  }

  /**
   * Find the label text associated with a form element.
   */
  function findLabelForElement(el) {
    let text = "";
    let textHi = "";

    // Method 1: explicit <label for="...">
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label) {
        text = label.textContent.trim();
        textHi = text;
      }
    }

    // Method 2: parent/ancestor label
    if (!text) {
      const parentLabel = el.closest("label");
      if (parentLabel) {
        text = parentLabel.textContent.trim();
        textHi = text;
      }
    }

    // Method 3: previous sibling or parent's previous sibling (common in table/div layouts)
    if (!text) {
      // Check nearby text: td/th before this element
      const parent = el.parentElement;
      if (parent) {
        const prevEl = parent.previousElementSibling;
        if (prevEl && prevEl.textContent.trim().length < 100) {
          text = prevEl.textContent.trim();
          textHi = text;
        }
      }
    }

    // Method 4: look for preceding heading/span/label text within same row/container
    if (!text) {
      const container = el.closest("tr, .form-group, .form-row, .field-wrapper, div");
      if (container) {
        const labelEl = container.querySelector("label, .label, th, span.field-label, legend");
        if (labelEl && labelEl.textContent.trim().length < 100) {
          text = labelEl.textContent.trim();
          textHi = text;
        }
      }
    }

    // Method 5: placeholder
    if (!text && el.placeholder) {
      text = el.placeholder;
    }

    // Method 6: title attribute
    if (!text && el.title) {
      text = el.title;
    }

    return { text: text.replace(/\s+/g, " ").trim(), textHi };
  }

  /**
   * Convert a string label to camelCase fieldKey.
   * "Father's Name" → "fathersName"
   * "date_of_birth" → "dateOfBirth"
   */
  function toCamelCase(str) {
    return str
      .replace(/['']/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((word, i) => i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");
  }


  /**
   * Auto-fill form fields on the current page.
   *
   * @param {Object} fields       — { fieldName: value }
   * @param {Object} selectors    — { fieldName: "css-selector, ..." }
   * @param {Object} confidenceMap — { fieldName: confidence (0–1) }
   * @param {Object} filePayloads — optional { "selector": { base64, fileName, mimeType } }
   * @returns {{ filledCount, totalFields, details }}
   */
  function autoFillForm(fields, selectors, confidenceMap, filePayloads) {
    const details = [];
    let filledCount = 0;
    const totalFields = Object.keys(fields).length + (filePayloads ? Object.keys(filePayloads).length : 0);
    const filledElements = new Set();

    injectAutoFillStyles();

    // 1. Fill text/select/textarea fields from the provided list
    for (const [fieldName, value] of Object.entries(fields)) {
      if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
        details.push({ field: fieldName, status: "skipped", reason: "empty value" });
        continue;
      }

      const selectorStr = selectors[fieldName];
      if (!selectorStr) {
        details.push({ field: fieldName, status: "skipped", reason: "no selector" });
        continue;
      }

      const element = findElement(selectorStr);
      if (!element) {
        details.push({ field: fieldName, status: "not_found", reason: "element not found" });
        continue;
      }

      const tagName = element.tagName && element.tagName.toLowerCase();
      const isFileInput = tagName === "input" && (element.type || "").toLowerCase() === "file";
      if (isFileInput) {
        details.push({ field: fieldName, status: "skipped", reason: "file field (use filePayloads)" });
        continue;
      }

      filledElements.add(element);
      const confidence = confidenceMap[fieldName] || 0;

      try {
        fillElement(element, value);
        highlightElement(element, confidence);
        filledCount++;
        details.push({ field: fieldName, status: "filled", confidence });
      } catch (e) {
        details.push({ field: fieldName, status: "error", reason: e.message });
      }
    }

    // 2. Fill every remaining <select> on the page that wasn't filled yet (ensure all dropdowns get a selection)
    Array.from(document.querySelectorAll("select")).forEach(function (sel) {
      if (filledElements.has(sel)) return;
      if (!sel.options || sel.options.length === 0) return;
      try {
        fillElement(sel, "__random__");
        highlightElement(sel, 0.5);
        filledCount++;
        details.push({ field: "select_" + (sel.name || sel.id || "n"), status: "filled", confidence: 0.5 });
      } catch (e) {
        details.push({ field: "select_" + (sel.name || sel.id || "n"), status: "error", reason: (e && e.message) || "select fill failed" });
      }
    });

    // 3. Fill file inputs from filePayloads (selector -> { base64, fileName, mimeType })
    if (filePayloads && typeof filePayloads === "object") {
      for (const [selectorStr, payload] of Object.entries(filePayloads)) {
        if (!payload || !payload.base64) continue;
        try {
          const element = findElement(selectorStr);
          if (!element || element.tagName.toLowerCase() !== "input" || (element.type || "").toLowerCase() !== "file") {
            details.push({ field: selectorStr, status: "not_found", reason: "file input not found" });
            continue;
          }
          const binary = atob(payload.base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const file = new File([bytes], payload.fileName || "document", { type: payload.mimeType || "application/octet-stream" });
          const dt = new DataTransfer();
          dt.items.add(file);
          element.files = dt.files;
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
          filledCount++;
          details.push({ field: selectorStr, status: "filled", confidence: 0.95 });
        } catch (e) {
          details.push({ field: selectorStr, status: "error", reason: (e && e.message) || "file fill failed" });
        }
      }
    }

    return { filledCount, totalFields, details };
  }

  /**
   * Find an element using comma-separated selectors.
   * Falls back to label text, placeholder, and fuzzy name/id matching.
   */
  function findElement(selectorStr) {
    const selectors = selectorStr.split(",").map(s => s.trim());
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) { /* invalid selector */ }
    }

    // Fallback 1: extract key hints from selector strings (name="xxx" → xxx)
    const nameHints = [];
    for (const sel of selectors) {
      const nameMatch = sel.match(/\[name=['"](.*?)['"]\]/);
      if (nameMatch) nameHints.push(nameMatch[1].toLowerCase());
      const idMatch = sel.match(/#([a-zA-Z0-9_-]+)/);
      if (idMatch) nameHints.push(idMatch[1].toLowerCase());
    }

    if (nameHints.length > 0) {
      // Fallback 2: fuzzy match against all input/select/textarea elements
      const allFields = Array.from(document.querySelectorAll("input, select, textarea"));
      for (const el of allFields) {
        const elName = (el.name || "").toLowerCase();
        const elId   = (el.id   || "").toLowerCase();
        const elPlaceholder = (el.placeholder || "").toLowerCase();
        for (const hint of nameHints) {
          if (elName.includes(hint) || elId.includes(hint) || elPlaceholder.includes(hint)) {
            return el;
          }
        }
      }

      // Fallback 3: match by associated <label> text
      const allLabels = Array.from(document.querySelectorAll("label"));
      for (const label of allLabels) {
        const labelText = (label.textContent || "").toLowerCase().replace(/[*:\s]+/g, " ").trim();
        for (const hint of nameHints) {
          if (labelText.includes(hint)) {
            // Find associated input
            const forAttr = label.htmlFor || label.getAttribute("for");
            if (forAttr) {
              const associated = document.getElementById(forAttr);
              if (associated) return associated;
            }
            // Or look for a nearby input sibling
            const sibling = label.parentElement
              ? label.parentElement.querySelector("input, select, textarea")
              : null;
            if (sibling) return sibling;
          }
        }
      }
    }

    return null;
  }

  /**
   * Fill a form element with a value, triggering appropriate events.
   */
  function fillElement(element, value) {
    if (value === undefined || value === null) return;
    const tagName = element.tagName.toLowerCase();
    const cleanVal = String(value).trim().toLowerCase();

    if (tagName === "select") {
      const forceRandom = cleanVal === "__random__" || cleanVal === "__dropdown_random__";
      let bestMatch = null;
      const valNoPunct = cleanVal.replace(/[^a-z0-9]/g, "");

      if (!forceRandom) for (const opt of element.options) {
        const optVal = (opt.value || "").toLowerCase();
        const optText = (opt.textContent || "").trim().toLowerCase();
        const optTextNoPunct = optText.replace(/[^a-z0-9]/g, "");

        if (optVal === cleanVal || optText === cleanVal) {
          bestMatch = opt;
          break;
        }
        if (optTextNoPunct && valNoPunct && optTextNoPunct === valNoPunct) {
          bestMatch = opt;
          break;
        }
        if (optText.includes(cleanVal) || (cleanVal && optText && (cleanVal.includes(optText) || optTextNoPunct.includes(valNoPunct)))) {
          bestMatch = opt;
        }
      }

      if (bestMatch) {
        element.value = bestMatch.value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        // No similarity detected (or __random__ requested): choose a random valid option (skip placeholders like "चुनिये" / "Choose")
        var placeholderTexts = /^(चुनिये|choose|select|please select|कृपया चुनें|--|\-\s*)$/i;
        var validOptions = Array.from(element.options).filter(function (opt) {
          var v = (opt.value || "").trim();
          var t = (opt.textContent || "").trim();
          if (v.length === 0 && placeholderTexts.test(t)) return false;
          return v.length > 0 || t.length > 0;
        });
        if (validOptions.length > 0) {
          var randomIndex = Math.floor(Math.random() * validOptions.length);
          var chosen = validOptions[randomIndex];
          var setVal = chosen.value || (chosen.textContent || "").trim();
          element.value = setVal;
          if (element.value !== setVal && chosen.index >= 0) element.selectedIndex = chosen.index;
        } else if (element.options.length > 1) {
          var firstReal = element.options[1];
          if (firstReal) {
            element.value = firstReal.value || (firstReal.textContent || "").trim();
            if (element.selectedIndex !== 1) element.selectedIndex = 1;
          }
        }
      }
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));

    } else if (tagName === "textarea") {
      element.value = value;
    } else if (tagName === "input") {
      const inputType = element.type?.toLowerCase() || "text";
      
      if (inputType === "checkbox" || inputType === "radio") {
        const shouldCheck = ["true", "yes", "1", "हाँ"].includes(cleanVal);
        element.checked = shouldCheck;
      } else if (inputType === "date") {
        // Date inputs REQUIRE yyyy-mm-dd format strictly.
        // Attempt to parse common formats (dd-mm-yyyy, dd/mm/yyyy) into yyyy-mm-dd
        let formattedDate = value;
        const parts = value.split(/[-/.]/);
        
        if (parts.length === 3) {
          if (parts[0].length === 4) {
             // already yyyy-mm-dd
             formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          } else if (parts[2].length === 4) {
             // assumed dd-mm-yyyy or mm-dd-yyyy (common in India is dd-mm)
             formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        element.value = formattedDate;
      } else {
        element.value = value;
      }
    }

    // Trigger events so the form recognizes the change.
    // Avoid aggressive blur() because some portals show a global loader and sometimes never clear it.
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /**
   * Highlight auto-filled element based on confidence.
   */
  function highlightElement(element, confidence) {
    element.classList.add("csc-autofilled");

    if (confidence >= 0.70) {
      element.classList.add("csc-confidence-high");
      element.title = "✨ Auto-filled by CSC Sahayak";
    } else {
      element.classList.add("csc-confidence-low");
      element.title = "⚠️ Auto-filled — Please verify / कृपया जाँचें";
    }

    // Add a small indicator badge
    const badge = document.createElement("span");
    badge.className = confidence >= 0.70
      ? "csc-autofill-badge csc-badge-ok"
      : "csc-autofill-badge csc-badge-warn";
    badge.textContent = confidence >= 0.70 ? "✨" : "⚠️";

    const parent = element.parentElement;
    if (parent) {
      parent.style.position = parent.style.position || "relative";
      parent.appendChild(badge);
    }
  }

  /**
   * Inject auto-fill highlighting CSS styles into the page.
   */
  function injectAutoFillStyles() {
    if (document.getElementById("csc-autofill-styles")) return;

    const style = document.createElement("style");
    style.id = "csc-autofill-styles";
    style.textContent = `
      .csc-autofilled {
        transition: all 0.3s ease !important;
      }
      .csc-confidence-high {
        background-color: #E3F2FD !important;
        border-color: #42A5F5 !important;
        box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.3) !important;
      }
      .csc-confidence-low {
        background-color: #FFF8E1 !important;
        border-color: #FFA726 !important;
        box-shadow: 0 0 0 2px rgba(255, 167, 38, 0.3) !important;
      }
      .csc-autofill-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        font-size: 14px;
        line-height: 1;
        z-index: 9999;
        pointer-events: none;
      }
      .csc-badge-ok {
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
      }
      .csc-badge-warn {
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        animation: csc-pulse 2s infinite;
      }
      @keyframes csc-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* 🔒 Hard kill common government portal loaders on autofill pages.
         This targets CG eDistrict-style .loading/.overlay spinners so they
         cannot block interaction after auto-fill. */
      .loading,
      .loading .overlay,
      .overlay,
      .overlay__inner,
      .overlay__content {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

})();
