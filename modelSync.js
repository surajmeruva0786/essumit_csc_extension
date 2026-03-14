// modelSync.js
// Bandwidth-aware sync of anonymized sessions + model weight deltas to backend.

(() => {
  "use strict";

  const PENDING_KEY = "pendingSyncSessions";
  const SYNC_ENDPOINT = "http://127.0.0.1:5000/api/model-sync";

  function log(...args) {
    console.log("[ModelSync]", ...args);
  }

  function getConnectionType() {
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return conn && conn.effectiveType ? conn.effectiveType : "unknown";
    } catch {
      return "unknown";
    }
  }

  function canSyncNow() {
    const type = getConnectionType();
    if (type === "4g" || type === "wifi" || type === "ethernet" || type === "unknown") return true;
    // Be conservative on slow networks
    return false;
  }

  function loadPending() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(PENDING_KEY, (items) => {
          const list = Array.isArray(items[PENDING_KEY]) ? items[PENDING_KEY] : [];
          resolve(list);
        });
      } catch (e) {
        console.warn("[ModelSync] loadPending error", e);
        resolve([]);
      }
    });
  }

  function savePending(list) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [PENDING_KEY]: list }, () => resolve());
      } catch (e) {
        console.warn("[ModelSync] savePending error", e);
        resolve();
      }
    });
  }

  async function enqueueSession(session) {
    const list = await loadPending();
    list.push({
      sessionId: session.sessionId,
      serviceType: session.serviceType,
      operatorDecision: session.operatorDecision,
      outcome: session.outcome,
      timestamp: session.timestamp,
      aiValidationResult: session.aiValidationResult,
      // For privacy, you may strip PII from extractedFields before syncing.
      extractedFields: session.extractedFields
    });
    await savePending(list);
    // Try immediate sync if network is good
    syncIfFastConnection();
  }

  async function syncIfFastConnection() {
    if (!canSyncNow()) {
      log("Skipping sync on slow connection:", getConnectionType());
      return;
    }

    const pending = await loadPending();
    if (!pending.length) return;

    let operatorId = null;
    try {
      operatorId = await new Promise((resolve) => {
        chrome.storage.local.get("operatorId", (items) => resolve(items.operatorId || null));
      });
    } catch {
      operatorId = null;
    }

    let weightsArray = null;
    try {
      if (typeof OnlineModel !== "undefined" && OnlineModel.getFlattenedWeights) {
        const w = await OnlineModel.getFlattenedWeights();
        if (w) weightsArray = Array.from(w);
      }
    } catch (e) {
      console.warn("[ModelSync] getFlattenedWeights error", e);
    }

    const payload = {
      operatorId,
      sessions: pending,
      modelWeightsDelta: weightsArray
    };

    try {
      const res = await fetch(SYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        log("Synced", pending.length, "sessions to backend");
        await savePending([]);
      } else {
        log("Sync failed with status", res.status);
      }
    } catch (e) {
      console.warn("[ModelSync] sync error", e);
    }
  }

  // Optional periodic sync while panel is open
  function startPeriodicSync() {
    if (typeof window === "undefined") return;
    setInterval(syncIfFastConnection, 15 * 60 * 1000); // every 15 minutes
  }

  const api = {
    enqueueSession,
    syncIfFastConnection,
    startPeriodicSync
  };

  if (typeof window !== "undefined") {
    window.ModelSync = api;
    startPeriodicSync();
  }
})();

