const fs = require('fs');

async function testGroq() {
  const GROQ_API_KEY = "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";
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  const MODELS_TO_TEST = [
    "llama-3.2-11b-vision-preview",
    "llama-3.2-90b-vision-preview"
  ];

  // 1x1 white pixel in base64
  const testBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

  for (const model of MODELS_TO_TEST) {
    console.log(`\nTesting model: ${model}...`);
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "What is this image?" },
                { type: "image_url", image_url: { url: testBase64 } }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 100
        })
      });

      const text = await response.text();
      console.log(`HTTP ${response.status}: ${text}`);
    } catch (e) {
      console.log("Network Error:", e);
    }
  }
}

testGroq();
