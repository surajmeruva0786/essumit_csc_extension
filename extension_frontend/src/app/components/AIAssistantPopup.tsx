import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, X, Minimize2, Maximize2 } from 'lucide-react';

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

const SAMPLE_RESPONSES: Record<string, string> = {
  'birth': 'जन्म प्रमाण पत्र के लिए:\n\n• अस्पताल से जन्म पर्ची अनिवार्य\n• माता-पिता का आधार चाहिए\n• 21 दिन के बाद आवेदन में विलंब शुल्क\n\nकोई और सवाल?',
  'document': 'दस्तावेज़ संबंधी मदद:\n\n1. सभी दस्तावेज़ clear होने चाहिए\n2. File size: Max 5MB\n3. Format: PDF, JPG, PNG\n\nकौन सा दस्तावेज़ upload करने में समस्या है?',
  'aadhaar': 'आधार कार्ड अपलोड करें:\n\n• Front और back दोनों side clear दिखनी चाहिए\n• Name spelling exact match होना चाहिए\n• Old आधार भी मान्य है\n\nक्या आधार scan करने में मदद चाहिए?',
  'fee': 'शुल्क संबंधी जानकारी:\n\n• समय पर आवेदन: ₹50\n• विलंब शुल्क (21 दिन बाद): ₹200\n• Affidavit खर्च: ₹100-150\n\nPayment cash या UPI से ले सकते हैं।',
  'default': 'मैं इनमें मदद कर सकता हूं:\n\n• दस्तावेज़ अपलोड करना\n• फॉर्म भरना\n• शुल्क की जानकारी\n• समय सीमा\n• समस्या समाधान\n\nअपनी समस्या बताएं।'
};

export default function AIAssistantPopup({ isOpen, onClose }: AIAssistantPopupProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('birth') || msg.includes('जन्म')) {
      return SAMPLE_RESPONSES.birth;
    } else if (msg.includes('document') || msg.includes('दस्तावेज़') || msg.includes('upload')) {
      return SAMPLE_RESPONSES.document;
    } else if (msg.includes('aadhaar') || msg.includes('आधार')) {
      return SAMPLE_RESPONSES.aadhaar;
    } else if (msg.includes('fee') || msg.includes('शुल्क') || msg.includes('payment')) {
      return SAMPLE_RESPONSES.fee;
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('नमस्ते') || msg.includes('help')) {
      return 'बिल्कुल! मैं यहाँ आपकी मदद के लिए हूं। आप कोई भी सवाल पूछ सकते हैं।\n\nOf course! I\'m here to help. Feel free to ask any question.';
    }
    
    return SAMPLE_RESPONSES.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
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
              <div className="text-white/60 text-[10px]">मदद के लिए यहाँ हूं</div>
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
                    <div className="flex items-center gap-1.5 mb-1">
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
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="सवाल पूछें..."
                  className="flex-1 h-9 px-2.5 rounded-md border border-border-custom bg-slate-50 text-xs text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                    input.trim() && !isTyping
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