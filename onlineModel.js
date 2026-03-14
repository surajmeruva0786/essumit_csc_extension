// onlineModel.js
// Lightweight online-learning rejection predictor using TensorFlow.js.
// Focused on birth_certificate as an example service.

(() => {
  "use strict";

  const STORAGE_KEY = "onlineModel_birth_certificate";

  let model = null;
  let isLoaded = false;

  function log(...args) {
    console.log("[OnlineModel]", ...args);
  }

  function buildModel() {
    if (typeof tf === "undefined") {
      console.warn("[OnlineModel] TensorFlow.js not loaded");
      return null;
    }
    const m = tf.sequential();
    // 6 input features
    m.add(tf.layers.dense({ units: 16, activation: "relu", inputShape: [6] }));
    m.add(tf.layers.dense({ units: 8, activation: "relu" }));
    m.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
    m.compile({
      optimizer: tf.train.adam(0.001),
      loss: "binaryCrossentropy"
    });
    return m;
  }

  async function loadModel() {
    if (isLoaded) return model;
    if (typeof tf === "undefined") return null;

    try {
      const stored = await new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEY, (items) => resolve(items[STORAGE_KEY] || null));
      });
      model = buildModel();
      if (model && stored && stored.weights) {
        const tensors = stored.weights.map(w => tf.tensor(w.data, w.shape));
        model.setWeights(tensors);
        tensors.forEach(t => t.dispose());
        log("Loaded model weights from storage");
      } else {
        log("Initialized fresh model");
      }
      isLoaded = true;
    } catch (e) {
      console.warn("[OnlineModel] loadModel error", e);
      model = buildModel();
      isLoaded = true;
    }
    return model;
  }

  async function persistModel() {
    if (!model || typeof tf === "undefined") return;
    try {
      const weights = model.getWeights();
      const serializable = [];
      for (const w of weights) {
        const data = await w.data();
        serializable.push({ shape: w.shape, data: Array.from(data) });
      }
      await new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: { weights: serializable } }, () => resolve());
      });
      log("Persisted model weights");
    } catch (e) {
      console.warn("[OnlineModel] persistModel error", e);
    }
  }

  // ---- Feature extraction for birth_certificate ----

  function parseDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  function daysSince(dateStr) {
    const d = parseDate(dateStr);
    if (!d) return 0;
    const ms = Date.now() - d.getTime();
    return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  }

  function bucketIncome(val) {
    const n = Number(val || 0);
    if (!isFinite(n) || n <= 0) return 0;
    if (n < 100000) return 1;
    if (n < 300000) return 2;
    if (n < 800000) return 3;
    return 4;
  }

  function extractFeaturesFromSession(session) {
    const fields = session.extractedFields || {};
    const conf = session.confidenceScores || {};
    const ai = session.aiValidationResult || {};

    const dateOfBirth = fields.dateOfBirth || fields.dob || null;
    const annualIncome = fields.annualIncome || fields.income || fields.IncomeAmount || null;

    const dsb = daysSince(dateOfBirth);
    const docCount = Array.isArray(ai.supportingDocuments) ? ai.supportingDocuments.length : 1;

    let sumConf = 0;
    let countConf = 0;
    Object.keys(conf).forEach(k => {
      const v = Number(conf[k]);
      if (isFinite(v)) {
        sumConf += v;
        countConf++;
      }
    });
    const avgConf = countConf > 0 ? sumConf / countConf : 0.5;

    const issues = Array.isArray(ai.issues) ? ai.issues : [];
    const hasMismatch = issues.some(i =>
      /mismatch|अंतर/i.test(i.message || "") || /mismatch|अंतर/i.test(i.messageHindi || "")
    ) ? 1 : 0;

    const lateRegistration = dsb > 21 ? 1 : 0;
    const incomeBucket = bucketIncome(annualIncome);

    // [days_since_birth, document_count, avg_confidence_score, has_mismatch, late_registration, income_range_encoded]
    return [dsb, docCount, avgConf, hasMismatch, lateRegistration, incomeBucket];
  }

  async function predictRejectionProbability(session) {
    const m = await loadModel();
    if (!m || typeof tf === "undefined") return 0.0;
    const features = extractFeaturesFromSession(session);
    const input = tf.tensor2d([features]);
    const out = m.predict(input);
    const prob = (await out.data())[0];
    tf.dispose([input, out]);
    return prob;
  }

  async function updateWithOutcome(session, outcome) {
    if (!outcome) return;
    const m = await loadModel();
    if (!m || typeof tf === "undefined") return;

    const label = outcome === "REJECTED" ? 1 : 0;
    const features = extractFeaturesFromSession(session);
    const xs = tf.tensor2d([features]);
    const ys = tf.tensor2d([[label]]);
    try {
      await m.fit(xs, ys, { epochs: 3, batchSize: 1, verbose: 0 });
      await persistModel();
      log("Online update applied", { outcome });
    } catch (e) {
      console.warn("[OnlineModel] updateWithOutcome error", e);
    } finally {
      tf.dispose([xs, ys]);
    }
  }

  async function getFlattenedWeights() {
    const m = await loadModel();
    if (!m || typeof tf === "undefined") return null;
    const weights = m.getWeights();
    const arrays = [];
    for (const w of weights) {
      const data = await w.data();
      arrays.push(...data);
    }
    return new Float32Array(arrays);
  }

  const api = {
    predictRejectionProbability,
    updateWithOutcome,
    getFlattenedWeights
  };

  if (typeof window !== "undefined") {
    window.OnlineModel = api;
  }
})();

