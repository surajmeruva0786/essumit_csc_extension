const btn = document.getElementById('reqBtn');
const statusEl = document.getElementById('status');
const hintEl = document.getElementById('hint');

btn.addEventListener('click', async () => {
  btn.disabled = true;
  btn.textContent = 'अनुरोध हो रहा है... / Requesting...';
  statusEl.style.display = 'block';
  statusEl.className = 'status waiting';
  statusEl.textContent = '⏳ कृपया ब्राउज़र प्रॉम्प्ट में "Allow" पर क्लिक करें...';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission granted — stop all tracks immediately
    stream.getTracks().forEach(t => t.stop());

    statusEl.className = 'status success';
    statusEl.textContent = '✅ अनुमति मिल गई! / Permission granted!';
    hintEl.textContent = 'यह टैब 2 सेकंड में बंद हो जाएगा... / This tab will close in 2 seconds...';
    btn.style.display = 'none';

    // Notify the extension background
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'MIC_PERMISSION_GRANTED' });
    }

    // Auto-close after a short delay
    setTimeout(() => window.close(), 2000);
  } catch (err) {
    console.error('Mic permission error:', err);
    statusEl.className = 'status error';
    btn.disabled = false;
    btn.textContent = 'पुनः प्रयास करें / Try Again';
    
    if (err.name === 'NotAllowedError') {
      statusEl.textContent = '❌ अनुमति अस्वीकृत / Permission denied';
      hintEl.innerHTML = 'कृपया ब्राउज़र address bar में 🔒 (लॉक) आइकॉन पर क्लिक करके माइक्रोफ़ोन की अनुमति दें, फिर "Try Again" पर क्लिक करें।<br>Please click the 🔒 icon in the address bar to allow microphone access.';
    } else {
      statusEl.textContent = '❌ त्रुटि / Error: ' + err.message;
      hintEl.innerHTML = 'कृपया पुनः प्रयास करें। / Please try again.';
    }
  }
});
