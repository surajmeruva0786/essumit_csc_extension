// chatApi.ts - AI chat for CSC operators using knowledge base + Groq

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_API_KEY = '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';
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];

declare const chrome: any;

export interface AssistantContext {
  serviceId?: string;
  extractedFields?: Record<string, { value: string | null; confidence?: number }>;
  citizenName?: string;
  citizenPhone?: string;
}

let cachedKB: unknown[] | null = null;

async function getApiKey(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['groqApiKey', 'GROQ_API_KEY'], (items: Record<string, string>) => {
        const key = items.groqApiKey || items.GROQ_API_KEY || DEFAULT_GROQ_API_KEY;
        resolve(key?.trim() || DEFAULT_GROQ_API_KEY);
      });
    });
  }
  return DEFAULT_GROQ_API_KEY;
}

async function loadKnowledgeBase(): Promise<unknown[]> {
  if (cachedKB) return cachedKB;
  if (typeof chrome === 'undefined' || !chrome.runtime?.getURL) {
    cachedKB = [];
    return cachedKB;
  }
  try {
    const url = chrome.runtime.getURL('knowledge_base/csc_kb1.json');
    const res = await fetch(url);
    if (!res.ok) {
      cachedKB = [];
      return cachedKB;
    }
    let text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      // Handle Python-style literals (False, True, None, single quotes)
      const fixed = text
        .replace(/: ?False\b/g, ': false')
        .replace(/: ?True\b/g, ': true')
        .replace(/: ?None\b/g, ': null')
        .replace(/'/g, '"');
      try {
        data = JSON.parse(fixed);
      } catch (e2) {
        console.warn('[chatApi] Knowledge base parse failed:', e2);
        cachedKB = [];
        return cachedKB;
      }
    }
    cachedKB = Array.isArray(data) ? data : (data as { services?: unknown[]; data?: unknown[] }).services || (data as { data?: unknown[] }).data || [];
  } catch (e) {
    console.warn('[chatApi] Failed to load knowledge base:', e);
    cachedKB = [];
  }
  return cachedKB;
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
  if (lastError) console.warn('[chatApi] Groq error:', lastError);
  return null;
}

/**
 * Chat with the AI assistant. Uses knowledge base and optional application context.
 */
export async function chat(question: string, context: AssistantContext = {}): Promise<string> {
  const apiKey = await getApiKey();
  const kb = await loadKnowledgeBase();

  const qLower = String(question || '').toLowerCase();
  const serviceId = context.serviceId || '';
  const extractedFields = context.extractedFields || {};

  let candidates: unknown[] = Array.isArray(kb) ? [...kb] : [];
  if (serviceId) {
    candidates = candidates.filter(
      (s: Record<string, unknown>) =>
        String(s.service_id || s.serviceId || '').toLowerCase().includes(serviceId.toLowerCase())
    );
  }
  if (candidates.length === 0 && qLower) {
    const scored = (Array.isArray(kb) ? kb : []).map((s: Record<string, unknown>) => {
      const name = String(s.service_name || s.serviceName || '').toLowerCase();
      const tags = String(s.tags || '').toLowerCase();
      let score = 0;
      if (name && qLower.includes(name.split(' ')[0] || '')) score += 3;
      if (name.includes('birth') && qLower.includes('birth')) score += 2;
      if (name.includes('death') && qLower.includes('death')) score += 2;
      if (name.includes('ration') && qLower.includes('ration')) score += 2;
      if (name.includes('aadhaar') && (qLower.includes('aadhaar') || qLower.includes('आधार'))) score += 2;
      if (tags && qLower.split(/\s+/).some((w) => w.length > 2 && tags.includes(w))) score += 1;
      return { s, score };
    });
    scored.sort((a, b) => b.score - a.score);
    candidates = scored.slice(0, 8).map((x) => x.s);
  }
  if (candidates.length === 0) {
    candidates = (Array.isArray(kb) ? kb : []).slice(0, 8);
  }

  const kbSummary = candidates.map((s: Record<string, unknown>, idx: number) => {
    const name = (s.service_name || s.serviceName || s.service_id || `Service ${idx + 1}`) as string;
    const docs = Array.isArray(s.documents)
      ? (s.documents as { document_type?: string; type?: string; name?: string }[])
          .map((d) => d.document_type || d.type || d.name)
          .filter(Boolean)
      : [];
    const eligibility = ((s.eligibility_rules || s.eligibility) as unknown[])?.slice(0, 5) || [];
    const processing = (s.processing_time || s.processing || '') as string;
    return {
      id: s.service_id || s.serviceId || name,
      name,
      documents: docs,
      eligibility,
      processingTime: processing,
    };
  });

  const contextSnippet = {
    serviceId,
    extractedFields,
    citizenName: context.citizenName || null,
    citizenPhone: context.citizenPhone || null,
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
- ALWAYS provide the complete answer in BOTH Hindi and English.
- First write the full response in Hindi.
- Then write a divider "---" and provide the exact same response translated to English.
- For Hindi, use simple, operator-friendly phrasing.
- For English, keep it highly professional.
- If you are not fully sure, say so and suggest that the operator verify on the official portal.
- If the operator's question is generic, infer likely state‑level or central schemes from your knowledge.
- If information is missing, clearly list what questions the operator should ask the citizen.
- If extractedFields are provided, USE them to tailor the advice.
- NEVER invent official URLs; if a URL is present in the KB, you may use it, otherwise refer generically to the portal.
`;

  const userPrompt = `
Operator Question:
${question}

Please give:
1) Short decision summary.
2) Recommended scheme(s) with eligibility and key benefits.
3) Required documents (bullet list).
4) Step-by-step application process (bullet list).

Remember: Give the ENTIRE answer in Hindi first. Then put "---". Then give the ENTIRE answer in English.`;

  const responseText = await callGroq(apiKey, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.25,
    max_tokens: 900,
  });

  if (!responseText) {
    return `क्षमा करें, अभी AI सर्वर से कनेक्ट नहीं हो सका। कृपया बाद में फिर से कोशिश करें या आधिकारिक पोर्टल पर नियम देख लें।

Sorry, I could not reach the AI server right now. Please try again later or double‑check on the official government portal.`;
  }
  return responseText;
}
