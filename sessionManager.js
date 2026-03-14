// sessionManager.js
// Persistent storage of past sessions for online learning and analytics.

(() => {
  "use strict";

  const STORAGE_KEY = "sessionHistory";
  const MAX_SESSIONS = 500;

  function generateSessionId() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    // Fallback
    return "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function loadSessions() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(STORAGE_KEY, (items) => {
          const list = Array.isArray(items[STORAGE_KEY]) ? items[STORAGE_KEY] : [];
          resolve(list);
        });
      } catch (e) {
        console.warn("[SessionManager] loadSessions error", e);
        resolve([]);
      }
    });
  }

  function saveSessions(list) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [STORAGE_KEY]: list }, () => resolve());
      } catch (e) {
        console.warn("[SessionManager] saveSessions error", e);
        resolve();
      }
    });
  }

  /**
   * Save a new session record for training / analytics.
   * Automatically assigns a sessionId if missing and enforces FIFO cap.
   */
  async function saveSession(sessionData) {
    const sessions = await loadSessions();
    const enriched = {
      sessionId: sessionData.sessionId || generateSessionId(),
      timestamp: sessionData.timestamp || new Date().toISOString(),
      citizenName: sessionData.citizenName || null,
      citizenPhone: sessionData.citizenPhone || null,
      serviceType: sessionData.serviceType || "default",
      extractedFields: sessionData.extractedFields || {},
      confidenceScores: sessionData.confidenceScores || {},
      aiValidationResult: sessionData.aiValidationResult || null,
      operatorDecision: sessionData.operatorDecision || "UNKNOWN",
      outcome: sessionData.outcome || null
    };

    sessions.push(enriched);
    // FIFO eviction if exceeding cap
    if (sessions.length > MAX_SESSIONS) {
      const extra = sessions.length - MAX_SESSIONS;
      sessions.splice(0, extra);
    }
    await saveSessions(sessions);
    return enriched;
  }

  async function getAllSessions() {
    return await loadSessions();
  }

  async function getSessionsByService(serviceType) {
    const all = await loadSessions();
    return all.filter(s => s.serviceType === serviceType);
  }

  /**
   * Mark final outcome for a session and optionally trigger online model update.
   */
  async function markOutcome(sessionId, outcome) {
    const sessions = await loadSessions();
    const idx = sessions.findIndex(s => s.sessionId === sessionId);
    if (idx === -1) return null;

    sessions[idx].outcome = outcome;
    await saveSessions(sessions);

    try {
      if (typeof OnlineModel !== "undefined" && OnlineModel.updateWithOutcome) {
        OnlineModel.updateWithOutcome(sessions[idx], outcome);
      }
    } catch (e) {
      console.warn("[SessionManager] OnlineModel update failed", e);
    }

    return sessions[idx];
  }

  const api = {
    saveSession,
    getAllSessions,
    getSessionsByService,
    markOutcome
  };

  if (typeof window !== "undefined") {
    window.SessionManager = api;
  }
})();

