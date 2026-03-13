/* ============================================================
   CSC Sahayak — Extraction Service
   FileTract Local Python Backend API Integration
   Pipeline: Upload Base64 → App.py (OCR+Gemini) → Poll Status
   ============================================================ */

const ExtractionService = (() => {
  "use strict";

  // ─── Configuration ──────────────────────────────────────────
  // The local FileTract Flask server URL
  const API_BASE_URL = "http://localhost:5000";

  // Polling settings
  const POLLING_INTERVAL = 2000; // 2 seconds
  const MAX_POLLING_ATTEMPTS = 150; // 300 seconds max wait (Patent pipeline is heavy and can take 60-90s+)

  // ─── Field Label Mappings ──────────────────────────────────
  const FIELD_LABELS = {
    childName: { en: "Child Name", hi: "बच्चे का नाम" },
    dateOfBirth: { en: "Date of Birth", hi: "जन्म तिथि" },
    gender: { en: "Gender", hi: "लिंग" },
    placeOfBirth: { en: "Place of Birth", hi: "जन्म स्थान" },
    fatherName: { en: "Father's Name", hi: "पिता का नाम" },
    motherName: { en: "Mother's Name", hi: "माता का नाम" },
    fatherAadhaar: { en: "Father's Aadhaar", hi: "पिता का आधार" },
    motherAadhaar: { en: "Mother's Aadhaar", hi: "माता का आधार" },
    hospitalName: { en: "Hospital Name", hi: "अस्पताल का नाम" },
    address: { en: "Address", hi: "पता" },
    district: { en: "District", hi: "जिला" },
    state: { en: "State", hi: "राज्य" },
    applicantName: { en: "Applicant Name", hi: "आवेदक का नाम" },
    deceasedName: { en: "Deceased Name", hi: "मृतक का नाम" },
    dateOfDeath: { en: "Date of Death", hi: "मृत्यु तिथि" },
    causeOfDeath: { en: "Cause of Death", hi: "मृत्यु का कारण" },
    placeOfDeath: { en: "Place of Death", hi: "मृत्यु स्थान" },
    age: { en: "Age", hi: "आयु" },
    fatherOrSpouseName: { en: "Father/Spouse Name", hi: "पिता/पति का नाम" },
    applicantRelation: { en: "Applicant Relation", hi: "आवेदक का संबंध" },
    currentAddress: { en: "Current Address", hi: "वर्तमान पता" },
    permanentAddress: { en: "Permanent Address", hi: "स्थायी पता" },
    residenceSinceYear: { en: "Residence Since", hi: "निवास वर्ष से" },
    tehsil: { en: "Tehsil", hi: "तहसील" },
    village: { en: "Village", hi: "गाँव" },
    occupation: { en: "Occupation", hi: "व्यवसाय" },
    annualIncome: { en: "Annual Income", hi: "वार्षिक आय" },
    sourceOfIncome: { en: "Source of Income", hi: "आय का स्रोत" },
    caste: { en: "Caste", hi: "जाति" },
    subCaste: { en: "Sub-Caste", hi: "उप-जाति" },
    category: { en: "Category", hi: "वर्ग" },
    bankAccountNumber: { en: "Bank Account No.", hi: "बैंक खाता नं." },
    ifscCode: { en: "IFSC Code", hi: "IFSC कोड" },
    bankName: { en: "Bank Name", hi: "बैंक का नाम" },
    branchName: { en: "Branch Name", hi: "शाखा का नाम" },
    husbandName: { en: "Husband's Name", hi: "पति का नाम" },
    dateOfHusbandDeath: { en: "Husband's Death Date", hi: "पति की मृत्यु तिथि" },
    aadhaarNumber: { en: "Aadhaar Number", hi: "आधार नंबर" },
    mobileNumber: { en: "Mobile Number", hi: "मोबाइल नंबर" },
    khasraNumber: { en: "Khasra Number", hi: "खसरा नंबर" },
    landArea: { en: "Land Area", hi: "भूमि क्षेत्रफल" },
    cropType: { en: "Crop Type", hi: "फसल का प्रकार" },
    headOfFamily: { en: "Head of Family", hi: "परिवार का मुखिया" },
    familyMembersCount: { en: "Family Members", hi: "परिवार के सदस्य" },
    gasConnection: { en: "Gas Connection", hi: "गैस कनेक्शन" },
    ward: { en: "Ward", hi: "वार्ड" },
    farmerName: { en: "Farmer Name", hi: "किसान का नाम" },
    serviceType: { en: "Service Type", hi: "सेवा प्रकार" }
  };

  // ─── Utility: Convert Base64 to Blob ───────────────────────
  function base64ToBlob(base64Data, mimeType) {
    const split = base64Data.split(',');
    const b64 = split.length > 1 ? split[1] : split[0];
    const byteCharacters = atob(b64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  }

  // ─── Main Extraction Function ─────────────────────────────

  /**
   * Extract fields from uploaded documents using local Python API.
   *
   * @param {Array} documents       — [{ docType, fileName, base64, mimeType }]
   * @param {Array} fieldsToExtract — ["childName", "fatherName", ...]
   * @param {string} serviceType    — "birth_certificate" etc.
   * @param {Function} onProgress   — callback(stage, message)
   * @returns {Promise<{ extractedFields, crossDocumentMismatches }>}
   */
  async function extractFields(documents, fieldsToExtract, serviceType, onProgress) {
    onProgress = onProgress || (() => {});

    try {
      const uploadedDocs = documents.filter(d => d.base64 && d.mimeType);

      if (uploadedDocs.length === 0) {
        onProgress("no_docs", "कोई दस्तावेज़ नहीं / No documents uploaded");
        return getManualEntryFields(fieldsToExtract);
      }

      onProgress("checking_server", "FileTract सर्वर से कनेक्ट हो रहा है... / Connecting to backend...");

      // ── STEP 1: Check if FileTract backend is running
      try {
        const ping = await fetch(`${API_BASE_URL}/`, { method: "GET" }).catch(() => { throw new Error("Offline") });
        if (!ping.ok) throw new Error("Backend offline");
      } catch (e) {
        console.warn("[ExtractionService] FileTract backend looks offline. Falling back to manual entry.");
        onProgress("error", "⚠️ बैकएंड ऑफ़लाइन — कृपया FileTract/app.py चलाएँ / Backend offline — Please run app.py");
        await new Promise(r => setTimeout(r, 2000));
        return getManualEntryFields(fieldsToExtract);
      }

      // ── STEP 2: Upload Files ──────────────────────────────
      onProgress("uploading", "दस्तावेज़ अपलोड हो रहे हैं... / Uploading documents...");
      
      const formData = new FormData();
      uploadedDocs.forEach((doc, i) => {
        const blob = base64ToBlob(doc.base64, doc.mimeType);
        const filename = doc.fileName || `document_${i}.${doc.mimeType.split('/')[1]}`;
        formData.append("files", blob, filename);
      });

      const uploadResp = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      if (!uploadResp.ok) throw new Error(`Upload failed: ${uploadResp.statusText}`);
      const uploadData = await uploadResp.json();
      
      // Get job IDs (handles both single and multiple responses)
      const jobIds = uploadData.jobs ? uploadData.jobs.map(j => j.job_id) : [uploadData.job_id];
      if (!jobIds || jobIds.length === 0) throw new Error("No Job IDs returned");

      // ── STEP 3: Start Extraction ──────────────────────────
      onProgress("extracting", "AI दस्तावेज़ पढ़ रहा है... / AI reading documents (OCR)...");

      const extractResp = await fetch(`${API_BASE_URL}/api/extract/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_ids: jobIds,
          fields: fieldsToExtract,
          pipeline: "patent" // Use the intelligent patent OCR pipeline
        })
      });

      if (!extractResp.ok) throw new Error(`Extract start failed: ${extractResp.statusText}`);

      // ── STEP 4: Poll for Results ──────────────────────────
      let allResults = [];
      
      for (const jobId of jobIds) {
        let attempts = 0;
        let isComplete = false;
        
        while (!isComplete && attempts < MAX_POLLING_ATTEMPTS) {
          attempts++;
          onProgress("polling", `OCR जारी है... कृपया प्रतीक्षा करें / OCR in progress... (${attempts}s)`);
          
          await new Promise(r => setTimeout(r, POLLING_INTERVAL));
          
          const statusResp = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
          if (!statusResp.ok) continue;
          
          const statusData = await statusResp.json();
          
          if (statusData.status === "complete") {
            const finalResultResp = await fetch(`${API_BASE_URL}/api/result/${jobId}`);
            if (finalResultResp.ok) {
               const finalData = await finalResultResp.json();
               if (finalData.pipeline === "patent" && finalData.results && finalData.results.extracted_fields) {
                 allResults.push(finalData.results.extracted_fields);
               } else if (finalData.results) {
                 allResults.push(finalData.results);
               }
            }
            isComplete = true;
          } else if (statusData.status === "error") {
            console.error(`Job ${jobId} failed:`, statusData.error);
            isComplete = true; // Stop polling this failed job
          }
        }
      }

      if (allResults.length === 0) {
        throw new Error("No successful results from any document (allResults is empty)");
      }

      // ── STEP 5: Merge Results ─────────────────────────────
      onProgress("merging", "जाँच हो रही है... / Merging results...");
      
      const mergedFields = mergeResults(allResults, fieldsToExtract);
      const mismatches = detectMismatches(allResults, fieldsToExtract);

      onProgress("complete", "✅ निष्कर्षण पूरा / Extraction complete");

      return {
        extractedFields: mergedFields,
        crossDocumentMismatches: mismatches
      };

    } catch (error) {
      console.error("[ExtractionService] Extraction error:", error);
      onProgress("error", `⚠️ त्रुटि — ${error.message}`);
      // Wait for user to read the message
      await new Promise(r => setTimeout(r, 4000));
      return getManualEntryFields(fieldsToExtract);
    }
  }

  // ─── Post-Processing ───────────────────────────────────────

  function mergeResults(allResults, fieldsToExtract) {
    const finalFields = {};

    fieldsToExtract.forEach(field => {
      let bestValue = null;
      let highestConf = -1; // -1 allows 0 confidence to win if it's the only one
      let sourceDoc = "unknown";

      // Look across all document results for the best value for this field
      allResults.forEach((docResult, idx) => {
        if (docResult[field] && typeof docResult[field].value === "string" && docResult[field].value.trim() !== "None") {
          // Use blended OCR/LLM confidence from FileTract backend
          let conf = typeof docResult[field].confidence === 'number' 
            ? docResult[field].confidence 
            : typeof docResult[field].ocr_confidence === 'number'
            ? docResult[field].ocr_confidence
            : 0;

          if (conf > highestConf) {
            highestConf = conf;
            bestValue = docResult[field].value;
            sourceDoc = `document_${idx + 1}`;
          }
        }
      });

      finalFields[field] = {
        value: bestValue,
        confidence: Math.max(0, highestConf), // Restore to 0 minimum
        source: sourceDoc
      };
    });

    return finalFields;
  }

  function detectMismatches(allResults, fieldsToExtract) {
    const mismatches = [];

    // Only compare if we have multiple documents
    if (allResults.length < 2) return mismatches;

    fieldsToExtract.forEach(field => {
      // Look for fields that should match across docs (names, IDs)
      if (field.toLowerCase().includes("name") || field.toLowerCase().includes("aadhaar")) {
        
        const values = [];
        allResults.forEach((docResult, idx) => {
          if (docResult[field] && docResult[field].value) {
            values.push({ val: docResult[field].value, doc: `doc_${idx+1}` });
          }
        });

        if (values.length >= 2) {
          const v1 = values[0].val.trim().toLowerCase();
          const v2 = values[1].val.trim().toLowerCase();
          
          if (v1 !== v2) {
             mismatches.push({
               field: field,
               doc1: values[0].doc,
               val1: values[0].val,
               doc2: values[1].doc,
               val2: values[1].val,
               severity: "warning"
             });
          }
        }
      }
    });

    return mismatches;
  }

  // ─── Helpers ───────────────────────────────────────────────

  function getManualEntryFields(fieldsToExtract) {
    const extractedFields = {};
    fieldsToExtract.forEach(f => {
      extractedFields[f] = {
        value: "",
        confidence: 0.0,
        source: "manual"
      };
    });
    return {
      extractedFields,
      crossDocumentMismatches: []
    };
  }

  function getFieldLabel(fieldKey) {
    return FIELD_LABELS[fieldKey] || { en: fieldKey, hi: fieldKey };
  }

  function getConfidenceLevel(confidence) {
    if (confidence >= 0.85) return "high";
    if (confidence >= 0.60) return "medium";
    return "low";
  }

  // ─── Public API ────────────────────────────────────────────
  return {
    extractFields,
    getManualEntryFields,
    getFieldLabel,
    getConfidenceLevel,
    FIELD_LABELS
  };
})();
