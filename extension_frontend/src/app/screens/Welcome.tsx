import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Bot, ChevronRight, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

declare const chrome: any;

// ── Helpers ────────────────────────────────────────────────────────────────

/** Send a message to the active tab's content script and get the response. */
function sendToContentScript(message: Record<string, unknown>): Promise<any> {
  return new Promise((resolve) => {
    const chromeGlobal = (typeof chrome !== 'undefined' ? chrome : (window as any).chrome);
    if (!chromeGlobal?.tabs) { resolve(null); return; }
    chromeGlobal.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (!tabs[0]?.id) { resolve(null); return; }
      try {
        chromeGlobal.tabs.sendMessage(tabs[0].id, message, (response: any) => {
          if (chromeGlobal.runtime?.lastError) {
            console.warn('[Sync] Content script error:', chromeGlobal.runtime.lastError.message);
            resolve(null);
          } else {
            resolve(response);
          }
        });
      } catch (e) {
        resolve(null);
      }
    });
  });
}

/** Call Groq LLM with a prompt; returns the raw text response. */
async function callGroq(systemPrompt: string, userPrompt: string): Promise<string | null> {
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() ?? null;
      }
    } catch (e) {
      console.warn('[Groq] Error with model', model, e);
    }
  }
  return null;
}

/** Parse Groq's JSON response, stripping any markdown code block wrappers. */
function parseGroqJson(raw: string): any[] {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  try { return JSON.parse(cleaned); } catch { return []; }
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function Welcome() {
  const navigate = useNavigate();
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMsg, setSyncMsg] = useState('');

  const handleOfflineSync = async () => {
    setSyncState('loading');
    setSyncMsg('Backend से data fetch हो रही है...');

    try {
      // ── Step 1: Get staged application data from the local backend ──────
      const backendRes = await fetch('http://127.0.0.1:5000/api/sync/get_staged');
      if (!backendRes.ok) throw new Error('Backend unreachable');
      const backendData = await backendRes.json();

      if (backendData.status !== 'success' || !backendData.data) {
        setSyncState('error');
        setSyncMsg('कोई staged data नहीं मिला। Desktop App में पहले Sync करें।');
        setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 5000);
        return;
      }

      const appData = backendData.data;
      const desktopFields: any[] = JSON.parse(appData.fields_json || '[]');

      if (!desktopFields.length) {
        setSyncState('error');
        setSyncMsg('Desktop App के extracted fields खाली हैं।');
        setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 4000);
        return;
      }

      // ── Step 2: Scan the live form fields from the current webpage ───────
      setSyncMsg('WebPage के form fields scan हो रहे हैं...');
      const scannedFields: any[] = await sendToContentScript({ type: 'SCAN_FORM_FIELDS' }) ?? [];

      if (!scannedFields.length) {
        setSyncState('error');
        setSyncMsg('इस page पर कोई form fields नहीं मिले। CSC Portal खोलें।');
        setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 5000);
        return;
      }

      // ── Step 3: Ask Groq to intelligently match fields ───────────────────
      setSyncMsg('Groq AI field matching कर रहा है...');

      // Prepare compact payload for the prompt (avoid token overflow)
      const compactForm = scannedFields.slice(0, 50).map((f: any) => ({
        selector: f.selector,
        label: f.label || f.fieldKey,
        labelHi: f.labelHi || '',
        type: f.type || 'text',
        options: f.options?.slice(0, 20).map((o: any) => o.text || o.value) ?? [],
      }));

      const compactDesktop = desktopFields.map((f: any) => ({
        fieldName: f.fieldEn || f.field || '',
        fieldHi: f.field || '',
        value: f.extracted || '',
      })).filter((f: any) => f.value && f.value !== '-' && f.value !== '—');

      const systemPrompt = `You are a precise form-filling assistant for Indian government portals.
Your job: Given (A) form fields on a webpage and (B) extracted citizen data, produce a JSON mapping.
Rules:
- Match by MEANING, not exact text. Hindi & English labels both acceptable.
- For date fields (type=date), ALWAYS convert to YYYY-MM-DD.
- For select/dropdown fields, the value MUST exactly match one of the provided options (case-insensitive match is ok, but return the exact option text).
- Only include high-confidence matches. Skip if unsure.
- Return ONLY a valid JSON array, NO markdown, NO explanation.`;

      const userPrompt = `FORM FIELDS (on webpage):
${JSON.stringify(compactForm, null, 2)}

EXTRACTED CITIZEN DATA (from documents):
${JSON.stringify(compactDesktop, null, 2)}

Return a JSON array of fill instructions:
[
  {"selector": "<css-selector>", "fieldKey": "<fieldKey>", "value": "<value-to-fill>"},
  ...
]`;

      const groqResponse = await callGroq(systemPrompt, userPrompt);

      if (!groqResponse) {
        setSyncState('error');
        setSyncMsg('Groq AI से response नहीं मिला। Internet connection जांचें।');
        setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 5000);
        return;
      }

      const fillInstructions: any[] = parseGroqJson(groqResponse);

      if (!fillInstructions.length) {
        setSyncState('error');
        setSyncMsg('AI form fields match नहीं कर पाया। Manual भरें।');
        setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 5000);
        return;
      }

      // ── Step 4: Build the AUTO_FILL_FORM payload and fire it ─────────────
      setSyncMsg(`${fillInstructions.length} fields fill हो रहे हैं...`);

      const fields: Record<string, string> = {};
      const selectors: Record<string, string> = {};
      const confidenceMap: Record<string, number> = {};

      fillInstructions.forEach((inst: any) => {
        const key = inst.fieldKey || inst.selector;
        fields[key] = inst.value;
        selectors[key] = inst.selector;
        confidenceMap[key] = 0.95; // Groq-matched = high confidence
      });

      const fillResult = await sendToContentScript({
        type: 'AUTO_FILL_FORM',
        fields,
        selectors,
        confidenceMap,
      });

      const filled = fillResult?.filledCount ?? fillInstructions.length;

      // Clear staged data on backend
      await fetch('http://127.0.0.1:5000/api/sync/clear', { method: 'POST' });

      setSyncState('success');
      setSyncMsg(`✅ ${filled} fields filled! (${appData.name || 'Citizen'})`);
      setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 6000);

    } catch (e) {
      console.error('[Sync] Error:', e);
      setSyncState('error');
      setSyncMsg('Desktop App से connect नहीं हो सका।');
      setTimeout(() => { setSyncState('idle'); setSyncMsg(''); }, 4000);
    }
  };

  return (
    <div className="h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-lg p-6 border border-border-custom shadow-sm">

          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-lg bg-saffron/10 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-saffron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy mb-1">नमस्ते, Welcome</h2>
            <p className="text-sm text-muted-text">Digital India service delivery platform</p>
          </div>

          {/* New Application */}
          <button
            onClick={() => navigate('/citizen-details')}
            className="w-full h-11 rounded-md bg-green hover:bg-green-hover text-white font-medium text-sm mb-3 flex items-center justify-between px-4 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" strokeWidth={2} />
              <span>नया आवेदन शुरू करें</span>
            </div>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <p className="text-xs text-muted-text mb-5 px-1">Start New Application</p>

          {/* AI Assistant */}
          <button
            onClick={() => navigate('/ai-assistant')}
            className="w-full h-11 rounded-md bg-surface border border-border-strong hover:bg-slate-50 text-navy font-medium text-sm flex items-center justify-between px-4 transition-colors mb-3"
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4" strokeWidth={2} />
              <span>AI सहायक से बात करें</span>
            </div>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <p className="text-xs text-muted-text mb-5 px-1">Chat with AI Assistant</p>

          {/* Offline Desktop Sync with Groq */}
          <button
            onClick={handleOfflineSync}
            disabled={syncState === 'loading'}
            className="w-full rounded-md font-medium text-sm flex items-start gap-3 px-4 py-3 transition-all border"
            style={{
              background: syncState === 'idle' || syncState === 'loading'
                ? 'linear-gradient(135deg, #1A7A38, #2E9E50)'
                : syncState === 'success' ? '#e6f5ec' : '#feecec',
              borderColor: syncState === 'success' ? '#1A7A38' : syncState === 'error' ? '#D93025' : 'transparent',
              color: syncState === 'success' ? '#1A7A38' : syncState === 'error' ? '#D93025' : 'white',
              opacity: syncState === 'loading' ? 0.9 : 1,
            }}
          >
            <div className="mt-0.5 flex-shrink-0">
              {syncState === 'loading' && <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />}
              {syncState === 'success' && <CheckCircle className="w-4 h-4" strokeWidth={2} />}
              {syncState === 'error'   && <AlertCircle className="w-4 h-4" strokeWidth={2} />}
              {syncState === 'idle'    && <RefreshCw className="w-4 h-4" strokeWidth={2} />}
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm leading-tight">
                {syncState === 'loading' ? 'AI Sync चल रहा है...'
                  : syncState === 'success' ? 'Sync हो गया!'
                  : syncState === 'error' ? 'Sync Failed'
                  : 'ऑफ़लाइन ऐप सिंक करें ⚡'}
              </div>
              <div className="text-xs mt-0.5 leading-snug opacity-90">
                {syncMsg || 'Groq AI से form auto-fill · Desktop App से data'}
              </div>
            </div>
          </button>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-border-custom text-center">
            <p className="text-[10px] text-muted-text">
              v1.0.0 • CHIPS Chhattisgarh • Government of India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}