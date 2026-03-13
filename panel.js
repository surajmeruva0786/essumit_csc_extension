/* ============================================================
   CSC Sahayak — Panel Logic (Chatbot UI + Step 1 Flow)
   ============================================================ */

(() => {
  "use strict";

  // ─── DOM References ────────────────────────────────────────
  const chatContainer = document.getElementById("chatContainer");
  const inputArea     = document.getElementById("inputArea");
  const userInput     = document.getElementById("userInput");
  const btnSend       = document.getElementById("btnSend");
  const btnMic        = document.getElementById("btnMic");
  const headerSubtitle = document.getElementById("headerSubtitle");
  const headerBadge   = document.getElementById("headerBadge");

  // ─── State ─────────────────────────────────────────────────
  let currentStep = null;      // null | "ASK_NAME" | "ASK_PHONE" | "DONE"
  let sessionData = {};
  let isFormDetected = false;
  let formInfo = null;

  // ─── Utility Helpers ──────────────────────────────────────
  function getTimeString() {
    const now = new Date();
    return now.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ─── Message Rendering ────────────────────────────────────
  /**
   * Add a bot message with bilingual text.
   * @param {string} hindi — Hindi text (primary)
   * @param {string} english — English translation
   * @param {object} [options] — { error: boolean }
   */
  function addBotMessage(hindi, english, options = {}) {
    const msg = document.createElement("div");
    msg.className = "message bot";

    const errorClass = options.error ? " error" : "";

    msg.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble${errorClass}">
        <div class="message-text">
          <span class="hindi">${hindi}</span>
          <span class="english">${english}</span>
        </div>
        <div class="message-time">${getTimeString()}</div>
      </div>
    `;

    chatContainer.appendChild(msg);
    scrollToBottom();
  }

  /**
   * Add a user message (right-aligned).
   * @param {string} text
   */
  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message user";

    msg.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-bubble">
        <div class="message-text">${escapeHTML(text)}</div>
        <div class="message-time">${getTimeString()}</div>
      </div>
    `;

    chatContainer.appendChild(msg);
    scrollToBottom();
  }

  /**
   * Show typing indicator, wait, then remove it and run callback.
   */
  async function showTypingThen(callback) {
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatContainer.appendChild(typing);
    scrollToBottom();

    await delay(800 + Math.random() * 600);

    typing.remove();
    callback();
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Landing Card ──────────────────────────────────────────
  function showLandingCard() {
    chatContainer.innerHTML = "";
    inputArea.classList.add("hidden");

    const card = document.createElement("div");
    card.className = "landing-card";

    if (isFormDetected && formInfo) {
      // Government form detected
      card.innerHTML = `
        <div class="logo">🏛️</div>
        <h2>CSC सहायक</h2>
        <p>
          सरकारी फॉर्म मिला!<br>
          <strong>${escapeHTML(formInfo.domain)}</strong>
        </p>
        <div class="divider"></div>
        <div class="btn-group">
          <button class="btn btn-assist" id="btnAssist">
            <span class="btn-icon">🔍</span>
            <span class="btn-content">
              <span class="btn-label">इस फॉर्म में सहायता करें</span>
              <span class="btn-desc">Assist This Form</span>
            </span>
          </button>
          <button class="btn btn-secondary" id="btnAI">
            <span class="btn-icon">🤖</span>
            <span class="btn-content">
              <span class="btn-label">AI सहायक</span>
              <span class="btn-desc">AI Assistant</span>
            </span>
          </button>
        </div>
      `;
    } else {
      // No form detected — show default two buttons
      card.innerHTML = `
        <div class="logo">🏛️</div>
        <h2>CSC सहायक</h2>
        <p>
          नमस्ते! CSC सहायक में आपका स्वागत है।<br>
          सरकारी फॉर्म भरने में मदद के लिए नीचे चुनें।
        </p>
        <div class="divider"></div>
        <div class="btn-group">
          <button class="btn btn-secondary" id="btnAI">
            <span class="btn-icon">🤖</span>
            <span class="btn-content">
              <span class="btn-label">AI सहायक</span>
              <span class="btn-desc">AI Assistant — Knowledge Base</span>
            </span>
          </button>
          <button class="btn btn-primary" id="btnApply">
            <span class="btn-icon">📝</span>
            <span class="btn-content">
              <span class="btn-label">आवेदन शुरू करें</span>
              <span class="btn-desc">Start Applying</span>
            </span>
          </button>
        </div>
      `;
    }

    chatContainer.appendChild(card);

    // Button event listeners
    const btnAI = card.querySelector("#btnAI");
    const btnApply = card.querySelector("#btnApply");
    const btnAssist = card.querySelector("#btnAssist");

    if (btnAI) {
      btnAI.addEventListener("click", () => startChatFlow("ai"));
    }
    if (btnApply) {
      btnApply.addEventListener("click", () => startChatFlow("apply"));
    }
    if (btnAssist) {
      btnAssist.addEventListener("click", () => startChatFlow("assist"));
    }
  }

  // ─── Chat Flow ─────────────────────────────────────────────
  function startChatFlow(mode) {
    // Clear landing
    chatContainer.innerHTML = "";
    inputArea.classList.remove("hidden");
    userInput.focus();

    // Update header
    if (mode === "ai") {
      headerSubtitle.textContent = "AI सहायक मोड";
      headerBadge.textContent = "AI";
    } else if (mode === "assist") {
      headerSubtitle.textContent = "फॉर्म सहायता मोड";
      headerBadge.textContent = "फॉर्म";
    } else {
      headerSubtitle.textContent = "नया आवेदन";
      headerBadge.textContent = "चरण 1";
    }

    // Start Step 1: Citizen Info
    sessionData = {};
    askCitizenName();
  }

  // ── Step 1a: Ask Citizen Name ──
  function askCitizenName() {
    currentStep = "ASK_NAME";
    userInput.placeholder = "नागरिक का नाम / Citizen's name...";
    userInput.type = "text";

    showTypingThen(() => {
      addBotMessage(
        "🙏 नमस्ते! नागरिक का पूरा नाम क्या है?",
        "Hello! What is the citizen's full name?"
      );
    });
  }

  // ── Step 1b: Ask Mobile Number ──
  function askMobileNumber() {
    currentStep = "ASK_PHONE";
    userInput.placeholder = "10 अंकों का मोबाइल नंबर / 10-digit mobile...";
    userInput.type = "tel";

    showTypingThen(() => {
      addBotMessage(
        "📱 नागरिक का मोबाइल नंबर दर्ज करें।",
        "Enter the citizen's mobile number (10 digits)."
      );
    });
  }

  // ── Step 1 Complete ──
  function step1Complete() {
    currentStep = "DONE";
    userInput.disabled = true;
    btnSend.disabled = true;

    // Save to chrome.storage.local
    try {
      chrome.storage.local.set({ currentSession: sessionData }, () => {
        console.log("Session saved:", sessionData);
      });
    } catch (e) {
      // Running outside extension context (for testing)
      console.log("Session data (no chrome.storage):", sessionData);
    }

    headerBadge.textContent = "✓ पूरा";

    showTypingThen(() => {
      addBotMessage(
        `✅ धन्यवाद! नागरिक की जानकारी सहेज ली गई।\n\n👤 नाम: ${escapeHTML(sessionData.name)}\n📱 नंबर: ${sessionData.phone}`,
        `Citizen info saved.\n\nName: ${escapeHTML(sessionData.name)}\nMobile: ${sessionData.phone}`
      );

      showTypingThen(() => {
        addBotMessage(
          "अगला चरण जल्द उपलब्ध होगा...",
          "Next step coming soon..."
        );
        inputArea.classList.add("hidden");
      });
    });
  }

  // ─── Validation ────────────────────────────────────────────
  function validateName(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      return { valid: false, error_hi: "⚠️ कृपया नाम दर्ज करें।", error_en: "Please enter a name." };
    }
    if (trimmed.length < 2) {
      return { valid: false, error_hi: "⚠️ नाम कम से कम 2 अक्षर का होना चाहिए।", error_en: "Name must be at least 2 characters." };
    }
    return { valid: true, value: trimmed };
  }

  function validatePhone(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    const regex = /^[6-9]\d{9}$/;
    if (!cleaned) {
      return { valid: false, error_hi: "⚠️ कृपया मोबाइल नंबर दर्ज करें।", error_en: "Please enter a mobile number." };
    }
    if (!regex.test(cleaned)) {
      return { valid: false, error_hi: "⚠️ कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)।", error_en: "Please enter a valid 10-digit Indian mobile number (starting with 6-9)." };
    }
    return { valid: true, value: cleaned };
  }

  // ─── Input Handling ────────────────────────────────────────
  function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    userInput.value = "";
    btnSend.disabled = true;

    if (currentStep === "ASK_NAME") {
      const result = validateName(text);
      if (!result.valid) {
        showTypingThen(() => {
          addBotMessage(result.error_hi, result.error_en, { error: true });
        });
      } else {
        sessionData.name = result.value;
        askMobileNumber();
      }
    } else if (currentStep === "ASK_PHONE") {
      const result = validatePhone(text);
      if (!result.valid) {
        showTypingThen(() => {
          addBotMessage(result.error_hi, result.error_en, { error: true });
        });
      } else {
        sessionData.phone = result.value;
        step1Complete();
      }
    }
  }

  // ─── Event Listeners ──────────────────────────────────────
  btnSend.addEventListener("click", handleSend);

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  userInput.addEventListener("input", () => {
    btnSend.disabled = !userInput.value.trim();
  });

  btnMic.addEventListener("click", () => {
    addBotMessage(
      "🎙️ वॉइस इनपुट जल्द उपलब्ध होगा।",
      "Voice input coming soon!",
      { error: false }
    );
  });

  // ─── Init ──────────────────────────────────────────────────
  function init() {
    // Query background for form detection status
    try {
      chrome.runtime.sendMessage({ type: "GET_FORM_STATUS" }, (response) => {
        if (chrome.runtime.lastError) {
          // Not in extension context
          showLandingCard();
          return;
        }
        if (response && response.detected) {
          isFormDetected = true;
          formInfo = response;
        }
        showLandingCard();
      });
    } catch (e) {
      // Outside extension context (testing in browser directly)
      showLandingCard();
    }
  }

  init();
})();
