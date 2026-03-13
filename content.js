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

  // ─── Auto‐Fill Logic (triggered by messages from panel) ────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTO_FILL_FORM") {
      const result = autoFillForm(message.fields, message.selectors, message.confidenceMap);
      sendResponse(result);
    }
    return true;
  });

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
   */
  function findElement(selectorStr) {
    const selectors = selectorStr.split(",").map(s => s.trim());
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) { /* invalid selector */ }
    }

    // Fallback: search by name/id attributes with fuzzy matching
    return null;
  }

  /**
   * Fill a form element with a value, triggering appropriate events.
   */
  function fillElement(element, value) {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "select") {
      // Try to find matching option
      const options = Array.from(element.options);
      const match = options.find(opt =>
        opt.value.toLowerCase() === value.toLowerCase() ||
        opt.textContent.trim().toLowerCase() === value.toLowerCase()
      );
      if (match) {
        element.value = match.value;
      } else {
        // Try partial match
        const partial = options.find(opt =>
          opt.textContent.trim().toLowerCase().includes(value.toLowerCase())
        );
        if (partial) element.value = partial.value;
      }
    } else if (tagName === "textarea") {
      element.value = value;
    } else if (tagName === "input") {
      const inputType = element.type?.toLowerCase();
      if (inputType === "checkbox" || inputType === "radio") {
        const shouldCheck = ["true", "yes", "1", "हाँ"].includes(value.toLowerCase());
        element.checked = shouldCheck;
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
