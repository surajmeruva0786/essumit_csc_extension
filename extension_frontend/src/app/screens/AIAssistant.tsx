import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bot, User, Send, FileText, ArrowLeft } from 'lucide-react';

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

const SAMPLE_RESPONSES: Record<string, string> = {
  'birth': 'जन्म प्रमाण पत्र के लिए आवश्यक दस्तावेज़:\n\n1. अस्पताल से जन्म पर्ची\n2. माता-पिता का आधार कार्ड\n3. पता प्रमाण\n4. पासपोर्ट साइज फोटो\n\nक्या आप आवेदन शुरू करना चाहेंगे?',
  'pension': 'पेंशन योजना के लिए पात्रता:\n\n• वृद्धावस्था पेंशन: 60+ वर्ष\n• विधवा पेंशन: 18-60 वर्ष\n• दिव्यांग पेंशन: 40% विकलांगता\n\nआवश्यक दस्तावेज़: आधार, बैंक पासबुक, आय प्रमाण पत्र\n\nकौन सी पेंशन योजना चाहिए?',
  'ration': 'राशन कार्ड आवेदन प्रक्रिया:\n\n1. ऑनलाइन/ऑफलाइन आवेदन करें\n2. आवश्यक दस्तावेज़ जमा करें\n3. सत्यापन की प्रतीक्षा करें\n4. 15-30 दिनों में राशन कार्ड\n\nआवश्यक दस्तावेज़: आधार, निवास प्रमाण, आय प्रमाण, फोटो',
  'default': 'मैं इन सेवाओं में मदद कर सकता हूं:\n\n• जन्म/मृत्यु प्रमाण पत्र\n• आय/जाति प्रमाण पत्र\n• पेंशन योजनाएं\n• राशन कार्ड\n• अन्य सरकारी सेवाएं\n\nकृपया अपनी आवश्यकता बताएं।'
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    } else if (msg.includes('pension') || msg.includes('पेंशन')) {
      return SAMPLE_RESPONSES.pension;
    } else if (msg.includes('ration') || msg.includes('राशन')) {
      return SAMPLE_RESPONSES.ration;
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('नमस्ते')) {
      return 'नमस्ते! मैं आपकी सहायता के लिए यहाँ हूँ। कृपया अपना प्रश्न पूछें।\n\nHello! I\'m here to help you. Please ask your question.';
    } else if (msg.includes('application') || msg.includes('आवेदन')) {
      return 'आवेदन शुरू करने के लिए:\n\n1. ऊपर "Back" बटन दबाएं\n2. "नया आवेदन शुरू करें" चुनें\n3. अपनी जानकारी भरें\n\nया यहाँ अपनी समस्या बताएं, मैं मदद करूँगा।';
    }
    
    return SAMPLE_RESPONSES.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
          onClick={() => navigate('/')}
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
            <div className="text-white/60 text-[10px]">Always available</div>
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
              <div className="flex items-center gap-2 mb-1.5">
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

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border-custom bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="अपना सवाल पूछें... Type your question..."
            className="flex-1 h-10 px-3 rounded-md border border-border-custom bg-surface text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
              input.trim() && !isTyping
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