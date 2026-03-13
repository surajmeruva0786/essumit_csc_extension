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

// On install — initialise storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ currentSession: null });
  console.log("CSC Sahayak installed successfully.");
});
