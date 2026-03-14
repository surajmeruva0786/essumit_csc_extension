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
 * Fill the form in the CURRENTLY ACTIVE tab (no new tab).
 * Use formScannedFields to get real selectors from the page (handles numeric IDs).
 */
export async function triggerAutofillInCurrentTab(
  extractedFields: Record<string, { value: string | null; confidence?: number }>,
  formScannedFields: ScannedFieldForAutofill[]
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

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        resolve(null);
        return;
      }
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'AUTO_FILL_FORM', fields, selectors: selectorsFromScan, confidenceMap },
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
