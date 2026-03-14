import { useState, useCallback } from 'react';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

declare const chrome: { tabs?: any; runtime?: { lastError?: { message?: string } } };

function sendToContentScript(message: Record<string, unknown>): Promise<any> {
  return new Promise((resolve) => {
    const chromeGlobal = typeof chrome !== 'undefined' ? chrome : (window as any).chrome;
    if (!chromeGlobal?.tabs) {
      resolve(null);
      return;
    }
    chromeGlobal.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (!tabs[0]?.id) {
        resolve(null);
        return;
      }
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

function parseGroqJson(raw: string): any[] {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export type OfflineSyncState = 'idle' | 'loading' | 'success' | 'error';

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<OfflineSyncState>('idle');
  const [syncMsg, setSyncMsg] = useState('');

  const triggerSync = useCallback(async () => {
    setSyncState('loading');
    setSyncMsg('Backend से data fetch हो रही है...');

    try {
      const backendRes = await fetch('http://127.0.0.1:5000/api/sync/get_staged');
      if (!backendRes.ok) throw new Error('Backend unreachable');
      const backendData = await backendRes.json();

      if (backendData.status !== 'success' || !backendData.data) {
        setSyncState('error');
        setSyncMsg('कोई staged data नहीं मिला। Desktop App में पहले Sync करें।');
        setTimeout(() => {
          setSyncState('idle');
          setSyncMsg('');
        }, 5000);
        return;
      }

      const appData = backendData.data;
      const desktopFields: any[] = JSON.parse(appData.fields_json || '[]');

      if (!desktopFields.length) {
        setSyncState('error');
        setSyncMsg('Desktop App के extracted fields खाली हैं।');
        setTimeout(() => {
          setSyncState('idle');
          setSyncMsg('');
        }, 4000);
        return;
      }

      setSyncMsg('WebPage के form fields scan हो रहे हैं...');
      const scannedFields: any[] = (await sendToContentScript({ type: 'SCAN_FORM_FIELDS' })) ?? [];

      if (!scannedFields.length) {
        setSyncState('error');
        setSyncMsg('इस page पर कोई form fields नहीं मिले। CSC Portal खोलें।');
        setTimeout(() => {
          setSyncState('idle');
          setSyncMsg('');
        }, 5000);
        return;
      }

      setSyncMsg('Groq AI field matching कर रहा है...');

      const compactForm = scannedFields.slice(0, 50).map((f: any) => ({
        selector: f.selector,
        label: f.label || f.fieldKey,
        labelHi: f.labelHi || '',
        type: f.type || 'text',
        options: f.options?.slice(0, 20).map((o: any) => o.text || o.value) ?? [],
      }));

      const compactDesktop = desktopFields
        .map((f: any) => ({
          fieldName: f.fieldEn || f.field || '',
          fieldHi: f.field || '',
          value: f.extracted || '',
        }))
        .filter((f: any) => f.value && f.value !== '-' && f.value !== '—');

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
        setTimeout(() => {
          setSyncState('idle');
          setSyncMsg('');
        }, 5000);
        return;
      }

      const fillInstructions: any[] = parseGroqJson(groqResponse);

      if (!fillInstructions.length) {
        setSyncState('error');
        setSyncMsg('AI form fields match नहीं कर पाया। Manual भरें।');
        setTimeout(() => {
          setSyncState('idle');
          setSyncMsg('');
        }, 5000);
        return;
      }

      setSyncMsg(`${fillInstructions.length} fields fill हो रहे हैं...`);

      const fields: Record<string, string> = {};
      const selectors: Record<string, string> = {};
      const confidenceMap: Record<string, number> = {};

      fillInstructions.forEach((inst: any) => {
        const key = inst.fieldKey || inst.selector;
        fields[key] = inst.value;
        selectors[key] = inst.selector;
        confidenceMap[key] = 0.95;
      });

      const fillResult = await sendToContentScript({
        type: 'AUTO_FILL_FORM',
        fields,
        selectors,
        confidenceMap,
      });

      const filled = fillResult?.filledCount ?? fillInstructions.length;

      await fetch('http://127.0.0.1:5000/api/sync/clear', { method: 'POST' });

      setSyncState('success');
      setSyncMsg(`✅ ${filled} fields filled! (${appData.name || 'Citizen'})`);
      setTimeout(() => {
        setSyncState('idle');
        setSyncMsg('');
      }, 6000);
    } catch (e) {
      console.error('[Sync] Error:', e);
      setSyncState('error');
      setSyncMsg('Desktop App से connect नहीं हो सका।');
      setTimeout(() => {
        setSyncState('idle');
        setSyncMsg('');
      }, 4000);
    }
  }, []);

  return { syncState, syncMsg, triggerSync };
}
