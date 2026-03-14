/* ============================================================
   CSC Sahayak — Panel Logic
   Step 1: Citizen Info | Step 2: Service Selection |
   Step 3: Document Checklist
   ============================================================ */

(() => {
  "use strict";

  // ─── DOM References ────────────────────────────────────────
  const chatContainer  = document.getElementById("chatContainer");
  const inputArea      = document.getElementById("inputArea");
  const userInput      = document.getElementById("userInput");
  const btnSend        = document.getElementById("btnSend");
  const btnMic         = document.getElementById("btnMic");
  const headerSubtitle = document.getElementById("headerSubtitle");
  const headerBadge    = document.getElementById("headerBadge");

  // ─── State ─────────────────────────────────────────────────
  // Steps: null | ASK_NAME | ASK_PHONE | SELECT_SERVICE | DOC_CHECKLIST | DONE
  let currentStep = null;
  let sessionData = {};
  let isFormDetected = false;
  let formInfo = null;

  // In-memory document uploads (with base64 — too large for chrome.storage)
  let uploadedDocuments = {};  // { docId: { docType, fileName, base64, mimeType, fileSize } }

  // ─── Utility Helpers (delegated to CSCUtils where available) ──
  function getTimeString() {
    return typeof CSCUtils !== "undefined"
      ? CSCUtils.getTimeString()
      : new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHTML(str) {
    return typeof CSCUtils !== "undefined"
      ? CSCUtils.escapeHTML(str)
      : str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
   * Add a custom HTML block as a bot-style message (no avatar — full width).
   */
  function addBotWidget(htmlContent) {
    const wrapper = document.createElement("div");
    wrapper.className = "message bot widget-message";
    wrapper.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="widget-container">${htmlContent}</div>
    `;
    chatContainer.appendChild(wrapper);
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

    await delay(600 + Math.random() * 500);

    typing.remove();
    callback();
  }

  // ─── Session Persistence ──────────────────────────────────
  function saveSession() {
    // Save metadata (without large base64) to chrome.storage
    if (typeof CSCUtils !== "undefined") {
      CSCUtils.saveSession(sessionData);
    } else {
      console.log("Session data:", sessionData);
    }
  }

  // ─── Citizen Pre-Gate Card (Phone + Aadhaar) ───────────────
  function showCitizenGateCard() {
    chatContainer.innerHTML = "";
    inputArea.classList.add("hidden");

    const card = document.createElement("div");
    card.className = "landing-card";

    card.innerHTML = `
      <div class="logo">📋</div>
      <h2>नागरिक विवरण / Citizen Details</h2>
      <p style="margin-bottom: 16px;">
        आगे बढ़ने से पहले नागरिक का मोबाइल नंबर और आधार संख्या दर्ज करें।
      </p>
      <div class="citizen-form">
        <label class="citizen-label">📱 मोबाइल नंबर (10 अंक)</label>
        <input id="cscCitizenPhone" class="citizen-input" type="tel" placeholder="10 अंकों का मोबाइल नंबर / 10-digit mobile..." maxlength="10" />
        <div id="cscCitizenPhoneError" class="citizen-error"></div>

        <label class="citizen-label" style="margin-top:12px;">🆔 आधार संख्या (12 अंक)</label>
        <input id="cscCitizenAadhaar" class="citizen-input" type="tel" placeholder="12 अंकों का आधार नंबर / 12-digit Aadhaar..." maxlength="12" />
        <div id="cscCitizenAadhaarError" class="citizen-error"></div>

        <button class="btn btn-assist" id="btnCitizenContinue" style="margin-top:16px;">
          <span class="btn-icon">➡️</span>
          <span class="btn-content">
            <span class="btn-label">आगे बढ़ें / Continue</span>
            <span class="btn-desc">Go to Form Assist</span>
          </span>
        </button>
      </div>
    `;

    chatContainer.appendChild(card);

    const phoneInput = card.querySelector("#cscCitizenPhone");
    const aadhaarInput = card.querySelector("#cscCitizenAadhaar");
    const phoneError = card.querySelector("#cscCitizenPhoneError");
    const aadhaarError = card.querySelector("#cscCitizenAadhaarError");
    const btnContinue = card.querySelector("#btnCitizenContinue");

    if (btnContinue) {
      btnContinue.addEventListener("click", () => {
        const phone = (phoneInput.value || "").trim();
        const aadhaar = (aadhaarInput.value || "").trim();

        let valid = true;
        phoneError.textContent = "";
        aadhaarError.textContent = "";

        // Simple validations
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          phoneError.textContent = "कृपया 6-9 से शुरू होने वाला 10 अंकों का वैध मोबाइल नंबर दर्ज करें।";
          valid = false;
        }

        const aadhaarRegex = /^\d{12}$/;
        if (!aadhaarRegex.test(aadhaar)) {
          aadhaarError.textContent = "कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।";
          valid = false;
        }

        if (!valid) return;

        // Save into sessionData for later use
        sessionData = sessionData || {};
        sessionData.citizenPhone = phone;
        sessionData.citizenAadhaar = aadhaar;
        saveSession();

        // Proceed to main landing card
        showLandingCard();
      });
    }
  }

  // ─── Landing Card ──────────────────────────────────────────
  function showLandingCard() {
    chatContainer.innerHTML = "";
    inputArea.classList.add("hidden");

    const card = document.createElement("div");
    card.className = "landing-card";

    const displayDomain = formInfo ? formInfo.domain : "Portal Detected";
    const headerTitle = isFormDetected ? "सरकारी फॉर्म मिला!" : "फॉर्म असिस्ट चालू है";

    card.innerHTML = `
      <div class="logo">🏛️</div>
      <h2>CSC सहायक</h2>
      <p>
        ${headerTitle}<br>
        <strong>${escapeHTML(displayDomain)}</strong>
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
        <button class="btn btn-secondary" id="btnSync" style="margin-top: 8px; border-color: #2E9E50; color: #1A7A38;">
          <span class="btn-icon">🔄</span>
          <span class="btn-content">
            <span class="btn-label">ऑफ़लाइन ऐप सिंक करें</span>
            <span class="btn-desc">Sync Offline App</span>
          </span>
        </button>
      </div>
    `;
    chatContainer.appendChild(card);

    const btnAI = card.querySelector("#btnAI");
    const btnApply = card.querySelector("#btnApply");
    const btnAssist = card.querySelector("#btnAssist");
    const btnSync = card.querySelector("#btnSync");

    if (btnAI) btnAI.addEventListener("click", () => startChatFlow("ai"));
    if (btnApply) btnApply.addEventListener("click", () => startChatFlow("apply"));
    if (btnAssist) btnAssist.addEventListener("click", () => startChatFlow("assist"));
    if (btnSync) btnSync.addEventListener("click", () => handleOfflineSync());
  }

  // ─── Offline Sync Handler ──────────────────────────────────
  async function handleOfflineSync() {
    chatContainer.innerHTML = "";
    inputArea.classList.add("hidden");
    headerSubtitle.textContent = "ऑफ़लाइन सिंक";
    headerBadge.textContent = "सिंक";

    showTypingThen(async () => {
      addBotMessage(
        "🔄 ऑफ़लाइन डेस्कटॉप ऐप से डेटा सिंक किया जा रहा है...",
        "Syncing data from offline desktop app..."
      );

      try {
        const res = await fetch('http://127.0.0.1:5000/api/sync/get_staged');
        if (!res.ok) throw new Error("Backend not reachable");
        
        const data = await res.json();
        
        // API returns { status: 'success', data: {...} } or { status: 'empty' }
        if (data.status !== 'success' || !data.data) {
          addBotMessage(
            "\u26a0\ufe0f \u0915\u094b\u0908 \u0928\u092f\u093e \u0938\u093f\u0902\u0915 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964 \u0915\u0943\u092a\u092f\u093e \u0921\u0947\u0938\u094d\u0915\u091f\u0949\u092a \u090f\u092a \u092e\u0947\u0902 '\u0938\u093f\u0902\u0915' \u092c\u091f\u0928 \u0926\u092c\u093e\u090f\u0902\u0964",
            "No new sync data found. Please press 'Sync' in the desktop app.",
            { error: true }
          );
          setTimeout(showLandingCard, 3000);
          return;
        }

        const appData = data.data;
        const fieldsJson = JSON.parse(appData.data_json || appData.fields_json || "[]");
        
        addBotMessage(
          `\u2705 1 \u0906\u0935\u0947\u0926\u0928 \u0938\u093f\u0902\u0915 \u0915\u093f\u092f\u093e \u0917\u092f\u093e (${escapeHTML(appData.name || appData.citizen_name || '')}).\n\u0921\u0947\u091f\u093e \u092b\u0949\u0930\u094d\u092e \u092e\u0947\u0902 \u092d\u0930\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948...`,
          `1 application synced (${escapeHTML(appData.name || appData.citizen_name || '')}).\nFilling form data...`
        );

        // Send raw fields to content script - content.js handles the deep fuzzy mapping
        if (typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "FILL_FORM_DESKTOP",
                data: fieldsJson
              });
            }
          });
        }

        // Clear staged data on backend
        await fetch('http://127.0.0.1:5000/api/sync/clear', { method: 'POST' });

        setTimeout(showLandingCard, 3000);

        // Go to review step
        setTimeout(() => showReviewData(mappedData), 2000);

      } catch (e) {
        console.error("Sync Error:", e);
        addBotMessage(
          "❌ डेस्कटॉप ऐप से कनेक्ट नहीं हो सका। सुनिश्चित करें कि ऐप चल रहा है।",
          "Could not connect to Desktop app. Make sure it is running.",
          { error: true }
        );
        setTimeout(showLandingCard, 3000);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  CHAT FLOW
  // ═══════════════════════════════════════════════════════════

  function startChatFlow(mode) {
    chatContainer.innerHTML = "";
    inputArea.classList.remove("hidden");
    userInput.focus();

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

    sessionData = {};
    uploadedDocuments = {};
    askCitizenName();
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 1 — CITIZEN INFO
  // ═══════════════════════════════════════════════════════════

  function askCitizenName() {
    currentStep = "ASK_NAME";
    userInput.placeholder = "नागरिक का नाम / Citizen's name...";
    userInput.type = "text";
    userInput.disabled = false;

    showTypingThen(() => {
      addBotMessage(
        "🙏 नमस्ते! नागरिक का पूरा नाम क्या है?",
        "Hello! What is the citizen's full name?"
      );
    });
  }

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

  function step1Complete() {
    currentStep = "STEP1_DONE";
    inputArea.classList.add("hidden");

    saveSession();

    showTypingThen(() => {
      addBotMessage(
        `✅ नागरिक की जानकारी सहेज ली गई।\n\n👤 नाम: ${escapeHTML(sessionData.name)}\n📱 नंबर: ${sessionData.phone}`,
        `Citizen info saved.\n\nName: ${escapeHTML(sessionData.name)}\nMobile: ${sessionData.phone}`
      );

      // Immediately proceed to Step 2
      setTimeout(() => showServiceSelection(), 800);
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 2 — SERVICE SELECTION
  // ═══════════════════════════════════════════════════════════

  function showServiceSelection() {
    currentStep = "SELECT_SERVICE";
    headerSubtitle.textContent = "सेवा चुनें / Select Service";
    headerBadge.textContent = "चरण 2";

    showTypingThen(() => {
      addBotMessage(
        "📋 कौन सी सेवा के लिए आवेदन करना है? नीचे से चुनें:",
        "Which service to apply for? Select from below:"
      );

      // Render service cards
      setTimeout(() => {
        renderServiceCards();
      }, 300);
    });
  }

  function renderServiceCards() {
    const grid = document.createElement("div");
    grid.className = "service-grid";

    if (typeof SERVICE_LIST === "undefined") {
      addBotMessage("⚠️ सेवा सूची लोड नहीं हुई।", "Service list not loaded.", { error: true });
      return;
    }

    SERVICE_LIST.forEach((service) => {
      const card = document.createElement("button");
      card.className = "service-card";
      card.dataset.serviceId = service.id;

      card.innerHTML = `
        <span class="service-emoji">${service.emoji}</span>
        <div class="service-info">
          <span class="service-name-hi">${service.nameHindi}</span>
          <span class="service-name-en">${service.name}</span>
        </div>
      `;

      card.addEventListener("click", () => onServiceSelected(service));
      grid.appendChild(card);
    });

    // Wrap grid in a bot message-like container
    const wrapper = document.createElement("div");
    wrapper.className = "message bot widget-message";
    wrapper.innerHTML = `<div class="message-avatar">🤖</div>`;
    const container = document.createElement("div");
    container.className = "widget-container";
    container.appendChild(grid);
    wrapper.appendChild(container);

    chatContainer.appendChild(wrapper);
    scrollToBottom();
  }

  function onServiceSelected(service) {
    // Show user's choice as a message
    addUserMessage(`${service.emoji} ${service.nameHindi} / ${service.name}`);

    // Store selection
    sessionData.selectedService = service.id;
    sessionData.serviceName = service.name;
    sessionData.serviceNameHindi = service.nameHindi;
    saveSession();

    // Disable all service cards
    const cards = chatContainer.querySelectorAll(".service-card");
    cards.forEach((c) => {
      c.disabled = true;
      c.classList.add("selected-disabled");
      if (c.dataset.serviceId === service.id) {
        c.classList.add("selected");
      }
    });

    // Proceed to Step 3
    showTypingThen(() => {
      addBotMessage(
        `👍 ${service.emoji} ${service.nameHindi} चुना गया।\nअब ज़रूरी दस्तावेज़ तैयार करें।`,
        `${service.name} selected.\nNow prepare the required documents.`
      );

      setTimeout(() => showDocumentChecklist(service), 600);
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 3 — DOCUMENT CHECKLIST
  // ═══════════════════════════════════════════════════════════

  function showDocumentChecklist(service) {
    currentStep = "DOC_CHECKLIST";
    headerSubtitle.textContent = `${service.nameHindi} — दस्तावेज़`;
    headerBadge.textContent = "चरण 3";
    inputArea.classList.add("hidden");

    const config = typeof SERVICE_CONFIG !== "undefined"
      ? SERVICE_CONFIG[service.id]
      : service;

    if (!config || !config.requiredDocuments) {
      addBotMessage("⚠️ इस सेवा के लिए दस्तावेज़ सूची उपलब्ध नहीं है।", "Document list not available for this service.", { error: true });
      return;
    }

    showTypingThen(() => {
      const mandatoryCount = config.requiredDocuments.filter((d) => d.mandatory).length;
      const totalCount = config.requiredDocuments.length;

      addBotMessage(
        `📄 कुल ${totalCount} दस्तावेज़ चाहिए। ${mandatoryCount} अनिवार्य हैं (*)।\nफ़ाइल अपलोड करें या मैन्युअल चेक करें।`,
        `${totalCount} documents needed. ${mandatoryCount} mandatory (*).\nUpload files or check manually.`
      );

      setTimeout(() => {
        renderChecklistWidget(config);
      }, 400);
    });
  }

  function renderChecklistWidget(config) {
    const docs = config.requiredDocuments;

    // Build checklist HTML
    let checklistHTML = `
      <div class="checklist-widget" id="checklistWidget">
        <div class="checklist-header">
          <span class="checklist-title">📋 दस्तावेज़ सूची / Document Checklist</span>
          <span class="checklist-count" id="checklistCount">0/${docs.filter((d) => d.mandatory).length} अनिवार्य</span>
        </div>
        <div class="checklist-items">
    `;

    docs.forEach((doc, index) => {
      checklistHTML += `
        <div class="checklist-item" id="checkItem_${doc.id}" data-doc-id="${doc.id}" data-mandatory="${doc.mandatory}">
          <div class="checklist-item-top">
            <label class="checklist-check">
              <input type="checkbox" class="doc-checkbox" data-doc-id="${doc.id}" id="cb_${doc.id}">
              <span class="checkmark"></span>
            </label>
            <div class="checklist-item-info">
              <div class="checklist-item-name">
                ${doc.nameHindi}
                ${doc.mandatory ? '<span class="mandatory-star">*</span>' : ''}
              </div>
              <div class="checklist-item-name-en">${doc.name}</div>
              <div class="checklist-item-desc">${doc.description}</div>
            </div>
            <label class="upload-btn" for="file_${doc.id}" title="फ़ाइल अपलोड करें / Upload File">
              📎
              <input type="file" id="file_${doc.id}" class="file-input" data-doc-id="${doc.id}"
                     accept=".pdf,.jpg,.jpeg,.png">
            </label>
          </div>
          <div class="checklist-item-upload-info hidden" id="uploadInfo_${doc.id}"></div>
        </div>
      `;
    });

    checklistHTML += `
        </div>
        <div class="checklist-footer">
          <div class="checklist-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill" style="width: 0%"></div>
            </div>
            <span class="progress-text" id="progressText">0/${docs.length} दस्तावेज़ जोड़े गए</span>
          </div>
          <button class="btn btn-primary checklist-continue-btn" id="btnContinue" disabled>
            ✅ आगे बढ़ें / Continue →
          </button>
        </div>
      </div>
    `;

    addBotWidget(checklistHTML);

    // Attach event listeners
    attachChecklistListeners(config);
  }

  function attachChecklistListeners(config) {
    const docs = config.requiredDocuments;

    // Checkbox listeners
    docs.forEach((doc) => {
      const cb = document.getElementById(`cb_${doc.id}`);
      const fileInput = document.getElementById(`file_${doc.id}`);

      if (cb) {
        cb.addEventListener("change", () => {
          updateChecklistState(docs);
        });
      }

      if (fileInput) {
        fileInput.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // Validate
          if (typeof CSCUtils !== "undefined") {
            const validation = CSCUtils.validateFile(file);
            if (!validation.valid) {
              addBotMessage(validation.error_hi, validation.error_en, { error: true });
              fileInput.value = "";
              return;
            }
          }

          // Read file
          try {
            let fileData;
            if (typeof CSCUtils !== "undefined") {
              fileData = await CSCUtils.readFileAsBase64(file);
            } else {
              fileData = await readFileAsBase64Fallback(file);
            }

            // Store in memory
            uploadedDocuments[doc.id] = {
              docType: doc.id,
              fileName: fileData.fileName,
              base64: fileData.base64,
              mimeType: fileData.mimeType,
              fileSize: fileData.fileSize
            };

            // Auto-check the checkbox
            const cb = document.getElementById(`cb_${doc.id}`);
            if (cb) cb.checked = true;

            // Show upload info
            showUploadInfo(doc.id, fileData);

            // Update state
            updateChecklistState(docs);

          } catch (err) {
            addBotMessage(
              "⚠️ फ़ाइल पढ़ने में त्रुटि।",
              "Error reading file.",
              { error: true }
            );
          }
        });
      }
    });

    // Continue button
    const btnContinue = document.getElementById("btnContinue");
    if (btnContinue) {
      btnContinue.addEventListener("click", () => onChecklistComplete(config));
    }
  }

  function showUploadInfo(docId, fileData) {
    const infoDiv = document.getElementById(`uploadInfo_${docId}`);
    if (!infoDiv) return;

    infoDiv.classList.remove("hidden");

    const isImg = typeof CSCUtils !== "undefined"
      ? CSCUtils.isImage(fileData.mimeType)
      : (fileData.mimeType === "image/jpeg" || fileData.mimeType === "image/png");

    const fileSize = typeof CSCUtils !== "undefined"
      ? CSCUtils.formatFileSize(fileData.fileSize)
      : (fileData.fileSize / 1024).toFixed(1) + " KB";

    let thumbnailHTML = "";
    if (isImg) {
      thumbnailHTML = `<img class="upload-thumbnail" src="${fileData.base64}" alt="${escapeHTML(fileData.fileName)}">`;
    } else {
      thumbnailHTML = `<div class="upload-file-icon">📄</div>`;
    }

    infoDiv.innerHTML = `
      <div class="upload-preview">
        ${thumbnailHTML}
        <div class="upload-details">
          <span class="upload-filename">${escapeHTML(fileData.fileName)}</span>
          <span class="upload-size">${fileSize}</span>
        </div>
        <span class="upload-checkmark">✅</span>
      </div>
    `;

    // Highlight the checklist item
    const item = document.getElementById(`checkItem_${docId}`);
    if (item) item.classList.add("uploaded");

    scrollToBottom();
  }

  function updateChecklistState(docs) {
    const mandatoryDocs = docs.filter((d) => d.mandatory);
    let checkedMandatory = 0;
    let checkedTotal = 0;

    docs.forEach((doc) => {
      const cb = document.getElementById(`cb_${doc.id}`);
      if (cb && cb.checked) {
        checkedTotal++;
        if (doc.mandatory) checkedMandatory++;
      }
    });

    // Update count badge
    const countEl = document.getElementById("checklistCount");
    if (countEl) {
      countEl.textContent = `${checkedMandatory}/${mandatoryDocs.length} अनिवार्य`;
      countEl.classList.toggle("count-complete", checkedMandatory === mandatoryDocs.length);
    }

    // Update progress
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const pct = docs.length > 0 ? (checkedTotal / docs.length) * 100 : 0;

    if (progressFill) progressFill.style.width = pct + "%";
    if (progressText) progressText.textContent = `${checkedTotal}/${docs.length} दस्तावेज़ जोड़े गए`;

    // Enable/disable continue button
    const btnContinue = document.getElementById("btnContinue");
    if (btnContinue) {
      btnContinue.disabled = checkedMandatory < mandatoryDocs.length;
    }
  }

  function onChecklistComplete(config) {
    // Collect documents into session
    sessionData.documents = Object.values(uploadedDocuments);

    // Also record manual checks (documents without uploads)
    const docs = config.requiredDocuments;
    docs.forEach((doc) => {
      const cb = document.getElementById(`cb_${doc.id}`);
      if (cb && cb.checked && !uploadedDocuments[doc.id]) {
        sessionData.documents.push({
          docType: doc.id,
          fileName: null,
          base64: null,
          mimeType: null,
          fileSize: 0,
          manuallyChecked: true
        });
      }
    });

    saveSession();

    // Disable checklist
    const widget = document.getElementById("checklistWidget");
    if (widget) widget.classList.add("checklist-completed");

    const btnContinue = document.getElementById("btnContinue");
    if (btnContinue) {
      btnContinue.disabled = true;
      btnContinue.textContent = "✅ पूरा / Completed";
    }

    // Proceed to Step 4: Extraction
    setTimeout(() => startDocumentExtraction(config), 600);
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 4 — DOCUMENT EXTRACTION
  // ═══════════════════════════════════════════════════════════

  async function startDocumentExtraction(config) {
    currentStep = "EXTRACTING";
    headerBadge.textContent = "AI निष्कर्षण";
    headerSubtitle.textContent = "डेटा निकाला जा रहा है...";

    // Show extraction loader message
    const loaderId = `loader_${Date.now()}`;
    const loaderHTML = `
      <div class="extraction-loader" id="${loaderId}">
        <div class="loader-header">
          <div class="loader-spinner"></div>
          <span>AI दस्तावेज़ पढ़ रहा है...</span>
        </div>
        <div class="loader-status" id="status_${loaderId}">फॉर्म फ़ील्ड्स खोज रहा है... / Scanning form fields...</div>
        <div class="loader-skeleton">
          <div class="skeleton-row w-70"></div>
          <div class="skeleton-row w-90"></div>
          <div class="skeleton-row w-50"></div>
        </div>
      </div>
    `;
    addBotWidget(loaderHTML);

    const statusEl = document.getElementById(`status_${loaderId}`);

    // ─── STEP 0: Scan form fields from the active tab ────────
    let scannedFields = null;
    let fieldsToExtract = config.formFields || [];

    try {
      scannedFields = await scanActiveTabFormFields(statusEl);
    } catch (e) {
      console.warn("[Panel] Form scanning failed, using config.formFields fallback:", e);
    }

    if (scannedFields && scannedFields.length > 0) {
      console.log("[Panel] Scanned", scannedFields.length, "fields from active tab:", scannedFields);
      fieldsToExtract = scannedFields.map(f => f.fieldKey);

      // Store scanned selectors & labels for auto-fill and display
      sessionData.scannedFields = scannedFields;
      sessionData.scannedSelectors = {};
      sessionData.scannedLabels = {};
      scannedFields.forEach(f => {
        sessionData.scannedSelectors[f.fieldKey] = f.selector;
        sessionData.scannedLabels[f.fieldKey] = {
          en: f.label,
          hi: f.labelHi || f.label
        };
      });

      if (statusEl) statusEl.textContent = `✅ ${scannedFields.length} फ़ील्ड्स मिलीं / ${scannedFields.length} fields found`;
      await delay(800);
    } else {
      console.log("[Panel] No scanned fields, using hardcoded config.formFields:", fieldsToExtract);
      sessionData.scannedFields = null;
      sessionData.scannedSelectors = null;
      sessionData.scannedLabels = null;
    }

    // ─── Continue with extraction ────────────────────────────
    if (statusEl) statusEl.textContent = "दस्तावेज़ जाँच रहा है... / Verifying uploaded documents...";

    const uploadedFiles = sessionData.documents.filter(d => d.base64);
    let extractedResult = null;

    // ─── DEBUG LOGGING ───
    console.log("[Panel] sessionData.documents:", sessionData.documents.length, "total");
    console.log("[Panel] uploadedFiles (with base64):", uploadedFiles.length);
    console.log("[Panel] ExtractionService defined:", typeof ExtractionService !== "undefined");
    console.log("[Panel] fieldsToExtract:", fieldsToExtract);

    if (uploadedFiles.length > 0 && typeof ExtractionService !== "undefined") {
      try {
        console.log("[Panel] Calling ExtractionService.extractFields with", fieldsToExtract.length, "fields");
        
        extractedResult = await ExtractionService.extractFields(
          uploadedFiles,
          fieldsToExtract,
          sessionData.selectedService,
          (stage, message) => {
            console.log("[Panel] Progress:", stage, message);
            if (statusEl) statusEl.textContent = message;
          }
        );
        console.log("[Panel] Extraction result:", extractedResult);
      } catch (err) {
        console.error("[Panel] Extraction FAILED:", err, err.stack);
        if (statusEl) statusEl.textContent = "⚠️ Error: " + err.message;
        
        if (typeof ExtractionService !== "undefined") {
           extractedResult = ExtractionService.getManualEntryFields(fieldsToExtract);
        }
      }
    } else {
      console.warn("[Panel] SKIPPING extraction — uploadedFiles:", uploadedFiles.length, "ExtractionService:", typeof ExtractionService);
      if (statusEl) statusEl.textContent = "No files uploaded. Proceeding to manual entry.";
      await delay(1000);
      if (typeof ExtractionService !== "undefined") {
         extractedResult = ExtractionService.getManualEntryFields(fieldsToExtract);
      } else {
         extractedResult = { extractedFields: {}, crossDocumentMismatches: [] };
      }
    }

    // Remove loader
    const loaderEl = document.getElementById(loaderId);
    if (loaderEl && loaderEl.parentElement && loaderEl.parentElement.parentElement) {
      if (loaderEl.parentElement.parentElement.classList.contains('message')) {
         loaderEl.parentElement.parentElement.remove();
      } else {
         loaderEl.remove();
      }
    } else if (loaderEl) {
       loaderEl.remove();
    }

    // Show results
    showExtractionResults(extractedResult, config);
  }

  /**
   * Send SCAN_FORM_FIELDS to the active tab and return the result.
   * Falls back to injecting content.js first if needed.
   */
  function scanActiveTabFormFields(statusEl) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          reject(new Error("No active tab"));
          return;
        }

        const tabId = tabs[0].id;

        if (statusEl) statusEl.textContent = "फॉर्म स्कैन हो रहा है... / Scanning open form...";

        chrome.tabs.sendMessage(tabId, { type: "SCAN_FORM_FIELDS" }, (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded — inject it first
            if (chrome.scripting) {
              chrome.scripting.executeScript(
                { target: { tabId: tabId }, files: ["content.js"] },
                () => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                  }
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, { type: "SCAN_FORM_FIELDS" }, (res2) => {
                      if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                      } else {
                        resolve(res2 || []);
                      }
                    });
                  }, 500);
                }
              );
            } else {
              reject(new Error("Cannot inject content script"));
            }
          } else {
            resolve(response || []);
          }
        });
      });
    });
  }


  function showExtractionResults(result, config) {
    currentStep = "VERIFY_FIELDS";
    headerBadge.textContent = "जाँचें";
    headerSubtitle.textContent = "विवरण की जाँच करें";
    
    sessionData.extractedData = result;
    saveSession();

    showTypingThen(() => {
      addBotMessage(
        "📄 दस्तावेज़ों से निम्न जानकारी मिली है। कृपया जाँचें और यदि आवश्यक हो तो सुधारें:",
        "Found the following information from documents. Please verify and edit if needed:"
      );

      setTimeout(() => renderExtractedFieldsWidget(result, config), 400);
    });
  }

  function renderExtractedFieldsWidget(result, config) {
    const fields = result.extractedFields || {};
    const mismatches = result.crossDocumentMismatches || [];
    const fieldsKeys = Object.keys(fields);

    if (fieldsKeys.length === 0) {
      addBotMessage("फॉर्म के लिए कोई फ़ील्ड निर्धारित नहीं है।", "No fields configured for this form.", { error: true });
      showFinalSummary(config);
      return;
    }

    let widgetHTML = `
      <div class="extraction-results" id="extractionWidget">
        <div class="extraction-header">
          <span>📝 निकाले गए विवरण / Extracted Details</span>
          <div class="validation-overall-summary" id="csc-validation-summary"></div>
        </div>
        <div class="extraction-list">
    `;

    // Mismatches alert
    if (mismatches.length > 0) {
      widgetHTML += `
        <div class="mismatch-alert">
          <div class="mismatch-title">⚠️ दस्तावेज़ों में अंतर मिला / Mismatch found</div>
          <div class="mismatch-list">
      `;
      mismatches.forEach(m => {
        const fieldLabel = typeof ExtractionService !== "undefined" ? ExtractionService.getFieldLabel(m.field).en : m.field;
        widgetHTML += `• ${fieldLabel} differs: "${escapeHTML(String(m.val1))}" vs "${escapeHTML(String(m.val2))}"<br>`;
      });
      widgetHTML += `
          </div>
        </div>
      `;
    }

    // Field rows
    fieldsKeys.forEach(key => {
      const field = fields[key];
      // Prefer scanned labels from the form page, then ExtractionService, then raw key
      let label;
      if (sessionData.scannedLabels && sessionData.scannedLabels[key]) {
        label = sessionData.scannedLabels[key];
      } else if (typeof ExtractionService !== "undefined") {
        label = ExtractionService.getFieldLabel(key);
      } else {
        label = { en: key, hi: key };
      }
      
      let confLevel = "low";
      let confPct = "0%";
      let confText = "Low Confidence";
      
      if (field.source !== "manual") {
        confLevel = typeof ExtractionService !== "undefined" ? ExtractionService.getConfidenceLevel(field.confidence) : "medium";
        confPct = Math.round(field.confidence * 100) + "%";
        if (confLevel === "high") confText = "High Confidence";
        else if (confLevel === "medium") confText = "Medium Confidence";
      } else {
        confText = "Manual Entry";
      }

      const val = field.value || "";

      widgetHTML += `
        <div class="field-row">
          <div class="field-header">
            <span class="field-label">${escapeHTML(label.hi)} / ${escapeHTML(label.en)}</span>
            <span class="field-source">📄 src: ${escapeHTML(String(field.source))}</span>
          </div>
          <div class="field-input-wrapper">
            <input type="text" class="field-input" id="field_${key}" data-key="${key}" value="${escapeHTML(val)}" placeholder="दर्ज करें / Enter details...">
          </div>
          <div class="confidence-container confidence-${confLevel}">
            <div class="confidence-bar-bg">
              <div class="confidence-bar-fill" style="width: ${confPct}"></div>
            </div>
            <span class="confidence-text">${confPct} - ${confText}</span>
          </div>
          <div class="field-validation" data-validation-for="${key}"></div>
        </div>
      `;
    });

    widgetHTML += `
        </div>
        <div class="extraction-footer">
          <button class="btn btn-primary checklist-continue-btn" id="btnValidate">
            🤖 सत्यापित करें / Validate Application
          </button>
          <button class="btn btn-secondary checklist-continue-btn" id="btnAutofill" style="margin-top:8px;">
            ✨ फॉर्म ऑटो-फ़िल करें / Auto-Fill Form
          </button>
        </div>
      </div>
    `;

    addBotWidget(widgetHTML);

    // Attach validation listener
    const btnValidate = document.getElementById("btnValidate");
    if (btnValidate) {
      btnValidate.addEventListener("click", () => runValidationAndShowDecision(config));
    }
    const btnAutofill = document.getElementById("btnAutofill");
    if (btnAutofill) {
      btnAutofill.addEventListener("click", () => executeAutoFill(config, "btnAutofill"));
    }
    
    // Listen for manual edits to update session data
    fieldsKeys.forEach(key => {
      const input = document.getElementById(`field_${key}`);
      if (input) {
        input.addEventListener("input", (e) => {
          if (sessionData.extractedData && sessionData.extractedData.extractedFields[key]) {
             sessionData.extractedData.extractedFields[key].value = e.target.value;
          }
        });
      }
    });

    scrollToBottom();
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 5 — FORM AUTO-FILL
  // ═══════════════════════════════════════════════════════════

  // ─── Known government domains (kept in sync with content.js) ──
  const GOV_DOMAINS_PANEL = [
    "digilocker.gov.in", "umang.gov.in", "serviceonline.gov.in",
    "edistrict", "cgedistrict", "pmjay.gov.in", "pmkisan.gov.in",
    "nrega.nic.in", "passport.gov.in", "incometax.gov.in",
    "epfindia.gov.in", "csc.gov.in", "apnacsc.com", "uidai.gov.in",
    "meeseva", "emitra", "jansunwai", "parivahan.gov.in",
    "sarathi.parivahan.gov.in", "vahan.parivahan.gov.in", "aadhaar",
    "pan.utiitsl.com", "tin-nsdl.com", "sw.cg.gov.in",
    "kisan.cg.nic.in", "khadya.cg.nic.in", "cgstate.gov.in"
  ];

  function isGovUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return GOV_DOMAINS_PANEL.some(d => lower.includes(d));
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 5 — AI VALIDATION ASSISTANT
  // ═══════════════════════════════════════════════════════════

  async function runValidationAndShowDecision(config) {
    const btnValidate = document.getElementById("btnValidate");
    if (btnValidate) {
      btnValidate.disabled = true;
      btnValidate.innerHTML = '<span class="loader-spinner" style="width:16px;height:16px;border-width:2px;margin-right:8px;"></span> AI सत्यापित कर रहा है...';
    }

    // Capture latest manual edits into a clean flat object
    const finalFields = {};
    Object.keys(sessionData.extractedData.extractedFields).forEach(key => {
      const fieldData = sessionData.extractedData.extractedFields[key];
      const inputEl = document.getElementById(`field_${key}`);
      if (inputEl) {
        fieldData.value = inputEl.value; // sync session data
      }
      finalFields[key] = fieldData.value;
    });

    // Lightweight use of the online model as an auxiliary signal (low weight).
    // Currently implemented for birth_certificate as an example.
    try {
      const svc = sessionData.selectedService || config.serviceId || "default";
      if (svc === "birth_certificate" && typeof OnlineModel !== "undefined" && OnlineModel.predictRejectionProbability) {
        // Build a minimal pseudo-session for feature extraction
        const extracted = sessionData.extractedData.extractedFields || {};
        const confidence = {};
        Object.keys(extracted).forEach(k => {
          const v = extracted[k];
          confidence[k] = typeof v.confidence === "number" ? v.confidence : 0;
        });
        const pseudoSession = {
          extractedFields: Object.fromEntries(
            Object.entries(extracted).map(([k, v]) => [k, v && v.value != null ? v.value : null])
          ),
          confidenceScores: confidence,
          aiValidationResult: null
        };
        const prob = await OnlineModel.predictRejectionProbability(pseudoSession);
        if (typeof prob === "number" && !isNaN(prob)) {
          // Expose as a special meta-field so Groq can see it, but keep LLM as the main decision-maker.
          finalFields._modelRejectionProb = prob.toFixed(3);
        }
      }
    } catch (e) {
      console.warn("[Panel] OnlineModel prediction failed (ignored)", e);
    }

    try {
      // Call AIAssistant using Groq or Fallback
      const result = await AIAssistant.validateApplication(
        sessionData.selectedService || config.serviceId || "default",
        finalFields
      );

      // Cache latest validation for training / SMS
      sessionData.lastValidationResult = result;
      saveSession();

      // Apply validation inline to the extracted fields widget instead of a separate message box
      applyFieldValidationToWidget(result);
    } catch (e) {
      console.error("Validation error:", e);
      // Failsafe: proceed to autofill directly if AI totally crashes
      executeAutoFill(config);
    }
  }

  /**
   * Inline display of AI validation results directly inside the extracted fields widget.
   * For each field, show whether it looks correct or what the issue is.
   */
  function applyFieldValidationToWidget(result) {
    const widget = document.getElementById("extractionWidget");
    if (!widget || !sessionData.extractedData || !sessionData.extractedData.extractedFields) return;

    // Normalize helper to match fields even if naming differs slightly
    function normalizeKey(str) {
      return (str || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    const allIssues = Array.isArray(result.issues) ? result.issues : [];

    // Overall summary at the top of the widget
    const summaryEl = document.getElementById("csc-validation-summary");
    if (summaryEl) {
      const risk = result.overallRisk || "LOW";
      let riskLabel = "🟢 LOW RISK / कम जोखिम";
      if (risk === "HIGH") riskLabel = "🔴 HIGH RISK / उच्च जोखिम";
      else if (risk === "MEDIUM") riskLabel = "🟡 MEDIUM RISK / मध्यम जोखिम";

      summaryEl.innerHTML = `
        <div class="validation-summary-inline">
          <div class="risk-label">${riskLabel}</div>
          <div class="summary-text">
            ${escapeHTML(result.summaryHindi || "")}<br>
            <span style="font-size:0.9em;color:var(--text-secondary)">${escapeHTML(result.summaryEnglish || "")}</span>
          </div>
        </div>
      `;
    }

    // Per-field validation messages
    Object.keys(sessionData.extractedData.extractedFields).forEach(key => {
      const container = widget.querySelector(`.field-validation[data-validation-for="${key}"]`);
      if (!container) return;

      const normKey = normalizeKey(key);

      const fieldIssues = allIssues.filter(issue => {
        const normIssue = normalizeKey(issue.field);
        if (!normIssue) return false;
        if (normIssue === normKey) return true;
        if (normIssue.includes(normKey) || normKey.includes(normIssue)) return true;
        return false;
      });
      if (fieldIssues.length === 0) {
        container.innerHTML = `
          <div class="field-validation-ok">
            ✅ सही लगता है / Looks good
          </div>
        `;
      } else {
        const html = fieldIssues.map(issue => {
          let icon = "ℹ️";
          let cls = "severity-info";
          if (issue.severity === "CRITICAL") { icon = "🛑"; cls = "severity-critical"; }
          else if (issue.severity === "WARNING") { icon = "⚠️"; cls = "severity-warning"; }
          return `
            <div class="field-validation-issue ${cls}">
              <span class="issue-icon">${icon}</span>
              <span class="issue-text">
                ${escapeHTML(issue.messageHindi || "")}<br>${escapeHTML(issue.message || "")}
              </span>
              ${issue.suggestion ? `<span class="issue-suggestion">💡 ${escapeHTML(issue.suggestion)}</span>` : ""}
            </div>
          `;
        }).join("");
        container.innerHTML = html;
      }
    });
  }

  function renderValidationUI(result, config) {
    // Determine risk badge styling
    let riskBadgeClass = "risk-badge-low";
    let riskText = "🟢 LOW RISK / कोई जोखिम नहीं";
    
    if (result.overallRisk === "HIGH") {
      riskBadgeClass = "risk-badge-high";
      riskText = "🔴 HIGH RISK / अस्वीकृति का जोखिम";
    } else if (result.overallRisk === "MEDIUM") {
      riskBadgeClass = "risk-badge-medium";
      riskText = "🟡 MEDIUM RISK / मध्यम जोखिम";
    }

    // Build Issues List HTML
    let issuesHtml = "";
    if (result.issues && result.issues.length > 0) {
      issuesHtml = `<div class="validation-issues-list">`;
      result.issues.forEach(issue => {
        let icon = "ℹ️";
        let sevClass = "severity-info";
        if (issue.severity === "CRITICAL") { icon = "🛑"; sevClass = "severity-critical"; }
        else if (issue.severity === "WARNING") { icon = "⚠️"; sevClass = "severity-warning"; }

        issuesHtml += `
          <div class="issue-item ${sevClass}">
            <div class="issue-icon">${icon}</div>
            <div class="issue-content">
              <span class="issue-field">Field: ${escapeHTML(issue.field)}</span>
              <span class="issue-text">${escapeHTML(issue.messageHindi)}<br>${escapeHTML(issue.message)}</span>
              ${issue.suggestion ? `<span class="issue-suggestion">💡 Suggestion: ${escapeHTML(issue.suggestion)}</span>` : ''}
            </div>
          </div>
        `;
      });
      issuesHtml += `</div>`;
    } else {
      issuesHtml = `<div class="issue-item severity-info"><div class="issue-icon">✅</div><div class="issue-content"><span class="issue-text">No issues detected. All rules passed.</span></div></div>`;
    }

    // Action buttons
    let actionButtonsHtml = "";
    if (result.overallRisk === "HIGH" || result.eligibilityVerdict === "LIKELY_REJECTED") {
      actionButtonsHtml = `
        <button class="btn btn-danger" style="flex:1" id="btnCancelApp">🚫 रद्द करें / Cancel</button>
        <button class="btn btn-secondary" style="flex:1" id="btnSubmitAnyway">⚠️ फिर भी भरें / Fill Anyway</button>
      `;
    } else {
      actionButtonsHtml = `
        <button class="btn btn-primary w-100" id="btnSubmitForm">✨ फॉर्म ऑटो-फ़िल करें / Auto-Fill Form</button>
      `;
    }

    // Header badge indicating if it was offline
    const modeBadge = result.isOfflineFallback ? "<span style='font-size:10px;background:rgba(255,255,255,0.2);padding:2px 6px;border-radius:6px;margin-left:8px;'>Offline Rules Engine</span>" : "<span style='font-size:10px;background:rgba(255,255,255,0.2);padding:2px 6px;border-radius:6px;margin-left:8px;'>AI Powered</span>";

    const uiHtml = `
      <div class="validation-card" id="csc-validation-card" style="margin-top: 10px;">
        <div class="validation-header">
          <span>🤖 AI सत्यापन / AI Validation ${modeBadge}</span>
          <span class="risk-badge ${riskBadgeClass}">${riskText}</span>
        </div>
        <div class="validation-body">
          <div class="validation-summary">
            <strong>सार / Summary:</strong><br>
            ${escapeHTML(result.summaryHindi)}<br>
            <span style="font-size:0.9em;color:var(--text-secondary)">${escapeHTML(result.summaryEnglish)}</span>
          </div>
          ${issuesHtml}
        </div>
        <div class="validation-actions">
          ${actionButtonsHtml}
        </div>
      </div>
    `;

    // If a validation card already exists, update it in-place; otherwise add a new widget.
    const existingCard = document.getElementById("csc-validation-card");
    if (existingCard) {
      existingCard.outerHTML = uiHtml;
    } else {
      addBotWidget(uiHtml);
    }

    // Wire up the new buttons to the autofill flow or cancellation
    const btnCancelApp = document.getElementById("btnCancelApp");
    const btnSubmitAnyway = document.getElementById("btnSubmitAnyway");
    const btnSubmitForm = document.getElementById("btnSubmitForm");

    if (btnCancelApp) {
      btnCancelApp.addEventListener("click", () => {
        btnCancelApp.disabled = true;
        if (btnSubmitAnyway) btnSubmitAnyway.disabled = true;
        addBotMessage("🚫 आवेदन रद्द कर दिया गया है।", "Application cancelled due to high rejection risk.", { error: true });
        // Re-enable Validate so user can try again after making changes
        const btnValidate = document.getElementById("btnValidate");
        if (btnValidate) {
          btnValidate.disabled = false;
          btnValidate.innerHTML = "🤖 सत्यापित करें / Validate Application";
        }
      });
    }

    if (btnSubmitAnyway) {
      btnSubmitAnyway.addEventListener("click", () => {
        executeAutoFill(config, "btnSubmitAnyway");
      });
    }

    if (btnSubmitForm) {
      btnSubmitForm.addEventListener("click", () => {
        executeAutoFill(config, "btnSubmitForm");
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 6 — FORM AUTO-FILL
  // ═══════════════════════════════════════════════════════════

  function executeAutoFill(config, triggerButtonId = null) {
    const btnToDisable = document.getElementById(triggerButtonId || "btnValidate");
    if (btnToDisable) {
      btnToDisable.disabled = true;
      btnToDisable.innerHTML = '<span class="loader-spinner" style="width:16px;height:16px;border-width:2px;margin-right:8px;"></span> भर रहा है...';
    }

    // Re-query the active tab at click time — don't rely on stale isFormDetected at panel init
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || tabs.length === 0) {
        handleAutoFillResponse({ error: "No active tab found" }, config);
        return;
      }

      const activeTab = tabs[0];
      const tabUrl = activeTab.url || "";

      // ─── Universal Auto-Fill ───
      const finalFields = {};
      const confidenceMap = {};

      Object.keys(sessionData.extractedData.extractedFields).forEach(key => {
        const fieldData = sessionData.extractedData.extractedFields[key];
        const inputEl = document.getElementById(`field_${key}`);
        if (inputEl) {
          fieldData.value = inputEl.value;
        }
        finalFields[key] = fieldData.value;
        confidenceMap[key] = fieldData.confidence;
      });

      // ─── Use scanned selectors (dynamic) or URL-based mapping (fallback) ───
      let selectors = {};
      if (sessionData.scannedSelectors && Object.keys(sessionData.scannedSelectors).length > 0) {
        selectors = sessionData.scannedSelectors;
      } else if (typeof getFormMapping !== "undefined") {
        let resolvedId = sessionData.selectedService;
        const lowerUrl = tabUrl.toLowerCase();
        const URL_MAPPING_RULES = [
          { pattern: "userRegistrationAdditionalDetails", id: "cgedistrict_user_registration" },
          { pattern: "incomeCertificate", id: "income_certificate" },
          { pattern: "birthCertificate", id: "birth_certificate" },
          { pattern: "deathCertificate", id: "death_certificate" },
          { pattern: "domicile", id: "domicile_certificate" },
          { pattern: "casteCertificate", id: "caste_certificate" },
          { pattern: "oldAge", id: "old_age_pension" },
          { pattern: "widow", id: "widow_pension" },
          { pattern: "ration", id: "ration_card" }
        ];
        for (const rule of URL_MAPPING_RULES) {
          if (lowerUrl.includes(rule.pattern.toLowerCase())) {
            resolvedId = rule.id;
            break;
          }
        }
        const mapping = getFormMapping(resolvedId) || getFormMapping(sessionData.selectedService);
        if (mapping) selectors = mapping.selectors;
      }

      // ─── AI dropdown resolution: get form options and resolve non-matching dropdown values ───
      try {
        const scannedFields = await scanActiveTabFormFields();
        const fieldKeyToOptions = {};
        (scannedFields || []).forEach(f => {
          if (f.options && f.options.length > 0) {
            fieldKeyToOptions[f.fieldKey] = f.options;
          }
        });
        for (const key of Object.keys(finalFields)) {
          const opts = fieldKeyToOptions[key];
          if (!opts || !opts.length) continue;
          const val = finalFields[key];
          if (!val || typeof val !== "string") continue;
          const v = String(val).trim().toLowerCase();
          const exactMatch = opts.some(o => {
            const oVal = (o.value != null ? String(o.value).trim().toLowerCase() : "");
            const oText = (o.text != null ? String(o.text).trim().toLowerCase() : "");
            return oVal === v || oText === v;
          });
          if (exactMatch) continue;
          if (typeof AIAssistant !== "undefined" && AIAssistant.pickBestDropdownOption) {
            try {
              const resolved = await AIAssistant.pickBestDropdownOption(val, opts);
              if (resolved) finalFields[key] = resolved;
            } catch (e) { /* keep original */ }
          }
        }
      } catch (e) {
        /* scan or resolve failed — proceed with original values */
      }

      // If content script isn't running yet on this tab, inject it first then fill
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          type: "AUTO_FILL_FORM",
          fields: finalFields,
          selectors: selectors,
          confidenceMap: confidenceMap
        },
        (response) => {
          if (chrome.runtime.lastError) {
            injectAndFill(activeTab.id, finalFields, selectors, confidenceMap, config);
          } else {
            handleAutoFillResponse(response || {}, config);
          }
        }
      );
    });
  }

  function injectAndFill(tabId, finalFields, selectors, confidenceMap, config) {
    // Inject content script programmatically, then retry
    if (chrome.scripting) {
      chrome.scripting.executeScript(
        { target: { tabId: tabId }, files: ["content.js"] },
        () => {
          if (chrome.runtime.lastError) {
            handleAutoFillResponse({ error: chrome.runtime.lastError.message }, config);
            return;
          }
          // Small delay to let the script initialize
          setTimeout(() => {
            chrome.tabs.sendMessage(
              tabId,
              { type: "AUTO_FILL_FORM", fields: finalFields, selectors: selectors, confidenceMap: confidenceMap },
              (response) => {
                if (chrome.runtime.lastError) {
                  handleAutoFillResponse({ error: "Could not communicate with page: " + chrome.runtime.lastError.message }, config);
                } else {
                  handleAutoFillResponse(response || {}, config);
                }
              }
            );
          }, 500);
        }
      );
    } else {
      handleAutoFillResponse({ error: "Cannot inject content script. Please reload the form page and try again." }, config);
    }
  }

  /** Reset all validation/autofill buttons so loading spinner does not run forever */
  function resetValidationAndAutofillButtons() {
    const btnValidate = document.getElementById("btnValidate");
    if (btnValidate) {
      btnValidate.disabled = false;
      btnValidate.innerHTML = "🤖 सत्यापित करें / Validate Application";
    }
    const btnSubmitAnyway = document.getElementById("btnSubmitAnyway");
    if (btnSubmitAnyway) {
      btnSubmitAnyway.disabled = false;
      btnSubmitAnyway.innerHTML = "⚠️ फिर भी भरें / Fill Anyway";
    }
    const btnSubmitForm = document.getElementById("btnSubmitForm");
    if (btnSubmitForm) {
      btnSubmitForm.disabled = false;
      btnSubmitForm.innerHTML = "✨ फॉर्म ऑटो-फ़िल करें / Auto-Fill Form";
    }
  }

  function handleAutoFillResponse(response, config) {
    const widget = document.getElementById("extractionWidget");
    if (widget) widget.classList.add("checklist-completed");

    // Always clear loading state on validation card buttons so UI is not stuck
    resetValidationAndAutofillButtons();

    const btnAutofill = document.getElementById("btnAutofill");

    if (response && response.error) {
      // Show actual error + allow retry
      if (btnAutofill) {
        btnAutofill.disabled = false;
        btnAutofill.textContent = "🔄 फिर कोशिश करें / Retry";
      }
      addBotMessage(
        `⚠️ फॉर्म भरने में समस्या आई।\n\n📋 कारण: ${response.error}\n\nपेज को Reload करें और फिर कोशिश करें।`,
        `Error auto-filling form.\n\nReason: ${response.error}\n\nPlease reload the form page and retry.`,
        { error: true }
      );

      // Show manual copy fallback
      if (sessionData.extractedData) {
        let manualHTML = `<div class="extraction-results" style="margin-top:8px;"><div class="extraction-header">📋 मैन्युअल कॉपी करें / Copy Manually</div><div class="extraction-list">`;
        Object.entries(sessionData.extractedData.extractedFields || {}).forEach(([key, field]) => {
          if (field.value) {
            manualHTML += `<div class="field-row" style="padding:6px 0;"><span style="font-weight:600;font-size:12px;">${escapeHTML(key)}</span><div style="font-size:14px;color:#1a1a2e;padding:4px 8px;background:#f0f4ff;border-radius:6px;margin-top:2px;">${escapeHTML(field.value)}</div></div>`;
          }
        });
        manualHTML += `</div></div>`;
        addBotWidget(manualHTML);
      }
    } else {
      const filled = response ? (response.filledCount || 0) : 0;
      const total = response ? (response.totalFields || 0) : 0;

      if (btnAutofill) {
        btnAutofill.disabled = false;
        btnAutofill.textContent = "✨ जानकारी फिर से भरें / Refill Form";
      }

      if (filled === 0 && total > 0) {
        // Selectors didn't match any fields — show manual copy
        addBotMessage(
          `⚠️ फ़ील्ड्स नहीं मिले (${total} में से 0 भरे गए)। फॉर्म के फ़ील्ड नाम अलग हो सकते हैं। नीचे से कॉपी करें।`,
          `0/${total} fields matched — form field names may differ. Copy values below manually.`,
          { error: true }
        );
        if (sessionData.extractedData) {
          let manualHTML = `<div class="extraction-results" style="margin-top:8px;"><div class="extraction-header">📋 मैन्युअल कॉपी करें / Copy Manually</div><div class="extraction-list">`;
          Object.entries(sessionData.extractedData.extractedFields || {}).forEach(([key, field]) => {
            if (field.value) {
              manualHTML += `<div class="field-row" style="padding:6px 0;"><span style="font-weight:600;font-size:12px;">${escapeHTML(key)}</span><div style="font-size:14px;color:#1a1a2e;padding:4px 8px;background:#f0f4ff;border-radius:6px;margin-top:2px;">${escapeHTML(field.value)}</div></div>`;
            }
          });
          manualHTML += `</div></div>`;
          addBotWidget(manualHTML);
        }
      } else {
        // Single, updatable summary block instead of new messages every time
        const summaryHtml = `
          <div class="autofill-summary-card" id="csc-autofill-summary" style="margin-top:10px;">
            <div class="validation-summary">
              <strong>सार / Summary:</strong><br>
              ✅ सफलता! ${filled}/${total} फ़ील्ड्स फॉर्म में भर दिए गए हैं। पीले रंग के फ़ील्ड्स को एक बार जाँच लें।<br>
              <span style="font-size:0.9em;color:var(--text-secondary)">
                Success! ${filled}/${total} fields filled. Please verify highlighted fields.
              </span>
            </div>
            <div class="widget-actions" style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
              <button class="btn btn-secondary" id="btnValidateAgain">
                🔄 फिर सत्यापित करें / Validate Again
              </button>
              <button class="btn btn-secondary" id="btnAutofillAgain">
                ✨ फिर भरें / Auto-Fill Again
              </button>
              <button class="btn btn-primary w-100" id="btnFormSubmitted">
                ✅ फॉर्म जमा हो गया / Form Submitted
              </button>
            </div>
          </div>
        `;

        const existingSummary = document.getElementById("csc-autofill-summary");
        if (existingSummary) {
          existingSummary.outerHTML = summaryHtml;
        } else {
          addBotWidget(summaryHtml);
        }

        const btnFormSubmitted = document.getElementById("btnFormSubmitted");
        if (btnFormSubmitted) {
          btnFormSubmitted.onclick = async () => {
            btnFormSubmitted.disabled = true;
            btnFormSubmitted.textContent = "प्रसंस्करण... / Processing...";
            await finalizeOcrSession("SUBMITTED");
            showFinalSummary(config);
          };
        }
        const btnValidateAgain = document.getElementById("btnValidateAgain");
        if (btnValidateAgain) {
          btnValidateAgain.onclick = () => runValidationAndShowDecision(config);
        }
        const btnAutofillAgain = document.getElementById("btnAutofillAgain");
        if (btnAutofillAgain) {
          btnAutofillAgain.onclick = () => executeAutoFill(config);
        }
      }
    }
  }

  function showFinalSummary(config) {
    currentStep = "DONE";
    headerBadge.textContent = "✓ पूरा";
    
    showTypingThen(() => {
      const name = sessionData.citizenName || sessionData.name || "नागरिक";
      const service = sessionData.serviceNameHindi || sessionData.serviceName || "सेवा";
      const phone = sessionData.citizenPhone || sessionData.phone || "";

      addBotMessage(
        "🎉 आवेदन प्रक्रिया पूरी हुई। क्या मैं किसी और फॉर्म में मदद कर सकता हूँ?",
        "Application process complete. Can I help with another form?"
      );

      // WhatsApp + Print actions
      const actionsWrapper = document.createElement("div");
      actionsWrapper.className = "widget-actions";
      actionsWrapper.style.marginTop = "10px";

      const waBtn = document.createElement("button");
      waBtn.className = "btn btn-primary";
      waBtn.style.width = "100%";
      waBtn.style.marginBottom = "8px";
      waBtn.innerHTML = "📱 WhatsApp संदेश भेजें / Send WhatsApp Message";

      const printBtn = document.createElement("button");
      printBtn.className = "btn btn-secondary";
      printBtn.style.width = "100%";
      printBtn.innerHTML = "🖨️ रसीद प्रिंट करें / Print Receipt";

      actionsWrapper.appendChild(waBtn);
      actionsWrapper.appendChild(printBtn);
      chatContainer.appendChild(actionsWrapper);

      waBtn.addEventListener("click", () => {
        if (!phone) {
          addBotMessage(
            "⚠️ मोबाइल नंबर उपलब्ध नहीं है।",
            "Citizen phone number is not available.",
            { error: true }
          );
          return;
        }
        const text = [
          `नमस्ते ${name}!`,
          `आपका ${service} आवेदन सफलतापूर्वक जमा हो गया है।`,
          `यह संदेश CSC सहायक के माध्यम से भेजा गया है।`
        ].join("\n");
        const waPhone = phone.replace(/\D/g, "");
        const url = `https://wa.me/91${waPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
      });

      printBtn.addEventListener("click", () => {
        const refId = sessionData.lastSavedSessionId || "-";
        const win = window.open("", "_blank");
        if (!win) return;
        const now = new Date().toLocaleString("hi-IN");
        const extracted = sessionData.extractedData ? sessionData.extractedData.extractedFields || {} : {};
        let rows = "";
        Object.entries(extracted).forEach(([key, field]) => {
          const val = field && field.value != null ? field.value : "";
          rows += `<tr><td style="padding:4px 8px;border:1px solid #ccc;">${escapeHTML(key)}</td><td style="padding:4px 8px;border:1px solid #ccc;">${escapeHTML(String(val))}</td></tr>`;
        });

        win.document.write(`
          <!DOCTYPE html>
          <html lang="hi">
          <head>
            <meta charset="UTF-8" />
            <title>CSC Receipt</title>
          </head>
          <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <h2>CSC सहायक रसीद / CSC Sahayak Receipt</h2>
            <p>नागरिक का नाम: <strong>${escapeHTML(name)}</strong><br>
            सेवा: <strong>${escapeHTML(service)}</strong><br>
            मोबाइल: <strong>${escapeHTML(phone || "-")}</strong><br>
            संदर्भ: <strong>${escapeHTML(refId)}</strong><br>
            दिनांक: <strong>${escapeHTML(now)}</strong></p>
            <hr>
            <h3>भरे गए विवरण / Filled Details</h3>
            <table style="border-collapse:collapse;width:100%;font-size:13px;">
              <thead>
                <tr>
                  <th style="padding:4px 8px;border:1px solid #ccc;text-align:left;">Field</th>
                  <th style="padding:4px 8px;border:1px solid #ccc;text-align:left;">Value</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
          </html>
        `);
        win.document.close();
        win.focus();
        win.print();
      });

      setTimeout(() => {
        const restartBtn = document.createElement("button");
        restartBtn.className = "btn btn-secondary";
        restartBtn.style.marginTop = "12px";
        restartBtn.style.width = "100%";
        restartBtn.innerHTML = "🔄 नया आवेदन / New Application";
        restartBtn.addEventListener("click", () => {
          showLandingCard();
        });
        chatContainer.appendChild(restartBtn);
        scrollToBottom();
      }, 500);
    });
  }

  /**
   * Build and persist a training session, trigger model sync & SMS.
   */
  async function finalizeOcrSession(operatorDecision, refId = null) {
    if (!sessionData || !sessionData.extractedData) return;

    const extracted = sessionData.extractedData.extractedFields || {};
    const confidence = {};
    Object.keys(extracted).forEach(k => {
      const v = extracted[k];
      confidence[k] = typeof v.confidence === "number" ? v.confidence : 0;
    });

    const aiResult = sessionData.lastValidationResult || null;

    const payload = {
      sessionId: null,
      timestamp: new Date().toISOString(),
      citizenName: sessionData.name || null,
      citizenPhone: sessionData.phone || sessionData.citizenPhone || null,
      serviceType: sessionData.selectedService || "default",
      extractedFields: Object.fromEntries(
        Object.entries(extracted).map(([k, v]) => [k, v && v.value != null ? v.value : null])
      ),
      confidenceScores: confidence,
      aiValidationResult: aiResult,
      operatorDecision,
      outcome: null
    };

    let saved = null;
    try {
      if (typeof SessionManager !== "undefined" && SessionManager.saveSession) {
        saved = await SessionManager.saveSession(payload);
        sessionData.lastSavedSessionId = saved.sessionId;
      }
    } catch (e) {
      console.warn("[Panel] SessionManager.saveSession failed", e);
    }

    try {
      if (typeof ModelSync !== "undefined" && ModelSync.enqueueSession && saved) {
        ModelSync.enqueueSession(saved);
      }
    } catch (e) {
      console.warn("[Panel] ModelSync.enqueueSession failed", e);
    }

    // Fire SMS notification if configured (optional; WhatsApp/print are primary channels now)
    try {
      if (typeof SMSService !== "undefined" && SMSService.sendSMS && payload.citizenPhone) {
        let tpl = "APPLICATION_SUBMITTED";
        if (operatorDecision === "CANCELLED_AI_WARNING" || operatorDecision === "CANCELLED_BY_OPERATOR") {
          tpl = "APPLICATION_CANCELLED";
        }
        const ok = await SMSService.sendSMS(payload.citizenPhone, tpl, {
          name: payload.citizenName || "नागरिक",
          service: sessionData.serviceNameHindi || sessionData.serviceName || "सेवा",
          refId: refId || (saved && saved.sessionId) || "-"
        });
        if (ok) {
          addBotMessage(
            "📱 नागरिक को SMS भेजा गया।",
            "SMS sent to the citizen.",
            {}
          );
        } else {
          addBotMessage(
            "⚠️ SMS सेवा कॉन्फ़िगर नहीं है या भेजने में समस्या आई। कृपया SMS सेटिंग्स जाँचें।",
            "SMS could not be sent (API key / provider not configured). Please check SMS settings.",
            { error: true }
          );
        }
      }
    } catch (e) {
      console.warn("[Panel] SMS send failed", e);
    }
  }

  // ─── Fallback for readFileAsBase64 without CSCUtils ────────
  function readFileAsBase64Fallback(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        base64: reader.result,
        mimeType: file.type || "application/octet-stream",
        fileName: file.name,
        fileSize: file.size
      });
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  VALIDATION
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  //  INPUT HANDLING
  // ═══════════════════════════════════════════════════════════

  function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    userInput.value = "";
    btnSend.disabled = true;

    if (currentStep === "ASK_NAME") {
      const result = validateName(text);
      if (!result.valid) {
        showTypingThen(() => addBotMessage(result.error_hi, result.error_en, { error: true }));
      } else {
        sessionData.name = result.value;
        askMobileNumber();
      }
    } else if (currentStep === "ASK_PHONE") {
      const result = validatePhone(text);
      if (!result.valid) {
        showTypingThen(() => addBotMessage(result.error_hi, result.error_en, { error: true }));
      } else {
        sessionData.phone = result.value;
        step1Complete();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════════════════════

  function init() {
    try {
      chrome.runtime.sendMessage({ type: "GET_FORM_STATUS" }, (response) => {
        if (chrome.runtime.lastError) {
          showCitizenGateCard();
          return;
        }
        if (response && response.detected) {
          isFormDetected = true;
          formInfo = response;
        }
        showCitizenGateCard();
      });
    } catch (e) {
      showCitizenGateCard();
    }
  }

  init();
})();
