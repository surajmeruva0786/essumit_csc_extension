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

      const compactForm = scannedFields.slice(0, 60).map((f: any) => {
        const entry: Record<string, unknown> = {
          selector: f.selector,
          fieldKey: f.fieldKey,
          label: f.label || f.fieldKey,
          labelHi: f.labelHi || '',
          type: f.type || 'text',
        };
        if (f.options && f.options.length) {
          entry.options = f.options.slice(0, 100).map((o: any) => ({ value: o.value ?? '', text: o.text ?? String(o.value ?? '') }));
        }
        if ((f.type || '').toLowerCase() === 'file') {
          entry.accept = f.accept || null;
          entry.multiple = !!f.multiple;
        }
        return entry;
      });

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
- For SELECT/DROPDOWN fields: You MUST choose the single best-matching option from the field's "options" array. Return the exact "value" of that option (use the "value" property from the options list, not the display text). If the citizen value is "OBC", match to the option whose value or text is equivalent (e.g. "OBC", "Other Backward Class") and return that option's "value".
- For FILE upload fields (type=file): If the citizen data or context includes a document type that matches the field label (e.g. "Aadhaar", "Photo", "Address proof"), include that field with value set to the document type identifier (e.g. "aadhaar", "photo"). The extension may later map this to an actual file.
- Only include high-confidence matches. Skip if unsure.
- Return ONLY a valid JSON array, NO markdown, NO explanation.`;

      const userPrompt = `FORM FIELDS (on webpage). For dropdowns, "options" lists { value, text }; you must return the exact option "value" that best matches the citizen data.
${JSON.stringify(compactForm, null, 2)}

EXTRACTED CITIZEN DATA (from documents):
${JSON.stringify(compactDesktop, null, 2)}

Return a JSON array of fill instructions. For dropdowns use the exact option "value" from the options array.
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
      const filePayloads: Record<string, { base64: string; fileName: string; mimeType?: string }> = {};

      const documentFiles = appData.document_files || appData.documentFiles || {};

      fillInstructions.forEach((inst: any) => {
        const key = inst.fieldKey || inst.selector;
        const sel = inst.selector;
        const val = inst.value;
        const isFileField = (scannedFields as any[]).some(
          (f: any) => (f.selector === sel || f.fieldKey === key) && (f.type || '').toLowerCase() === 'file'
        );
        if (isFileField && val && documentFiles[String(val).toLowerCase()]) {
          const doc = documentFiles[String(val).toLowerCase()];
          if (doc && typeof doc.base64 === 'string') {
            filePayloads[sel] = {
              base64: doc.base64,
              fileName: doc.fileName || doc.file_name || `document_${val}.pdf`,
              mimeType: doc.mimeType || doc.mime_type,
            };
          }
        } else if (!isFileField) {
          fields[key] = val;
          selectors[key] = sel;
          confidenceMap[key] = 0.95;
        }
      });

      // Ensure every dropdown (select with options) gets a selection: add __random__ for any not already filled
      const filledSelectors = new Set(Object.values(selectors));
      (scannedFields as any[]).forEach((f: any) => {
        const hasOptions = f.options && Array.isArray(f.options) && f.options.length > 0;
        if (!hasOptions) return;
        if (filledSelectors.has(f.selector)) return;
        const key = f.fieldKey || f.selector;
        fields[key] = '__random__';
        selectors[key] = f.selector;
        confidenceMap[key] = 0.5;
      });

      const fillResult = await sendToContentScript({
        type: 'AUTO_FILL_FORM',
        fields,
        selectors,
        confidenceMap,
        filePayloads: Object.keys(filePayloads).length ? filePayloads : undefined,
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
