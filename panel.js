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

  // ─── Landing Card ──────────────────────────────────────────
  function showLandingCard() {
    chatContainer.innerHTML = "";
    inputArea.classList.add("hidden");

    const card = document.createElement("div");
    card.className = "landing-card";

    if (isFormDetected && formInfo) {
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

    const btnAI = card.querySelector("#btnAI");
    const btnApply = card.querySelector("#btnApply");
    const btnAssist = card.querySelector("#btnAssist");

    if (btnAI) btnAI.addEventListener("click", () => startChatFlow("ai"));
    if (btnApply) btnApply.addEventListener("click", () => startChatFlow("apply"));
    if (btnAssist) btnAssist.addEventListener("click", () => startChatFlow("assist"));
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
        <div class="loader-status" id="status_${loaderId}">Verifying uploaded documents...</div>
        <div class="loader-skeleton">
          <div class="skeleton-row w-70"></div>
          <div class="skeleton-row w-90"></div>
          <div class="skeleton-row w-50"></div>
        </div>
      </div>
    `;
    addBotWidget(loaderHTML);

    const statusEl = document.getElementById(`status_${loaderId}`);
    
    // Only extract if we have actual files and ExtractionService exists
    const uploadedFiles = sessionData.documents.filter(d => d.base64);
    let extractedResult = null;

    // ─── DEBUG LOGGING ───
    console.log("[Panel] sessionData.documents:", sessionData.documents.length, "total");
    console.log("[Panel] uploadedFiles (with base64):", uploadedFiles.length);
    console.log("[Panel] ExtractionService defined:", typeof ExtractionService !== "undefined");
    console.log("[Panel] config.formFields:", config.formFields);
    uploadedFiles.forEach((f, i) => {
      console.log(`[Panel] File ${i}: ${f.fileName}, type=${f.docType}, mime=${f.mimeType}, base64 length=${f.base64 ? f.base64.length : 0}`);
    });

    if (uploadedFiles.length > 0 && typeof ExtractionService !== "undefined") {
      try {
        const fieldsToExtract = config.formFields || [];
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
        
        if (typeof ExtractionService !== "undefined" && config.formFields) {
           extractedResult = ExtractionService.getManualEntryFields(config.formFields);
        }
      }
    } else {
      console.warn("[Panel] SKIPPING extraction — uploadedFiles:", uploadedFiles.length, "ExtractionService:", typeof ExtractionService);
      if (statusEl) statusEl.textContent = "No files uploaded. Proceeding to manual entry.";
      await delay(1000);
      if (typeof ExtractionService !== "undefined" && config.formFields) {
         extractedResult = ExtractionService.getManualEntryFields(config.formFields);
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
      const label = typeof ExtractionService !== "undefined" ? ExtractionService.getFieldLabel(key) : { en: key, hi: key };
      
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
        </div>
      `;
    });

    widgetHTML += `
        </div>
        <div class="extraction-footer">
          <button class="btn btn-primary checklist-continue-btn" id="btnAutofill">
            ✨ फॉर्म भरें / Auto-Fill Form
          </button>
        </div>
      </div>
    `;

    addBotWidget(widgetHTML);

    // Attach autofill listener
    const btnAutofill = document.getElementById("btnAutofill");
    if (btnAutofill) {
      btnAutofill.addEventListener("click", () => executeAutoFill(config));
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

  function executeAutoFill(config) {
    const btnAutofill = document.getElementById("btnAutofill");
    if (btnAutofill) {
      btnAutofill.disabled = true;
      btnAutofill.innerHTML = '<span class="loader-spinner" style="width:16px;height:16px;border-width:2px;margin-right:8px;"></span> भर रहा है...';
    }

    if (!isFormDetected) {
      addBotMessage(
        "⚠️ कोई सरकारी फॉर्म नहीं मिला। कृपया पहले पोर्टल खोलें।",
        "No government form detected. Please open the portal first.",
        { error: true }
      );
      
      // Let user open the form
      if (config.formUrl) {
         addBotMessage(
           `🌐 फॉर्म पोर्टल यहाँ खोलें:\n<a href="${config.formUrl}" target="_blank" style="color:var(--navy);font-weight:bold;">${config.formUrl}</a>`,
           "Open the form portal in a new tab."
         );
      }
      
      if (btnAutofill) {
        btnAutofill.disabled = false;
        btnAutofill.textContent = "✨ फॉर्म भरें / Auto-Fill Form";
      }
      return;
    }

    // Get final values and confidence map
    const finalFields = {};
    const confidenceMap = {};
    
    Object.keys(sessionData.extractedData.extractedFields).forEach(key => {
      const fieldData = sessionData.extractedData.extractedFields[key];
      finalFields[key] = fieldData.value;
      confidenceMap[key] = fieldData.confidence;
    });

    // Get form mappings
    let selectors = {};
    if (typeof getFormMapping !== "undefined") {
       const mapping = getFormMapping(sessionData.selectedService);
       if (mapping) selectors = mapping.selectors;
    }

    // Send payload to content script
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
           handleAutoFillResponse({ error: "No active tab found" }, config);
           return;
        }
        
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "AUTO_FILL_FORM",
            fields: finalFields,
            selectors: selectors,
            confidenceMap: confidenceMap
          },
          (response) => {
            if (chrome.runtime.lastError) {
              handleAutoFillResponse({ error: chrome.runtime.lastError.message }, config);
            } else {
              handleAutoFillResponse(response || {}, config);
            }
          }
        );
      });
    } catch (e) {
      handleAutoFillResponse({ error: e.message }, config);
    }
  }

  function handleAutoFillResponse(response, config) {
    const widget = document.getElementById("extractionWidget");
    if (widget) widget.classList.add("checklist-completed");
    
    const btnAutofill = document.getElementById("btnAutofill");
    if (btnAutofill) {
      btnAutofill.textContent = "✅ फॉर्म भर गया / Form Filled";
    }

    if (response && response.error) {
       addBotMessage(
         "⚠️ फॉर्म भरने में समस्या आई। आप मैन्युअल रूप से विवरण कॉपी कर सकते हैं।",
         "Error auto-filling form. You can copy details manually.",
         { error: true }
       );
    } else {
       const filled = response ? (response.filledCount || 0) : 0;
       const total = response ? (response.totalFields || 0) : 0;
       
       showTypingThen(() => {
         addBotMessage(
           `✅ सफलता! ${filled}/${total} फ़ील्ड्स फॉर्म में भर दिए गए हैं। पीले रंग के फ़ील्ड्स को एक बार जाँच लें।`,
           `Success! ${filled}/${total} fields filled. Please verify the yellow-highlighted fields.`
         );
         
         setTimeout(() => showFinalSummary(config), 800);
       });
    }
  }

  function showFinalSummary(config) {
    currentStep = "DONE";
    headerBadge.textContent = "✓ पूरा";
    
    showTypingThen(() => {
      addBotMessage(
        "🎉 आवेदन प्रक्रिया पूरी हुई। क्या मैं किसी और फॉर्म में मदद कर सकता हूँ?",
        "Application process complete. Can I help with another form?"
      );
      
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
      showLandingCard();
    }
  }

  init();
})();
