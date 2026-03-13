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

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTO_FILL_FORM") {
      const result = autoFillForm(message.fields, message.selectors, message.confidenceMap);
      sendResponse(result);
    } else if (message.type === "SCAN_FORM_FIELDS") {
      const scannedFields = scanFormFields();
      sendResponse(scannedFields);
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

    const SKIP_TYPES = new Set(["hidden", "submit", "button", "reset", "file", "image", "password"]);

    const elements = document.querySelectorAll("input, select, textarea");

    elements.forEach((el) => {
      // Skip unwanted types
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

      // For select elements, include options
      if (el.tagName === "SELECT") {
        fieldInfo.options = Array.from(el.options)
          .slice(0, 50) // Cap at 50 options
          .map(opt => ({ value: opt.value, text: opt.textContent.trim() }));
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
   * @returns {{ filledCount, totalFields, details }}
   */
  function autoFillForm(fields, selectors, confidenceMap) {
    const details = [];
    let filledCount = 0;
    const totalFields = Object.keys(fields).length;

    // Inject auto-fill styles if not already injected
    injectAutoFillStyles();

    for (const [fieldName, value] of Object.entries(fields)) {
      if (!value) {
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
    if (!value) return;
    const tagName = element.tagName.toLowerCase();
    const cleanVal = String(value).trim().toLowerCase();

    if (tagName === "select") {
      // Try to find matching option by value first, then text content
      let bestMatch = null;
      let highestSimilarity = 0;
      
      const valNoPunct = cleanVal.replace(/[^a-z0-9]/g, "");

      for (const opt of element.options) {
        const optVal = opt.value.toLowerCase();
        const optText = opt.textContent.trim().toLowerCase();
        const optTextNoPunct = optText.replace(/[^a-z0-9]/g, "");

        // Exact match
        if (optVal === cleanVal || optText === cleanVal) {
          bestMatch = opt;
          break;
        }

        // Without punctuation (e.g. "o.b.c." vs "obc")
        if (optTextNoPunct === valNoPunct) {
          bestMatch = opt;
          break;
        }

        // Partial match
        if (optText.includes(cleanVal) || cleanVal.includes(optText)) {
          bestMatch = opt;
        }
      }

      if (bestMatch) {
         element.value = bestMatch.value;
      }

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

    // Trigger events so the form recognizes the change
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
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
    `;
    document.head.appendChild(style);
  }

})();
