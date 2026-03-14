/* ============================================================
   CSC Sahayak — Background Service Worker
   ============================================================ */

// Open side panel when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Side panel error:", error));

// Track which tab has a recognized government form
const formDetectedTabs = new Set();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) return;

  const tabId = sender.tab.id;

  if (message.type === "FORM_DETECTED") {
    formDetectedTabs.add(tabId);
    // Store detection info so side panel can query it
    chrome.storage.session.set({
      [`formDetected_${tabId}`]: {
        detected: true,
        domain: message.domain,
        url: message.url,
        title: message.title
      }
    });
    sendResponse({ status: "ok" });
  } else if (message.type === "NO_FORM") {
    formDetectedTabs.delete(tabId);
    chrome.storage.session.set({
      [`formDetected_${tabId}`]: { detected: false }
    });
    sendResponse({ status: "ok" });
  } else if (message.type === "GET_FORM_STATUS") {
    // Panel asking about current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.storage.session.get(`formDetected_${tabs[0].id}`, (result) => {
          sendResponse(result[`formDetected_${tabs[0].id}`] || { detected: false });
        });
      } else {
        sendResponse({ detected: false });
      }
    });
    return true; // keep channel open for async response
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  formDetectedTabs.delete(tabId);
  chrome.storage.session.remove(`formDetected_${tabId}`);
});

// On install — initialise storage and alarms for periodic sync
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ currentSession: null });
  if (chrome.alarms && chrome.alarms.create) {
    try {
      chrome.alarms.create("modelSyncAlarm", { periodInMinutes: 30 });
    } catch (e) {
      console.warn("Could not create modelSyncAlarm", e);
    }
  }
  console.log("CSC Sahayak installed successfully.");
});

// Periodic background sync of pending sessions when connection is good
if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== "modelSyncAlarm") return;

  // Simple bandwidth-aware check using Network Information API (if available in worker)
  function getConnectionType() {
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return conn && conn.effectiveType ? conn.effectiveType : "unknown";
    } catch {
      return "unknown";
    }
  }

    const type = getConnectionType();
    if (!(type === "4g" || type === "wifi" || type === "ethernet" || type === "unknown")) {
      return;
    }

    const PENDING_KEY = "pendingSyncSessions";
    chrome.storage.local.get(PENDING_KEY, async (items) => {
      const pending = Array.isArray(items[PENDING_KEY]) ? items[PENDING_KEY] : [];
      if (!pending.length) return;

      let operatorId = null;
      try {
        const stored = await new Promise((resolve) => {
          chrome.storage.local.get("operatorId", (vals) => resolve(vals || {}));
        });
        operatorId = stored.operatorId || null;
      } catch {
        operatorId = null;
      }

      const payload = {
        operatorId,
        sessions: pending,
        modelWeightsDelta: null // model weights are synced from panel context via ModelSync
      };

      try {
        const res = await fetch("http://127.0.0.1:5000/api/model-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          chrome.storage.local.set({ [PENDING_KEY]: [] });
        }
      } catch (e) {
        console.warn("[Background] periodic model-sync failed", e);
      }
    });
  });
}
