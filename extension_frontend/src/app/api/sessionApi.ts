// sessionApi.ts - Session persistence (aligned with sessionManager.js)

const STORAGE_KEY = 'sessionHistory';
const MAX_SESSIONS = 500;

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function generateRefId(serviceId: string): string {
  const prefix = serviceId ? serviceId.toUpperCase().slice(0, 2) : 'CG';
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  const year = new Date().getFullYear();
  return `REF-${prefix}-${year}-${suffix}`;
}

export interface SessionPayload {
  sessionId?: string;
  timestamp?: string;
  citizenName?: string | null;
  citizenPhone?: string | null;
  serviceType?: string;
  extractedFields?: Record<string, string | null>;
  confidenceScores?: Record<string, number>;
  aiValidationResult?: unknown;
  operatorDecision?: string;
  outcome?: string | null;
}

export interface SavedSession {
  sessionId: string;
  refId: string;
  timestamp: string;
  citizenName: string | null;
  citizenPhone: string | null;
  serviceType: string;
  extractedFields: Record<string, string | null>;
  confidenceScores: Record<string, number>;
  aiValidationResult: unknown;
  operatorDecision: string;
  outcome?: string | null;
}

export async function saveSession(payload: SessionPayload): Promise<SavedSession> {
  const sessionId = payload.sessionId || generateSessionId();
  const refId = generateRefId(payload.serviceType || '');
  const enriched: SavedSession = {
    sessionId,
    refId,
    timestamp: payload.timestamp || new Date().toISOString(),
    citizenName: payload.citizenName ?? null,
    citizenPhone: payload.citizenPhone ?? null,
    serviceType: payload.serviceType || 'default',
    extractedFields: payload.extractedFields || {},
    confidenceScores: payload.confidenceScores || {},
    aiValidationResult: payload.aiValidationResult ?? null,
    operatorDecision: payload.operatorDecision || 'SUBMITTED',
    outcome: payload.outcome ?? null,
  };

  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      resolve(enriched);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, (items: Record<string, SavedSession[]>) => {
      const sessions = Array.isArray(items[STORAGE_KEY]) ? items[STORAGE_KEY] : [];
      sessions.push(enriched);
      if (sessions.length > MAX_SESSIONS) {
        sessions.splice(0, sessions.length - MAX_SESSIONS);
      }
      chrome.storage.local.set({ [STORAGE_KEY]: sessions }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(enriched);
      });
    });
  });
}

export interface FieldEntry {
  labelHi: string;
  value: string;
}

export function getWhatsAppShareLink(
  mobile: string,
  refId: string,
  serviceName: string,
  citizenName?: string | null,
  fieldEntries?: FieldEntry[]
): string {
  const clean = String(mobile).replace(/\D/g, '');
  let text = `आपका आवेदन जमा हो गया।\nRef: ${refId}\nसेवा: ${serviceName}`;
  if (citizenName) text += `\nनाम: ${citizenName}`;
  text += `\nतारीख: ${new Date().toLocaleString('hi-IN')}`;
  if (fieldEntries?.length) {
    text += '\n\nनिकाली गई जानकारी:\n' + fieldEntries.slice(0, 12).map((e) => `${e.labelHi}: ${e.value}`).join('\n');
  }
  text += '\n— CSC Sahayak';
  return `https://wa.me/91${clean}?text=${encodeURIComponent(text)}`;
}
