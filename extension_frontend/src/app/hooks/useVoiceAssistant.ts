// useVoiceAssistant.ts - Speech-to-text and Text-to-speech for AI chat
// Handles Chrome extension side panel microphone permission issues

import { useState, useCallback, useRef } from 'react';

// --- Web Speech API type shims (not in all TS libs) ---
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

// Declare chrome as a global (available at runtime in the extension)
declare const chrome: {
  tabs?: { create: (opts: { url: string; active: boolean }, cb?: (tab: any) => void) => void };
  runtime?: {
    lastError?: { message?: string };
    getURL: (path: string) => string;
    sendMessage: (msg: unknown) => void;
    onMessage: {
      addListener: (cb: (msg: { type?: string }) => void) => void;
      removeListener: (cb: (msg: { type?: string }) => void) => void;
    };
  };
};

const SpeechRecognitionAPI: SpeechRecognitionConstructor | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, unknown>).SpeechRecognition as SpeechRecognitionConstructor | undefined) ||
      ((window as unknown as Record<string, unknown>).webkitSpeechRecognition as SpeechRecognitionConstructor | undefined)
    : undefined;

/**
 * Request microphone permission. In Chrome extension side panels the
 * browser permission prompt never appears, so when getUserMedia fails we
 * open a helper tab (`mic_permission.html`) where Chrome CAN show the
 * prompt. Once the user grants access there, the permission carries over
 * to the entire extension origin including the side panel.
 */
async function ensureMicPermission(): Promise<boolean | string> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("navigator.mediaDevices.getUserMedia not available");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch (err: any) {
    console.error("Mic permission error:", err);
    // Permission not granted — open the helper page in a new tab
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
      return new Promise<boolean | string>((resolve) => {
        try {
          const permUrl = chrome.runtime!.getURL('mic_permission.html');
          chrome.tabs!.create({ url: permUrl, active: true }, () => {
            if (chrome.runtime!.lastError) {
              resolve("Tab creation failed: " + chrome.runtime!.lastError.message);
            }
          });

          // Listen for success message from the helper page
          const listener = (msg: { type?: string }) => {
            if (msg.type === 'MIC_PERMISSION_GRANTED') {
              chrome.runtime!.onMessage.removeListener(listener);
              resolve(true);
            }
          };
          chrome.runtime!.onMessage.addListener(listener);

          // Timeout after 60 seconds
          setTimeout(() => {
            chrome.runtime!.onMessage.removeListener(listener);
            resolve(false); // Silent fail on timeout, user might have just ignored it
          }, 60_000);
        } catch (e: any) {
          resolve("Extension API Exception: " + e.message);
        }
      });
    }
    
    // If we get here, chrome APIs are missing
    let diag = "N/A";
    try {
      diag = typeof chrome !== 'undefined' ? Object.keys(chrome).join(', ') : 'undefined';
    } catch (e) {}
    return "Chrome APIs missing. typeof chrome: " + typeof chrome + " | keys: " + diag;
  }
}

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(
    async (
      onResult: (transcript: string) => void,
      onEnd?: (finalTranscript: string) => void
    ) => {
      if (!SpeechRecognitionAPI) {
        setError('Voice input is not supported in this browser. Please use Chrome.');
        return;
      }
      setError(null);

      // ─── Ensure microphone permission first ───
      const permResult = await ensureMicPermission();
      if (permResult !== true) {
        if (typeof permResult === 'string') {
          setError(`अनुमति त्रुटि (Permission Error): ${permResult}`);
        } else {
          setError('माइक्रोफ़ोन की अनुमति दें / Please grant microphone permission in the new tab and try again.');
        }
        return;
      }

      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Hindi (India) - also recognises English mixed in

        let accumulated = '';
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulated += transcript;
            } else {
              interim = transcript;
            }
          }
          const text = (accumulated + interim).trim();
          if (text) onResult(text);
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
          // Pass the final accumulated text so callers can auto-send
          onEnd?.(accumulated.trim());
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
          if (e.error !== 'aborted' && e.error !== 'no-speech') {
            if (e.error === 'not-allowed') {
              setError('माइक्रोफ़ोन की अनुमति नहीं मिली / Microphone permission denied. Click mic again to retry.');
            } else {
              setError(`Voice error: ${e.error}`);
            }
          }
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } catch {
        setError('Could not start voice input');
        setIsListening(false);
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const supported = !!SpeechRecognitionAPI;

  return { isListening, startListening, stopListening, error, supported };
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, lang = 'hi-IN') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const supported = typeof window !== 'undefined' && !!window.speechSynthesis;

  return { speak, stopSpeaking, isSpeaking, supported };
}
