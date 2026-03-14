// aiAssistant.js
// Provides the AI Validation Assistant using Groq API (online) with offline fallback

const AIAssistant = (() => {
  "use strict";

  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  const DEFAULT_GROQ_API_KEY = "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";
  // Use only currently supported Groq chat models. Avoid deprecated llama3-* models.
  const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];

  // ─── Knowledge base (schemes + services) ─────────────────────────────────
  let KB_SERVICES = null;  // from knowledge_base/csc_kb1.json

  async function loadKnowledgeBase() {
    if (KB_SERVICES) return KB_SERVICES;
    if (typeof chrome === "undefined" || !chrome.runtime?.getURL) {
      KB_SERVICES = [];
      return KB_SERVICES;
    }
    try {
      const url = chrome.runtime.getURL("knowledge_base/csc_kb1.json");
      const res = await fetch(url);
      if (!res.ok) {
        KB_SERVICES = [];
        return KB_SERVICES;
      }
      const text = await res.text();
      // File is a JSON-ish string; ensure we parse it safely
      KB_SERVICES = JSON.parse(text);
    } catch (e) {
      console.warn("[AIAssistant] Failed to load knowledge base:", e);
      KB_SERVICES = [];
    }
    return KB_SERVICES;
  }

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
   * Chat helper for CSC operators.
   * Uses knowledge base + optional current application context (serviceId, extractedFields, citizen profile).
   *
   * context: {
   *   serviceId?: string;
   *   extractedFields?: Record<string, any>;
   *   citizenName?: string;
   *   citizenPhone?: string;
   * }
   */
  async function chat(question, context = {}, apiKey) {
    const resolvedKey = await getApiKey(apiKey);
    const kb = await loadKnowledgeBase();

    const qLower = String(question || "").toLowerCase();
    const serviceId = context.serviceId || "";
    const extractedFields = context.extractedFields || {};

    // Pick at most 8 relevant services from KB based on simple keyword matching
    let candidates = Array.isArray(kb) ? kb : [];
    if (serviceId) {
      candidates = candidates.filter(s => String(s.service_id || s.serviceId || "").includes(serviceId));
    } else if (qLower) {
      candidates = candidates
        .map(s => {
          const name = String(s.service_name || s.serviceName || "").toLowerCase();
          const tags = (s.tags || "").toLowerCase();
          let score = 0;
          if (qLower.includes(name.split(" ")[0] || "")) score += 3;
          if (name.includes("birth") && qLower.includes("birth")) score += 2;
          if (name.includes("death") && qLower.includes("death")) score += 2;
          if (tags && qLower.split(/\s+/).some(w => tags.includes(w))) score += 1;
          return { s, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(x => x.s);
    } else {
      candidates = candidates.slice(0, 8);
    }

    const kbSummary = candidates.map((s, idx) => {
      const name = s.service_name || s.serviceName || s.service_id || `Service ${idx + 1}`;
      const docs = Array.isArray(s.documents)
        ? s.documents.map(d => (d.document_type || d.type || d.name)).filter(Boolean)
        : [];
      const eligibility = (s.eligibility_rules || s.eligibility || []).slice(0, 5);
      const processing = s.processing_time || s.processing || "";
      return {
        id: s.service_id || s.serviceId || name,
        name,
        documents: docs,
        eligibility,
        processingTime: processing
      };
    });

    const contextSnippet = {
      serviceId,
      extractedFields,
      citizenName: context.citizenName || null,
      citizenPhone: context.citizenPhone || null
    };

    const systemPrompt = `
You are the CSC Sahayak AI Assistant for Common Service Centre operators in India.

Your job:
- Help operators decide which government scheme / service is best for a specific citizen.
- Explain eligibility, required documents, important rules and which portal/process to follow.
- When helpful, compare 2-3 possible schemes and clearly recommend 1–2 best options.

You have access to a structured knowledge base of schemes and services (JSON below) and optional live context from the current application.

KNOWLEDGE_BASE (partial, summarised):
${JSON.stringify(kbSummary, null, 2)}

CURRENT_APPLICATION_CONTEXT (may be empty):
${JSON.stringify(contextSnippet, null, 2)}

Instructions:
- ALWAYS answer in **Hindi first, then English** in the same message.
- For Hindi, use simple, operator-friendly language (not very formal).
- For English, keep it short and clear.
- If you are not fully sure, say so and suggest that the operator verify on the official portal (e.g., serviceonline.gov.in, state e‑district, etc.).
- If the operator's question is generic (e.g., "which scheme for widow with 3 children?"), infer likely state‑level or central schemes from your knowledge and the knowledge base.
- If information is missing (for income, age, caste, etc.), clearly list **what questions the operator should ask the citizen** before deciding.
- If extractedFields are provided, USE them to tailor the advice (age, gender, address, income, etc.).
- NEVER invent official URLs; if a URL is present in the knowledge base, you may use it, otherwise refer generically to the official portal.
`;

    const userPrompt = `
Operator Question:
${question}

Please give:
1) Short decision summary (Hindi).
2) Recommended scheme(s) with eligibility and key benefits (Hindi).
3) Required documents (Hindi, bullet list).
4) Step-by-step application process (Hindi, bullet list).
5) Short English summary (2–4 bullet points).`;

    const responseText = await callGroq(resolvedKey, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.25,
      max_tokens: 900
    });

    if (!responseText) {
      return "क्षमा करें, अभी AI सर्वर से कनेक्ट नहीं हो सका। कृपया बाद में फिर से कोशिश करें या आधिकारिक पोर्टल पर नियम देख लें।\n\nSorry, I could not reach the AI server right now. Please try again later or double‑check on the official government portal.";
    }
    return responseText;
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
    pickBestDropdownOption,
    chat
  };

})();

if (typeof window !== "undefined") {
  window.AIAssistant = AIAssistant;
}
