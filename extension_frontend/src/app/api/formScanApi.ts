// formScanApi.ts - Scan form fields from the active tab using chrome.scripting.executeScript

export interface ScannedField {
  fieldKey: string;
  semanticKey: string; // for backend extraction - always semantic, never numeric
  label: string;
  labelHi: string;
  selector: string;
  type: string;
  tagName: string;
  options?: Array<{ value: string; text: string }>;
}

/**
 * Injected function - HINDI_LABEL_MAP must be inside for serialization.
 */
function scanFormInPage(): ScannedField[] {
  const HINDI_LABEL_MAP: Record<string, string> = {
  'जन्म की तारीख': 'dateOfBirth',
  'जन्म तिथि': 'dateOfBirth',
  'वार्षिक आय': 'annualIncome',
  'आय': 'annualIncome',
  'पिता का नाम': 'fatherName',
  'पिता': 'fatherName',
  'माँ का नाम': 'motherName',
  'माता का नाम': 'motherName',
  'लिंग': 'gender',
  'कृपया लिंग चुनें': 'gender',
  'जिला': 'district',
  'ज़िला': 'district',
  'पिन कोड': 'pinCode',
  'पिनकोड': 'pinCode',
  'आवेदक का नाम': 'applicantName',
  'नाम': 'applicantName',
  'पता': 'address',
  'मोबाइल': 'mobileNumber',
  'मोबाइल नंबर': 'mobileNumber',
  'आधार': 'aadhaarNumber',
  'आधार नंबर': 'aadhaarNumber',
  'बैंक खाता': 'bankAccountNumber',
  'आईएफएससी': 'ifscCode',
  'ifsc': 'ifscCode',
  'बैंक का नाम': 'bankName',
  'तहसील': 'tehsil',
  'गाँव': 'village',
  'ग्राम': 'village',
  'जाति': 'caste',
  'कास्ट': 'caste',
  'कृपया कास्ट चुनें': 'caste',
  'कास्ट श्रेणी': 'casteCategory',
  'जाति श्रेणी': 'casteCategory',
  'श्रेणी': 'category',
  'पेशा': 'occupation',
  'पेशे': 'occupation',
  'व्यवसाय': 'occupation',
  'कृपया पेशे का चयन करें': 'occupation',
  'वैवाहिक स्थिति': 'maritalStatus',
  'कृपया वैवाहिक स्थिति का चयन करें': 'maritalStatus',
  'वोटर आई.डी': 'voterId',
  'वोटर': 'voterId',
  'राष्ट्रीयता': 'nationality',
  'कृपया राष्ट्रीयता का चयन करें': 'nationality',
  'शिक्षा': 'education',
  'कृपया शिक्षा का चयन करें': 'education',
  'बीपीएल संख्या': 'bplNumber',
  'बीपीएल': 'bplNumber',
  'सेवा': 'serviceType',
  'सेवा प्रकार': 'serviceType',
  };

  const SKIP_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'file', 'image', 'password']);

  function toCamelCase(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/['']/g, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join('');
  }

  function findLabel(el: Element): string {
    const id = (el as HTMLInputElement).id;
    if (id) {
      const lbl = document.querySelector('label[for="' + id.replace(/"/g, '\\"') + '"]');
      if (lbl) return (lbl.textContent || '').trim();
    }
    const parentLabel = el.closest('label');
    if (parentLabel) return (parentLabel.textContent || '').trim();
    const container = el.closest('tr, .form-group, .form-row, .field-wrapper, div');
    if (container) {
      const lbl = container.querySelector('label, .label, th, span.field-label');
      if (lbl) return (lbl.textContent || '').trim();
    }
    const inp = el as HTMLInputElement;
    return inp.placeholder || inp.title || '';
  }

  function buildSelector(el: Element): string {
    const inp = el as HTMLInputElement;
    if (inp.id) return '#' + inp.id.replace(/([^\w-])/g, '\\$1');
    if (inp.name) return (el.tagName || 'INPUT').toLowerCase() + '[name="' + inp.name + '"]';
    return (el.tagName || 'INPUT').toLowerCase();
  }

  const fields: ScannedField[] = [];
  const seen = new Set<string>();
  const elements = document.querySelectorAll('input, select, textarea');

  elements.forEach((el) => {
    const inp = el as HTMLInputElement;
    const inputType = ((inp.type || 'text') + '').toLowerCase();
    if (SKIP_TYPES.has(inputType)) return;
    if (el.offsetParent === null && inputType !== 'hidden') return;

    const selector = buildSelector(el);
    if (seen.has(selector)) return;
    seen.add(selector);

    const labelText = findLabel(el);
    const labelLower = (labelText || '').replace(/[*:\s]+/g, ' ').trim();

    // 1. Derive semanticKey from label first (for backend - LLM understands these)
    let semanticKey: string | null = null;
    for (const k of Object.keys(HINDI_LABEL_MAP)) {
      if (labelLower.includes(k)) {
        semanticKey = HINDI_LABEL_MAP[k];
        break;
      }
    }
    if (!semanticKey && labelText) {
      const eng = labelText.replace(/[^\x00-\x7F()]/g, '').replace(/[*:()]/g, '').trim();
      if (eng.length >= 2) semanticKey = toCamelCase(eng);
    }

    // 2. fieldKey = DOM identifier (for autofill selectors); avoid numeric-only
    let fieldKey: string;
    if (inp.name && inp.name.length > 1 && !/^\d+$/.test(inp.name)) {
      fieldKey = toCamelCase(inp.name);
    } else if (inp.id && inp.id.length > 1 && !/^\d+$/.test(inp.id)) {
      fieldKey = toCamelCase(inp.id) || 'field_' + inp.id;
    } else if (semanticKey) {
      fieldKey = semanticKey;
    } else {
      fieldKey = 'field_' + (inp.name || inp.id || Math.random().toString(36).slice(2, 8));
    }

    // Use semanticKey for backend; fallback to fieldKey only if non-numeric
    const isNumericKey = /^\d+$/.test(fieldKey) || /^field_\d+$/.test(fieldKey) || /^[a-z]+\_\d+$/.test(fieldKey);
    const backendKey = semanticKey || (isNumericKey ? toCamelCase(labelText) || 'field' + (inp.name || inp.id) : fieldKey);

    let fk = fieldKey;
    let n = 0;
    while (fields.some((f) => f.fieldKey === fk)) {
      fk = fieldKey + '_' + (inp.name || inp.id || n++);
    }
    fieldKey = fk;

    // Dedupe: same semantic meaning (e.g. multiple "category" dropdowns) -> one key for backend
    let finalSemanticKey = backendKey;
    const existing = new Set(fields.map((f) => f.semanticKey));
    n = 0;
    while (existing.has(finalSemanticKey)) {
      finalSemanticKey = backendKey + '_' + (inp.name || inp.id || n++);
    }

    const info: ScannedField = {
      fieldKey,
      semanticKey: finalSemanticKey,
      label: labelText || fieldKey,
      labelHi: labelText || '',
      selector,
      type: inputType,
      tagName: (el.tagName || 'INPUT').toLowerCase(),
    };
    if (el.tagName === 'SELECT') {
      const sel = el as HTMLSelectElement;
      info.options = Array.from(sel.options || [])
        .slice(0, 50)
        .map((o) => ({ value: o.value || '', text: (o.textContent || '').trim() }));
    }
    fields.push(info);
  });

  return fields;
}

/**
 * Get the active tab ID - use multiple strategies for side panel compatibility.
 */
async function getActiveTabId(): Promise<number | null> {
  return new Promise((resolve) => {
    // Try currentWindow first (side panel context)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        resolve(tabs[0].id);
        return;
      }
      // Fallback: last focused window
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs2) => {
        resolve(tabs2[0]?.id ?? null);
      });
    });
  });
}

/**
 * Scan form fields from a tab using scripting API.
 * @param tabId - Optional; if not provided, uses active tab.
 */
export async function scanFormFieldsFromActiveTab(tabId?: number | null): Promise<ScannedField[]> {
  const id = tabId ?? (await getActiveTabId());
  if (!id) return [];

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: id },
      func: scanFormInPage,
    });
    const result = results?.[0]?.result;
    return Array.isArray(result) ? (result as ScannedField[]) : [];
  } catch (e) {
    console.warn('[formScanApi] executeScript failed', e);
    return [];
  }
}

/**
 * Get semantic field keys, scanned fields, and form tab ID (for autofill targeting).
 */
export async function getFormFieldsForExtraction(): Promise<{
  fieldKeys: string[];
  scannedFields: ScannedField[];
  formTabId: number | null;
}> {
  const formTabId = await getActiveTabId();
  if (!formTabId) return { fieldKeys: [], scannedFields: [], formTabId: null };

  const scanned = await scanFormFieldsFromActiveTab(formTabId);
  const keys = scanned.map((f) => f.semanticKey).filter(Boolean);
  return {
    fieldKeys: [...new Set(keys)],
    scannedFields: scanned,
    formTabId,
  };
}
