// autofillApi.ts - Triggers form autofill via content script

import { getBackendServiceId } from '../config/serviceConfig';
import { getFormSelectors } from '../config/formMappings';

export interface ScannedFieldForAutofill {
  semanticKey?: string;
  fieldKey?: string;
  selector: string;
}

export interface AutofillResult {
  filledCount: number;
  totalFields: number;
  details: Array<{ field: string; status: string; reason?: string; confidence?: number }>;
}

/**
 * Fill the form in the form tab. Uses formTabId when provided (from scan), otherwise
 * falls back to the active tab. Injects content.js if sendMessage fails (script not loaded).
 */
export async function triggerAutofillInCurrentTab(
  extractedFields: Record<string, { value: string | null; confidence?: number }>,
  formScannedFields: ScannedFieldForAutofill[],
  formTabId?: number | null
): Promise<AutofillResult | null> {
  if (!formScannedFields?.length) return null;

  const selectorsFromScan: Record<string, string> = {};
  formScannedFields.forEach((f) => {
    const key = f.semanticKey || f.fieldKey;
    if (key && f.selector) selectorsFromScan[key] = f.selector;
  });

  const fields: Record<string, string> = {};
  const confidenceMap: Record<string, number> = {};
  Object.entries(extractedFields).forEach(([key, entry]) => {
    const val = entry?.value;
    const sel = selectorsFromScan[key];
    if (val != null && String(val).trim() && sel) {
      fields[key] = String(val).trim();
      confidenceMap[key] = typeof entry.confidence === 'number' ? entry.confidence : 0;
    }
  });

  if (Object.keys(fields).length === 0) return null;

  const targetTabId: number | null = await new Promise((res) => {
    if (typeof formTabId === 'number' && formTabId > 0) {
      chrome.tabs.get(formTabId, (tab) => {
        if (chrome.runtime.lastError || !tab) res(null);
        else res(tab.id ?? null);
      });
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      res(tabs[0]?.id ?? null);
    });
  });

  if (!targetTabId) return null;

  // Focus the form tab so user sees the autofill
  try {
    await chrome.tabs.update(targetTabId, { active: true });
  } catch {
    // Ignore - may fail in some contexts
  }

  const sendAutofill = (): Promise<AutofillResult | null> =>
    new Promise((resolve) => {
      chrome.tabs.sendMessage(
        targetTabId,
        { type: 'AUTO_FILL_FORM', fields, selectors: selectorsFromScan, confidenceMap },
        (response: AutofillResult) => {
          if (chrome.runtime.lastError) {
            const msg = chrome.runtime.lastError.message || '';
            if (msg.includes('Receiving end does not exist') || msg.includes('Could not establish connection')) {
              resolve(null);
              return;
            }
            console.warn('[autofillApi]', msg);
            resolve(null);
            return;
          }
          resolve(response || null);
        }
      );
    });

  let result = await sendAutofill();
  if (result === null) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        files: ['content.js'],
      });
      result = await sendAutofill();
    } catch (e) {
      console.warn('[autofillApi] Content script injection failed', e);
    }
  }
  return result;
}

export async function triggerAutofill(
  serviceId: string,
  extractedFields: Record<string, { value: string | null; confidence?: number }>
): Promise<AutofillResult | null> {
  const backendId = getBackendServiceId(serviceId);
  if (!backendId) return null;

  const selectors = getFormSelectors(backendId);
  const fields: Record<string, string> = {};
  const confidenceMap: Record<string, number> = {};

  Object.entries(extractedFields).forEach(([key, entry]) => {
    const val = entry?.value;
    if (val != null && String(val).trim() && selectors[key]) {
      fields[key] = String(val).trim();
      confidenceMap[key] = typeof entry.confidence === 'number' ? entry.confidence : 0;
    }
  });

  if (Object.keys(fields).length === 0) return null;

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        resolve(null);
        return;
      }
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'AUTO_FILL_FORM', fields, selectors, confidenceMap },
        (response: AutofillResult) => {
          if (chrome.runtime.lastError) {
            console.warn('[autofillApi]', chrome.runtime.lastError.message);
            resolve(null);
            return;
          }
          resolve(response || null);
        }
      );
    });
  });
}

export async function openFormAndAutofill(
  formUrl: string,
  serviceId: string,
  extractedFields: Record<string, { value: string | null; confidence?: number }>
): Promise<AutofillResult | null> {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: formUrl }, (tab) => {
      if (!tab?.id) {
        resolve(null);
        return;
      }
      // Wait for the page to load, then send autofill
      const trySend = (attempts = 0) => {
        if (attempts > 20) {
          resolve(null);
          return;
        }
        chrome.tabs.get(tab.id!, (t) => {
          if (chrome.runtime.lastError || !t) {
            resolve(null);
            return;
          }
          if (t.status === 'complete') {
            setTimeout(() => {
              const backendId = getBackendServiceId(serviceId);
              const selectors = getFormSelectors(backendId || 'other');
              const fields: Record<string, string> = {};
              const confidenceMap: Record<string, number> = {};
              Object.entries(extractedFields).forEach(([key, entry]) => {
                const val = entry?.value;
                if (val != null && String(val).trim() && selectors[key]) {
                  fields[key] = String(val).trim();
                  confidenceMap[key] = typeof entry.confidence === 'number' ? entry.confidence : 0;
                }
              });
              chrome.tabs.sendMessage(tab.id!, { type: 'AUTO_FILL_FORM', fields, selectors, confidenceMap }, (res) => {
                resolve(res || null);
              });
            }, 1500);
          } else {
            setTimeout(() => trySend(attempts + 1), 500);
          }
        });
      };
      trySend();
    });
  });
}
