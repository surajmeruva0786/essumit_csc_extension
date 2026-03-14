/**
 * Local Ollama chat API for CSC AI Assistant.
 * Uses knowledge base from /knowledge_base/csc_kb1.json for context-aware answers.
 */

const OLLAMA_BASE = 'http://localhost:11434';
const KB_URL = '/knowledge_base/csc_kb1.json';
const DEFAULT_MODEL = 'llama3.2';
const MAX_KB_CHARS = 18000; // keep context under typical context limits

export type ChatMessage = { sender: 'user' | 'bot'; text: string };

let kbCache: string | null = null;

/** Load and cache knowledge base; return text summary for system prompt */
export async function loadKnowledgeBase(): Promise<string> {
  if (kbCache) return kbCache;
  try {
    const res = await fetch(KB_URL);
    if (!res.ok) throw new Error(`KB fetch ${res.status}`);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [data];
    const summary = arr
      .map((s: Record<string, unknown>) => {
        const name = s.service_name || s.service_id || '';
        const docs = (s.documents as Array<{ document_type?: string; mandatory?: boolean }>) || [];
        const docList = docs.map((d) => `${d.document_type || ''}${d.mandatory ? ' (required)' : ''}`).filter(Boolean);
        const fees = s.fees ?? '';
        const time = s.processing_time ?? '';
        const extra = [
          ...(Array.isArray(s.eligibility_rules) ? s.eligibility_rules : []),
          ...(Array.isArray(s.general_rules) ? s.general_rules : []),
          ...(Array.isArray(s.special_rules) ? s.special_rules : []),
        ];
        return [
          `Service: ${name}`,
          `Documents: ${docList.join(', ') || 'See official link'}`,
          time ? `Processing time: ${time}` : '',
          fees ? `Fees: ${Array.isArray(fees) ? fees.join(', ') : fees}` : '',
          extra.length ? `Rules: ${extra.join('; ')}` : '',
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');
    kbCache = summary.length > MAX_KB_CHARS ? summary.slice(0, MAX_KB_CHARS) + '\n...[truncated]' : summary;
  } catch (e) {
    kbCache = '(Knowledge base could not be loaded. Answer from general knowledge.)';
  }
  return kbCache;
}

/** Check if Ollama is reachable */
export async function checkOllama(): Promise<boolean> {
  try {
    const r = await fetch(`${OLLAMA_BASE}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

/** Send chat to local Ollama with KB context */
export async function chatWithOllama(
  userMessage: string,
  history: ChatMessage[],
  options?: { selectedServiceName?: string; model?: string }
): Promise<string> {
  const model = options?.model ?? DEFAULT_MODEL;
  const kb = await loadKnowledgeBase();
  const serviceContext = options?.selectedServiceName
    ? `\nCurrent selected service by user: ${options.selectedServiceName}. Prefer giving details for this service when relevant.`
    : '';

  const systemContent =
    `You are the CSC Sahayak AI Assistant for Common Service Centre (CSC) operators in Chhattisgarh, India. You help operators and citizens with government services (documents, procedures, fees, processing time). Answer in a mix of Hindi and English (Hinglish) where natural; be concise and accurate. Use ONLY the following knowledge base for document lists, fees, and procedures. If the user's question is not covered here, say so and suggest they visit the CSC or official portal.\n\n--- KNOWLEDGE BASE ---\n${kb}\n--- END KNOWLEDGE BASE ---${serviceContext}`.trim();

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [{ role: 'system', content: systemContent }];

  // Last N turns to avoid token overflow (keep recent context)
  const recent = history.slice(-10);
  for (const msg of recent) {
    if (msg.sender === 'user') messages.push({ role: 'user', content: msg.text });
    else messages.push({ role: 'assistant', content: msg.text });
  }
  messages.push({ role: 'user', content: userMessage });

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(res.status === 404 ? 'Ollama model not found. Install e.g. llama3.2.' : err || `Ollama ${res.status}`);
  }

  const data = await res.json();
  const content = data.message?.content ?? data.response ?? '';
  return typeof content === 'string' ? content.trim() : String(content);
}
