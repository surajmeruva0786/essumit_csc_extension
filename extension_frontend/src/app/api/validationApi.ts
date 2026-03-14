// validationApi.ts
// Calls Groq API for AI validation (same logic as aiAssistant.validateApplication)

import { getValidationRules } from '../config/validationRules';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_API_KEY = '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';
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];

export interface ValidationIssue {
  field: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  messageHindi?: string;
  suggestion?: string;
}

export interface ValidationResult {
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  issues: ValidationIssue[];
  eligibilityVerdict: 'LIKELY_APPROVED' | 'LIKELY_REJECTED' | 'NEEDS_REVIEW';
  summaryHindi?: string;
  summaryEnglish?: string;
  isOfflineFallback?: boolean;
}

function getApiKey(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['groqApiKey', 'GROQ_API_KEY'], (items: Record<string, string>) => {
        const key = items.groqApiKey || items.GROQ_API_KEY || DEFAULT_GROQ_API_KEY;
        resolve(key?.trim() || DEFAULT_GROQ_API_KEY);
      });
    });
  }
  return Promise.resolve(DEFAULT_GROQ_API_KEY);
}

async function callGroq(apiKey: string, body: Record<string, unknown>, retries = 2): Promise<string | null> {
  let lastError: Error | { status: number; text: string } | null = null;
  for (const model of GROQ_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...body, model }),
        });
        if (res.ok) {
          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content;
          return raw ? String(raw).trim() : null;
        }
        const text = await res.text();
        lastError = { status: res.status, text };
        if (res.status === 429 || (res.status >= 500 && attempt < retries)) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
      } catch (err) {
        lastError = err as Error;
        if (attempt < retries) await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  if (lastError) console.warn('[CSC Sahayak] Groq validation error:', lastError);
  return null;
}

function runOfflineValidation(
  extractedFields: Record<string, { value: string | null; confidence?: number }>,
  _rules: string[]
): ValidationResult {
  const issues: ValidationIssue[] = [];
  let riskScore = 0.1;

  Object.entries(extractedFields).forEach(([key, field]) => {
    const val = field?.value;
    if (!val || String(val).trim() === '') {
      issues.push({
        field: key,
        severity: 'WARNING',
        message: `The field '${key}' is missing or empty.`,
        messageHindi: `फ़ील्ड '${key}' खाली है।`,
        suggestion: 'Please fill this field manually if possible.',
      });
      riskScore += 0.2;
    }
  });

  const overallRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
    riskScore >= 0.6 ? 'HIGH' : riskScore >= 0.3 ? 'MEDIUM' : 'LOW';
  const eligibilityVerdict: ValidationResult['eligibilityVerdict'] =
    overallRisk === 'HIGH' ? 'LIKELY_REJECTED' : overallRisk === 'MEDIUM' ? 'NEEDS_REVIEW' : 'LIKELY_APPROVED';

  return {
    overallRisk,
    riskScore: Math.min(1, riskScore),
    issues,
    eligibilityVerdict,
    summaryHindi: issues.length ? 'कुछ फ़ील्ड खाली या अधूरे हैं।' : 'डेटा ठीक लगता है।',
    summaryEnglish: issues.length ? 'Some fields are empty or incomplete.' : 'Data looks fine.',
    isOfflineFallback: true,
  };
}

/**
 * Post-process Groq result: ensure empty/missing fields are never marked safe.
 * If a field has null/empty value and Groq did not emit an issue, add a WARNING.
 */
function augmentWithMissingFieldIssues(
  result: ValidationResult,
  extractedFields: Record<string, { value: string | null; confidence?: number }>
): ValidationResult {
  const augmented: ValidationResult = { ...result, issues: [...(result.issues || [])] };
  const issuesByField = new Set((augmented.issues || []).map((i) => i.field));
  let riskScore = typeof augmented.riskScore === 'number' ? augmented.riskScore : 0.1;

  Object.entries(extractedFields).forEach(([key, field]) => {
    const val = field?.value;
    const isEmpty = !val || String(val).trim() === '' || String(val).trim().toLowerCase() === 'खाली' || String(val).trim().toLowerCase() === 'empty';
    if (isEmpty && !issuesByField.has(key)) {
      augmented.issues!.push({
        field: key,
        severity: 'WARNING',
        message: `The field '${key}' is empty or missing and should be checked before submission.`,
        messageHindi: `फ़ील्ड '${key}' खाली है या भरी नहीं गई है, कृपया जमा करने से पहले जाँचें।`,
        suggestion: 'Fill this field as per the portal requirements or confirm it is truly optional.',
      });
      riskScore += 0.15;
    }
  });

  const overallRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
    riskScore >= 0.6 ? 'HIGH' : riskScore >= 0.3 ? 'MEDIUM' : 'LOW';
  const eligibilityVerdict: ValidationResult['eligibilityVerdict'] =
    overallRisk === 'HIGH' ? 'LIKELY_REJECTED' : overallRisk === 'MEDIUM' ? 'NEEDS_REVIEW' : 'LIKELY_APPROVED';

  augmented.riskScore = Math.min(1, riskScore);
  augmented.overallRisk = overallRisk;
  augmented.eligibilityVerdict = eligibilityVerdict;
  if (augmented.issues!.length > 0 && !augmented.summaryHindi?.includes('खाली')) {
    augmented.summaryHindi = 'कुछ फ़ील्ड खाली या अधूरे हैं — कृपया जाँचें।';
    augmented.summaryEnglish = 'Some fields are empty or incomplete — please review before submission.';
  }

  return augmented;
}

export async function validateExtraction(
  backendServiceId: string,
  extractedFields: Record<string, { value: string | null; confidence?: number }>
): Promise<ValidationResult> {
  const rules = getValidationRules(backendServiceId);
  const fieldKeys = Object.keys(extractedFields || {});

  // Convert to flat object for JSON
  const flatFields: Record<string, string | null> = {};
  Object.entries(extractedFields).forEach(([k, v]) => {
    flatFields[k] = v?.value ?? null;
  });

  const systemPrompt = `You are the CSC Sahayak AI Validation Assistant. Analyze the extracted fields for a government application and predict the risk of rejection based strictly on the provided eligibility rules.

Service: ${backendServiceId}

Rules to enforce:
${rules.map((r) => '- ' + r).join('\n')}

Extracted Information:
${JSON.stringify(flatFields, null, 2)}

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

CRITICAL: For EVERY field where the value is null, empty string, "खाली", or clearly missing, you MUST create at least one issue for that specific field (WARNING or CRITICAL). Do NOT mark the application as fully compliant if any such fields exist.
When populating "field" in each issue, use exactly one of these keys: 
${fieldKeys.join(', ') || '(no fields provided)'}`;

  const apiKey = await getApiKey();
  const responseText = await callGroq(apiKey, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Analyze the data and return only the JSON object.' },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  if (responseText) {
    try {
      let parsed = responseText;
      if (parsed.startsWith('```json')) parsed = parsed.replace(/```json\n?/, '').replace(/```$/, '');
      else if (parsed.startsWith('```')) parsed = parsed.replace(/```\n?/, '').replace(/```$/, '');
      const result = JSON.parse(parsed.trim()) as ValidationResult;
      if (result && typeof result.overallRisk === 'string') {
        const augmented = augmentWithMissingFieldIssues(result, extractedFields);
        augmented.isOfflineFallback = false;
        return augmented;
      }
    } catch (e) {
      console.warn('[CSC Sahayak] Groq validation parse error:', e);
    }
  }

  return runOfflineValidation(extractedFields, rules);
}
