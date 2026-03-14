// smsService.js
// Simple SMS helper with pluggable provider (e.g., MSG91).

(() => {
  "use strict";

  // Replace with your actual SMS provider endpoint and API key.
  // These can be overridden via chrome.storage.local: { smsApiUrl, smsApiKey, smsSender }
  const DEFAULT_SMS_API_URL = "https://api.msg91.com/api/v5/sms"; // placeholder
  const DEFAULT_SMS_API_KEY = "YOUR_MSG91_API_KEY"; // placeholder (no real SMS)

  const TEMPLATES = {
    APPLICATION_SUBMITTED: "नमस्ते {name}! आपका {service} आवेदन सफलतापूर्वक जमा हो गया है। संदर्भ संख्या: {refId}",
    APPLICATION_CANCELLED: "नमस्ते {name}! आपका {service} आवेदन AI सहायक की सलाह पर रोका गया। कृपया CSC केंद्र पर दस्तावेज़ सुधार करें।",
    DOCUMENT_MISMATCH: "नमस्ते {name}! आपके दस्तावेज़ों में अंतर पाया गया। कृपया सही दस्तावेज़ लेकर CSC केंद्र आएं।"
  };

  function renderTemplate(template, params) {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      return params && params[key] != null ? String(params[key]) : "";
    });
  }

  async function loadConfig() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(["smsApiUrl", "smsApiKey", "smsSender"], (items) => {
          resolve({
            url: items.smsApiUrl || DEFAULT_SMS_API_URL,
            key: items.smsApiKey || DEFAULT_SMS_API_KEY,
            sender: items.smsSender || "CSCMSG"
          });
        });
      } catch (e) {
        resolve({ url: DEFAULT_SMS_API_URL, key: DEFAULT_SMS_API_KEY, sender: "CSCMSG" });
      }
    });
  }

  async function sendSMS(phone, templateType, params = {}) {
    try {
      const tpl = TEMPLATES[templateType];
      if (!tpl) {
        console.warn("[smsService] Unknown template type:", templateType);
        return false;
      }
      const text = renderTemplate(tpl, params);

      // Basic validation
      if (!phone || !/^\d{10,13}$/.test(phone.replace(/\D/g, ""))) {
        console.warn("[smsService] Invalid phone number:", phone);
        return false;
      }

      // Example MSG91-style payload (you will need to adapt to your provider)
      const cfg = await loadConfig();

      const payload = {
        template_id: params.templateId || undefined,
        shortcode: params.shortcode || undefined,
        sender: params.sender || cfg.sender,
        route: "4",
        unicode: 1,
        mobiles: phone,
        message: text
      };

      // If API key is missing, do NOT pretend success — just log and return false.
      if (!cfg.key || cfg.key.startsWith("YOUR_")) {
        console.warn("[smsService] SMS API key not configured. SMS not sent.", { phone, text, templateType });
        return false;
      }

      const res = await fetch(cfg.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: cfg.key
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.warn("[smsService] SMS send failed with status", res.status, await res.text());
        return false;
      }
      console.log("[smsService] SMS sent", { phone, templateType });
      return true;
    } catch (e) {
      console.warn("[smsService] sendSMS error", e);
      return false;
    }
  }

  const api = { sendSMS };

  if (typeof window !== "undefined") {
    window.SMSService = api;
  }
})();

