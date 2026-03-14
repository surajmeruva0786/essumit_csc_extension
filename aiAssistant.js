// aiAssistant.js
// Provides the AI Validation Assistant using Groq API or an offline fallback

const AIAssistant = (() => {
  "use strict";

  // Use the Groq API key (assumed available either from config or user settings)
  // For the purpose of this implementation, we map the claude-sonnet-4 alias to a capable Groq model
  // as the user specified "you can use groq models"
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  const GROQ_API_KEY = "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";
  
  // NOTE: For this demo/extension, we might just assume the user has set it up via options, 
  // but to make things work smoothly without immediate configuration, we will rely heavily 
  // on the offline fallback if the key is missing or invalid.
  
  /**
   * Validate the extracted form fields against the service-specific rules.
   * @param {string} serviceType - The ID of the service (e.g., 'income_certificate')
   * @param {Object} extractedFields - The key-value pairs of extracted data
   * @param {string} apiKey - Optional API key if retrieved from storage
   * @returns {Promise<Object>} Resolves to a structured JSON validation result
   */
  async function validateApplication(serviceType, extractedFields, apiKey = GROQ_API_KEY) {
    const rules = window.ValidationRules ? (window.ValidationRules[serviceType] || window.ValidationRules["default"]) : [];
    const defaultRules = window.ValidationRules ? window.ValidationRules["default"] : [];
    const allRules = [...new Set([...rules, ...defaultRules])];

    // Build the Prompt
    const systemPrompt = `You are the CSC Sahayak AI Validation Assistant. Your job is to analyze the extracted fields for a government application and predict the risk of rejection based strictly on the provided eligibility rules.

Service: ${serviceType}

Rules to enforce:
${allRules.map(r => "- " + r).join("\n")}

Extracted Information:
${JSON.stringify(extractedFields, null, 2)}

You must return a raw JSON object with no markdown wrapping, strictly matching this schema:
{
  "overallRisk": "HIGH|MEDIUM|LOW",
  "riskScore": (a float between 0.0 and 1.0),
  "issues": [
    {
      "field": "field_name",
      "severity": "CRITICAL|WARNING|INFO",
      "message": "English explanation of the issue",
      "messageHindi": "Hindi explanation of the issue",
      "suggestion": "How the operator can fix this"
    }
  ],
  "eligibilityVerdict": "LIKELY_APPROVED|LIKELY_REJECTED|NEEDS_REVIEW",
  "summaryHindi": "1-2 sentences summarizing the overall status in Hindi",
  "summaryEnglish": "1-2 sentences summarizing the overall status in English"
}

If any critical rules are violated (like age mismatch, missing mandatory fields), set overallRisk to HIGH and eligibilityVerdict to LIKELY_REJECTED.
If data looks good but has minor warnings, set MEDIUM and NEEDS_REVIEW.
If everything perfectly aligns with rules, set LOW and LIKELY_APPROVED.`;

    // Attempt Online AI Validation if API Key is present
    if (apiKey) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3-70b-8192", // A capable instruction-following model on Groq
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Analyze the data and return the JSON." }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          let parsedResult = data.choices[0].message.content;
          
          // Cleanup markdown if the model hallucinated it despite instructions
          if (parsedResult.startsWith("```json")) {
            parsedResult = parsedResult.replace(/```json\n?/, "").replace(/```$/, "");
          }
          
          return JSON.parse(parsedResult);
        } else {
          console.warn("Groq API failed. Falling back to offline validation.", await response.text());
        }
      } catch (err) {
        console.warn("Network error reaching Groq. Falling back to offline validation.", err);
      }
    }

    // Fallback: Offline Rule-Based Engine
    console.log("Running offline rule-based validation...");
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

  return {
    validateApplication
  };

})();

if (typeof window !== "undefined") {
  window.AIAssistant = AIAssistant;
}
