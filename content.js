/* ============================================================
   CSC Sahayak — Content Script (Form Detection)
   ============================================================ */

(() => {
  "use strict";

  // Known government form domains / URL patterns
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
    "tin-nsdl.com"
  ];

  /**
   * Check if the current page is a recognized government form.
   */
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
})();
