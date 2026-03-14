import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User, Send, X, Minimize2, Maximize2, Mic, MicOff, Volume2 } from 'lucide-react';
import { chat } from '../api/chatApi';
import { getAssistantContext } from '../context/assistantContext';
import { useVoiceInput, useTextToSpeech } from '../hooks/useVoiceAssistant';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface AIAssistantPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'नमस्ते! मैं CSC सहायक हूं। आवेदन भरते समय कोई समस्या है?\n\nHello! I am CSC Assistant. Need help with the application?',
    timestamp: new Date(),
  }
];

export default function AIAssistantPopup({ isOpen, onClose }: AIAssistantPopupProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
      // TTS auto-play disabled as per user request
    } catch (e) {
      console.warn('[AIAssistantPopup] Chat error:', e);
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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed right-4 bottom-4 w-[360px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border-2 border-saffron transition-all ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}
      >
        {/* Header */}
        <div className="h-14 bg-navy flex items-center justify-between px-4 flex-shrink-0 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-saffron" strokeWidth={2} />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">AI सहायक</div>
              <div className="text-white/60 text-[10px]">Chat & Voice</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" strokeWidth={2} />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" strokeWidth={2} />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.type === 'user'
                        ? 'bg-saffron text-white'
                        : 'bg-white border border-border-custom text-navy'
                    } rounded-lg p-2.5 shadow-sm`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            message.type === 'user'
                              ? 'bg-white/20'
                              : 'bg-saffron/10'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <User className={`w-2.5 h-2.5 ${message.type === 'user' ? 'text-white' : 'text-saffron'}`} strokeWidth={2} />
                          ) : (
                            <Bot className={`w-2.5 h-2.5 ${message.type === 'user' ? 'text-white' : 'text-saffron'}`} strokeWidth={2} />
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-semibold ${
                            message.type === 'user'
                              ? 'text-white/80'
                              : 'text-muted-text'
                          }`}
                        >
                          {message.type === 'user' ? 'You' : 'सहायक'}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div
                      className={`text-xs leading-relaxed whitespace-pre-line ${
                        message.type === 'user' ? 'text-white' : 'text-navy'
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-[8px] mt-1 ${
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
                <div className="mb-3 flex justify-start">
                  <div className="bg-white border border-border-custom rounded-lg p-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-saffron/10 flex items-center justify-center">
                        <Bot className="w-2.5 h-2.5 text-saffron" strokeWidth={2} />
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice error */}
            {voiceError && (
              <div className="px-3 py-1 text-[10px] text-red-600">{voiceError}</div>
            )}

            {/* Listening Status */}
            {isListening && (
              <div className="px-3 py-1.5 bg-red-50 border-t border-red-200 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] text-red-600 font-medium">🎙️ सुन रहा है... / Listening...</span>
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="px-3 py-2 border-t border-border-custom bg-white">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setInput('दस्तावेज़ कैसे upload करें?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-medium text-navy hover:bg-saffron-light/30 transition-colors whitespace-nowrap"
                >
                  Upload Help
                </button>
                <button
                  onClick={() => setInput('शुल्क कितना है?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-medium text-navy hover:bg-saffron-light/30 transition-colors whitespace-nowrap"
                >
                  Fee Info
                </button>
                <button
                  onClick={() => setInput('आधार की समस्या')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-medium text-navy hover:bg-saffron-light/30 transition-colors whitespace-nowrap"
                >
                  Aadhaar Issue
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="px-3 py-2.5 border-t border-border-custom bg-white flex-shrink-0 rounded-b-lg">
              <div className="flex gap-2">
                {voiceSupported && (
                  <button
                    onClick={handleVoiceToggle}
                    disabled={isTyping}
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                        : 'bg-slate-100 hover:bg-slate-200 text-navy'
                    }`}
                    title={isListening ? 'बंद करें / Stop' : 'बोलें / Voice input'}
                  >
                    {isListening && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30"></span>
                    )}
                    {isListening ? (
                      <MicOff className="w-3.5 h-3.5 relative z-10" strokeWidth={2} />
                    ) : (
                      <Mic className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                  </button>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "🎙️ बोलिए..." : voiceSupported ? "सवाल पूछें या माइक..." : "सवाल पूछें..."}
                  className="flex-1 h-9 px-2.5 rounded-md border border-border-custom bg-slate-50 text-xs text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                  readOnly={isListening}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || isListening}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                    input.trim() && !isTyping && !isListening
                      ? 'bg-saffron hover:bg-saffron-hover text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
