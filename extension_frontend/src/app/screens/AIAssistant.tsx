import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Bot, User, Send, FileText, ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';
import { chat } from '../api/chatApi';
import { getAssistantContext } from '../context/assistantContext';
import { useVoiceInput, useTextToSpeech } from '../hooks/useVoiceAssistant';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'नमस्ते! मैं CSC सहायक हूं। मैं आपकी मदद कैसे कर सकता हूं?\n\nHello! I am CSC Assistant. How can I help you today?',
    timestamp: new Date(),
  }
];

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, startListening, stopListening, error: voiceError, supported: voiceSupported } = useVoiceInput();
  const { speak, stopSpeaking, isSpeaking, supported: ttsSupported } = useTextToSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const context = getAssistantContext();
      const response = await chat(trimmed, context);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      // TTS auto-play disabled per user request
    } catch (e) {
      console.warn('[AIAssistant] Chat error:', e);
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'क्षमा करें, कोई त्रुटि हुई। कृपया फिर से कोशिश करें।\n\nSorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  }, [ttsSupported, speak]);

  const handleSend = () => sendText(input);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(
        (transcript) => setInput(transcript),
        // Auto-send when voice input stops
        (finalTranscript) => {
          if (finalTranscript) sendText(finalTranscript);
        }
      );
    }
  };

  const handleSpeakMessage = (content: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Custom Header */}
      <div className="h-14 bg-navy flex items-center justify-between px-4 flex-shrink-0">
        <button
          onClick={() => navigate('/welcome')}
          className="flex items-center gap-2 text-white hover:text-saffron transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-saffron" strokeWidth={2} />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">AI सहायक</div>
            <div className="text-white/60 text-[10px]">Chat & Voice</div>
          </div>
        </div>
        <div className="w-4"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                message.type === 'user'
                  ? 'bg-saffron text-white'
                  : 'bg-surface border border-border-custom text-navy'
              } rounded-lg p-3 shadow-sm`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-white/20'
                        : 'bg-saffron/10'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className={`w-3 h-3 ${message.type === 'user' ? 'text-white' : 'text-saffron'}`} strokeWidth={2} />
                    ) : (
                      <Bot className={`w-3 h-3 ${message.type === 'user' ? 'text-white' : 'text-saffron'}`} strokeWidth={2} />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      message.type === 'user'
                        ? 'text-white/80'
                        : 'text-muted-text'
                    }`}
                  >
                    {message.type === 'user' ? 'You' : 'CSC Assistant'}
                  </span>
                </div>
                {message.type === 'bot' && ttsSupported && (
                  <button
                    onClick={() => handleSpeakMessage(message.content)}
                    className={`p-1 rounded hover:bg-saffron/20 transition-colors ${isSpeaking ? 'text-saffron' : 'text-muted-text'}`}
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Message Content */}
              <div
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  message.type === 'user' ? 'text-white' : 'text-navy'
                }`}
              >
                {message.content}
              </div>

              {/* Timestamp */}
              <div
                className={`text-[9px] mt-1.5 ${
                  message.type === 'user'
                    ? 'text-white/60 text-right'
                    : 'text-muted-text'
                }`}
              >
                {message.timestamp.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="bg-surface border border-border-custom rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-saffron/10 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-saffron" strokeWidth={2} />
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice error */}
      {voiceError && (
        <div className="px-4 py-1 text-xs text-red-600">{voiceError}</div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border-custom bg-slate-50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInput('जन्म प्रमाण पत्र कैसे बनवाएं?')}
            className="px-3 py-1.5 rounded-full bg-white border border-border-custom text-xs font-medium text-navy hover:bg-saffron-light/30 hover:border-saffron transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <FileText className="w-3 h-3" strokeWidth={2} />
            <span>Birth Certificate</span>
          </button>
          <button
            onClick={() => setInput('पेंशन योजना की जानकारी')}
            className="px-3 py-1.5 rounded-full bg-white border border-border-custom text-xs font-medium text-navy hover:bg-saffron-light/30 hover:border-saffron transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <FileText className="w-3 h-3" strokeWidth={2} />
            <span>Pension Scheme</span>
          </button>
          <button
            onClick={() => setInput('राशन कार्ड के लिए आवेदन')}
            className="px-3 py-1.5 rounded-full bg-white border border-border-custom text-xs font-medium text-navy hover:bg-saffron-light/30 hover:border-saffron transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <FileText className="w-3 h-3" strokeWidth={2} />
            <span>Ration Card</span>
          </button>
        </div>
      </div>

      {/* Listening Status */}
      {isListening && (
        <div className="px-4 py-1.5 bg-red-50 border-t border-red-200 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs text-red-600 font-medium">🎙️ सुन रहा है... / Listening...</span>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border-custom bg-white flex-shrink-0">
        <div className="flex gap-2">
          {voiceSupported && (
            <button
              onClick={handleVoiceToggle}
              disabled={isTyping}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-navy'
              }`}
              title={isListening ? 'बंद करें / Stop listening' : 'बोलें / Voice input'}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30"></span>
              )}
              {isListening ? (
                <MicOff className="w-4 h-4 relative z-10" strokeWidth={2} />
              ) : (
                <Mic className="w-4 h-4" strokeWidth={2} />
              )}
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "🎙️ बोलिए... / Speaking..." : voiceSupported ? "सवाल पूछें या माइक दबाएं... / Type or speak..." : "सवाल पूछें... / Type your question..."}
            className="flex-1 h-10 px-3 rounded-md border border-border-custom bg-surface text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
            readOnly={isListening}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isListening}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
              input.trim() && !isTyping && !isListening
                ? 'bg-saffron hover:bg-saffron-hover text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
