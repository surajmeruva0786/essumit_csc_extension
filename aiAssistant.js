// aiAssistant.js
// Provides the AI Validation Assistant using Groq API (online) with offline fallback

const AIAssistant = (() => {
  "use strict";

  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  const DEFAULT_GROQ_API_KEY = "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";
  // Use only currently supported Groq chat models. Avoid deprecated llama3-* models.
  const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];

  /** Get API key: from argument, then chrome.storage, then default. Always returns a Promise. */
  function getApiKey(apiKey) {
    if (apiKey && String(apiKey).trim()) return Promise.resolve(String(apiKey).trim());
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(["groqApiKey", "GROQ_API_KEY"], (items) => {
          const key = items.groqApiKey || items.GROQ_API_KEY || DEFAULT_GROQ_API_KEY;
          resolve(key && String(key).trim() ? String(key).trim() : DEFAULT_GROQ_API_KEY);
        });
      });
    }
    return Promise.resolve(DEFAULT_GROQ_API_KEY);
  }

  /**
   * Call Groq API with optional retry and model fallback.
   */
  async function callGroq(apiKey, body, retries = 2) {
    let lastError = null;
    for (const model of GROQ_MODELS) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...body, model })
          });
          if (res.ok) {
            const data = await res.json();
            const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            return raw ? String(raw).trim() : null;
          }
          const text = await res.text();
          lastError = { status: res.status, text };
          if (res.status === 401) {
            console.warn("[CSC Sahayak] Groq API: Invalid or expired API key (401). Set groqApiKey in extension storage or use a valid key.");
            return null;
          }
          if (res.status === 429) {
            if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
            continue;
          }
          if (res.status >= 500 && attempt < retries) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
        } catch (err) {
          lastError = err;
          if (attempt < retries) await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    if (lastError) console.warn("[CSC Sahayak] Groq API error:", lastError);
    return null;
  }

  /**
   * Validate the extracted form fields against the service-specific rules (online AI when possible).
   */
  async function validateApplication(serviceType, extractedFields, apiKey) {
    const resolvedKey = await getApiKey(apiKey);
    const rules = window.ValidationRules ? (window.ValidationRules[serviceType] || window.ValidationRules["default"]) : [];
    const defaultRules = window.ValidationRules ? window.ValidationRules["default"] : [];
    const allRules = [...new Set([...rules, ...defaultRules])];
    const fieldKeys = Object.keys(extractedFields || {});

    const systemPrompt = `You are the CSC Sahayak AI Validation Assistant. Analyze the extracted fields for a government application and predict the risk of rejection based strictly on the provided eligibility rules.

Service: ${serviceType}

Rules to enforce:
${allRules.map(r => "- " + r).join("\n")}

Extracted Information:
${JSON.stringify(extractedFields, null, 2)}

Return ONLY a raw JSON object (no markdown), strictly matching this schema:
{
  "overallRisk": "HIGH|MEDIUM|LOW",
  "riskScore": (float 0.0-1.0),
  "issues": [
    {
      "field": "field_name",
      "severity": "CRITICAL|WARNING|INFO",
      "message": "English explanation",
      "messageHindi": "Hindi explanation",
      "suggestion": "How the operator can fix this"
    }
  ],
  "eligibilityVerdict": "LIKELY_APPROVED|LIKELY_REJECTED|NEEDS_REVIEW",
  "summaryHindi": "1-2 sentences in Hindi",
  "summaryEnglish": "1-2 sentences in English"
}

If critical rules are violated (age mismatch, missing mandatory fields), set overallRisk to HIGH and eligibilityVerdict to LIKELY_REJECTED.
If data looks good with minor warnings, set MEDIUM and NEEDS_REVIEW.
If everything aligns with rules, set LOW and LIKELY_APPROVED.

Very important: when you populate the "field" property for each issue, you MUST use exactly one of these keys from the Extracted Information object so that it maps back to the UI fields:
${fieldKeys.join(", ") || "(no fields provided)"}

If an issue applies to multiple fields, create separate issue objects, one per field, each with "field" set to the most relevant key from this list.`;

    const responseText = await callGroq(resolvedKey, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze the data and return only the JSON object." }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    if (responseText) {
      try {
        let parsed = responseText;
        if (parsed.startsWith("```json")) parsed = parsed.replace(/```json\n?/, "").replace(/```$/, "");
        else if (parsed.startsWith("```")) parsed = parsed.replace(/```\n?/, "").replace(/```$/, "");
        const result = JSON.parse(parsed.trim());
        if (result && typeof result.overallRisk === "string") {
          result.isOfflineFallback = false;
          return result;
        }
      } catch (e) {
        console.warn("[CSC Sahayak] Groq response parse error:", e);
      }
    }

    console.log("[CSC Sahayak] Using offline rule-based validation (AI unavailable or key invalid).");
    return runOfflineValidation(extractedFields, allRules);
  }

  /**
   * Offline validation engine using basic heuristics when AI is unavailable.
   */
  function runOfflineValidation(fields, rules) {
    const issues = [];
    let riskScore = 0.1;
    let overallRisk = "LOW";
    let verdict = "LIKELY_APPROVED";

    // Basic heuristic checks based on field presence and basic values
    
    // Check missing fields (fields present in the object but with empty/null values)
    Object.entries(fields).forEach(([key, val]) => {
      if (!val || String(val).trim() === "") {
        issues.push({
          field: key,
          severity: "WARNING",
          message: `The field '${key}' is missing or empty.`,
          messageHindi: `फ़ील्ड '${key}' खाली है।`,
          suggestion: "Please fill this field manually if possible."
        });
        riskScore += 0.2;
      }
    });

    // Hardcoded logic for Age/DOB (if present)
    if (fields.dateOfBirth || fields.age) {
      const ageStr = fields.age || fields.dateOfBirth;
      // Very crude check for demonstration
      if (typeof ageStr === 'string' && ageStr.includes("2024") && rules.some(r => r.includes("21 days"))) {
         issues.push({
          field: "dateOfBirth",
          severity: "CRITICAL",
          message: "Application filed late. SDM order and late fee required.",
          messageHindi: "आवेदन देरी से किया गया है। एसडीएम आदेश और विलंब शुल्क आवश्यक है।",
          suggestion: "Attach late registration affidavit."
        });
        riskScore += 0.5;
      }
    }

    // Determine final status
    if (riskScore >= 0.7) {
      overallRisk = "HIGH";
      verdict = "LIKELY_REJECTED";
    } else if (riskScore >= 0.3) {
      overallRisk = "MEDIUM";
      verdict = "NEEDS_REVIEW";
    }

    return {
      overallRisk,
      riskScore: Math.min(riskScore, 1.0),
      issues,
      eligibilityVerdict: verdict,
      summaryEnglish: `Offline validation completed. Found ${issues.length} potential issues. AI analysis was unavailable.`,
      summaryHindi: `ऑफ़लाइन सत्यापन पूर्ण हुआ। ${issues.length} संभावित समस्याएँ मिलीं। AI विश्लेषण अनुपलब्ध था।`,
      isOfflineFallback: true
    };
  }

  /**
   * Use AI to pick the best dropdown option when extracted value does not exactly match.
   */
  async function pickBestDropdownOption(extractedValue, options) {
    if (!extractedValue || !options || options.length === 0) return null;
    const key = await getApiKey();
    if (!key) return null;
    const opts = options.slice(0, 100).map(o => ({ value: o.value || "", text: (o.text || o.value || "").trim() }));
    const listStr = opts.map((o, i) => `${i + 1}. value="${o.value}" text="${o.text}"`).join("\n");
    const responseText = await callGroq(key, {
      messages: [
        { role: "system", content: "Reply with ONLY the exact option value (the value= part) of the chosen option. If none match, reply with the first option's value." },
        { role: "user", content: `Extracted text: "${String(extractedValue).trim()}"\n\nDropdown options:\n${listStr}\n\nWhich option value best matches? Reply with only that value.` }
      ],
      temperature: 0.1,
      max_tokens: 100
    });
    if (!responseText) return opts[0] ? opts[0].value : null;
    const chosen = responseText.replace(/^["']|["']$/g, "").trim();
    const found = opts.find(o => String(o.value).trim() === chosen || String(o.text).trim() === chosen ||
      chosen.includes(String(o.value).trim()) || chosen.includes(String(o.text).trim()));
    return found ? found.value : (opts[0] ? opts[0].value : null);
  }

  return {
    validateApplication,
    pickBestDropdownOption
  };

})();

if (typeof window !== "undefined") {
  window.AIAssistant = AIAssistant;
}
