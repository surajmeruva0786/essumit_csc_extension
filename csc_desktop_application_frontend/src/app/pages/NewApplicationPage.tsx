import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, User, Phone, MapPin, MessageCircle, Send, Bot, CheckCircle } from 'lucide-react';
import birthCertIcon from 'figma:asset/54e1443fe5df891a15413b1e4aebff6d95eb3718.png';
import deathCertIcon from 'figma:asset/8a9e6b29ede8826a773fb0dcb8e6617fa6302457.png';
import marriageIcon from 'figma:asset/d0b779d5d6795ed76654bb091d1f6d9cca41fc8c.png';
import residenceIcon from 'figma:asset/a44e4ce4c6fe33679a557ce2f665dd9bed65c373.png';
import farmerIcon from 'figma:asset/be2ab8d5eb8679c506a9c0dc9c2cfb72cb32949e.png';
import pensionIcon from 'figma:asset/3d7d71e3c8d6321c827a3e90a846fe61ddcd1802.png';
import incomeIcon from 'figma:asset/d822c91fd76f62163d7c031b8d1d1fb2f4af683a.png';
import casteIcon from 'figma:asset/56f9c4775c575ee990502a6775ddb39c1d3cc8de.png';

const services = [
  { id: 'birth', emoji: '👶', label: 'जन्म प्रमाण पत्र', labelEn: 'Birth Certificate', docs: 3, days: '7' },
  { id: 'death', emoji: '🕊️', label: 'मृत्यु प्रमाण पत्र', labelEn: 'Death Certificate', docs: 4, days: '7' },
  { id: 'income', emoji: '📄', label: 'आय प्रमाण पत्र', labelEn: 'Income Certificate', docs: 5, days: '10' },
  { id: 'caste', emoji: '🏷️', label: 'जाति प्रमाण पत्र', labelEn: 'Caste Certificate', docs: 6, days: '15' },
  { id: 'residence', emoji: '🏠', label: 'निवास प्रमाण पत्र', labelEn: 'Residence Certificate', docs: 4, days: '10' },
  { id: 'marriage', emoji: '💍', label: 'विवाह पंजीकरण', labelEn: 'Marriage Registration', docs: 7, days: '15' },
  { id: 'farmer', emoji: '🌾', label: 'किसान पंजीकरण', labelEn: 'Farmer Registration', docs: 8, days: '20' },
  { id: 'pension', emoji: ' пен्शन ', label: 'पेंशन स्कीम्स', labelEn: 'Pension Schemes', docs: 9, days: '25' },
];

const chatMessages = [
  { sender: 'bot', text: 'नमस्ते! मैं CSC AI सहायक हूं। आज कौन सी सेवा के लिए आवेदन करना है?' },
  { sender: 'bot', text: 'आवेदन शुरू करने के लिए बाईं तरफ से सेवा चुनें और नागरिक की जानकारी भरें।' },
];

export function NewApplicationPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenAddress, setCitizenAddress] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput };
    const botReply = {
      sender: 'bot',
      text: selectedService
        ? `आपने "${services.find((s) => s.id === selectedService)?.label}" चुना है। आवश्यक दस्तावेज़ अपलोड करने के लिए आगे बढ़ें।`
        : 'कृपया पहले एक सेवा चुनें। फिर मैं आपको आवश्यक दस्तावेज़ों की सूची दूंगा।',
    };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setChatInput('');
  };

  const handleProceed = () => {
    if (!selectedService || !citizenName || !citizenPhone) return;
    navigate('/app/upload');
  };

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[#7A8BA3] mb-1" style={{ fontSize: '13px' }}>
          <span>डैशबोर्ड</span> <ChevronRight size={13} /> <span className="text-[#3D4F6B]">नया आवेदन</span>
        </div>
        <h1 className="text-[#1C2B4A]" style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '26px', fontWeight: 700 }}>
          नया आवेदन | New Application
        </h1>
        <p className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>
          नागरिक की जानकारी भरें और सेवा चुनें। Fill citizen details and select service.
        </p>
      </div>

      {/* Three column layout */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '300px 1fr 320px' }}>

        {/* Left: Citizen Info Panel */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#EEF1F7' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#FFF0E0' }}>
              <User size={16} style={{ color: '#E8701A' }} />
            </div>
            <div>
              <p className="text-[#1C2B4A]" style={{ fontSize: '15px', fontWeight: 600 }}>नागरिक जानकारी</p>
              <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>Citizen Information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#3D4F6B] mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                नागरिक का नाम <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A8BA3]" />
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="जैसे: सुनीता देवी"
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none"
                  style={{ borderColor: '#D8DDE8', fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#3D4F6B] mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                मोबाइल नंबर <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A8BA3]" />
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none"
                  style={{ borderColor: '#D8DDE8', fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#3D4F6B] mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                पता / Address
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-2.5 top-3 text-[#7A8BA3]" />
                <textarea
                  value={citizenAddress}
                  onChange={(e) => setCitizenAddress(e.target.value)}
                  placeholder="ग्राम, पोस्ट, तहसील, जिला..."
                  rows={3}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none resize-none"
                  style={{ borderColor: '#D8DDE8', fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#3D4F6B] mb-1" style={{ fontSize: '13px', fontWeight: 600 }}>
                आधार संख्या (वैकल्पिक)
              </label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX"
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none"
                style={{
                  borderColor: '#D8DDE8',
                  fontSize: '14px',
                  fontFamily: "'Roboto Mono', monospace",
                }}
              />
            </div>

            {/* Selected Service Summary */}
            {selectedService && (
              <div
                className="p-3 rounded-lg border"
                style={{ background: '#E6F5EC', borderColor: '#1A7A38' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} style={{ color: '#1A7A38' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A7A38' }}>
                    चयनित सेवा:
                  </p>
                </div>
                <p className="text-[#1C2B4A] mt-1" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {services.find((s) => s.id === selectedService)?.label}
                </p>
                <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>
                  {services.find((s) => s.id === selectedService)?.docs} दस्तावेज़ आवश्यक •{' '}
                  {services.find((s) => s.id === selectedService)?.days} दिन
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Service Selection + Workflow */}
        <div className="space-y-4">
          {/* Service Grid */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-7 rounded" style={{ background: '#E8701A' }} />
              <div>
                <p className="text-[#1C2B4A]" style={{ fontSize: '17px', fontWeight: 700, fontFamily: "'Baloo 2', sans-serif" }}>
                  सेवा चुनें | Select Service
                </p>
                <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
                  जिस सेवा के लिए आवेदन करना है उसे चुनें
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {services.map((svc) => {
                const isSelected = selectedService === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
                    style={{
                      borderColor: isSelected ? '#1A7A38' : '#D8DDE8',
                      background: isSelected ? '#E6F5EC' : 'white',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {svc.id === 'birth' ? (
                        <img src={birthCertIcon} alt="Birth Certificate" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'death' ? (
                        <img src={deathCertIcon} alt="Death Certificate" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'marriage' ? (
                        <img src={marriageIcon} alt="Marriage Registration" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'residence' ? (
                        <img src={residenceIcon} alt="Residence Certificate" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'farmer' ? (
                        <img src={farmerIcon} alt="Farmer Registration" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'pension' ? (
                        <img src={pensionIcon} alt="Pension Schemes" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'income' ? (
                        <img src={incomeIcon} alt="Income Certificate" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : svc.id === 'caste' ? (
                        <img src={casteIcon} alt="Caste Certificate" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '30px' }}>{svc.emoji}</span>
                      )}
                      {isSelected && <CheckCircle size={18} style={{ color: '#1A7A38' }} />}
                    </div>
                    <p
                      className="text-[#1C2B4A]"
                      style={{
                        fontFamily: "'Noto Sans Devanagari', sans-serif",
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 600,
                      }}
                    >
                      {svc.label}
                    </p>
                    <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>{svc.labelEn}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 rounded text-white"
                        style={{ background: '#7A8BA3', fontSize: '11px' }}
                      >
                        {svc.docs} docs
                      </span>
                      <span style={{ fontSize: '11px', color: '#7A8BA3' }}>{svc.days} days</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
            <p className="text-[#1C2B4A] mb-4" style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'Baloo 2', sans-serif" }}>
              आवेदन प्रक्रिया | Application Workflow
            </p>
            <div className="flex items-center gap-0">
              {[
                { n: 1, label: 'सेवा चयन', active: true, done: false },
                { n: 2, label: 'दस्तावेज़', active: false, done: false },
                { n: 3, label: 'AI निष्कर्षण', active: false, done: false },
                { n: 4, label: 'समीक्षा', active: false, done: false },
                { n: 5, label: 'सत्यापन', active: false, done: false },
                { n: 6, label: 'सबमिट', active: false, done: false },
              ].map((step, i, arr) => (
                <div key={step.n} className="contents">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                      style={{
                        background: step.active ? '#003380' : step.done ? '#1A7A38' : '#EEF1F7',
                        color: step.active || step.done ? 'white' : '#7A8BA3',
                        fontSize: '14px',
                      }}
                    >
                      {step.done ? '✓' : step.n}
                    </div>
                    <p className="text-center mt-1" style={{ fontSize: '11px', color: step.active ? '#003380' : '#7A8BA3' }}>
                      {step.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-0.5 mb-5" style={{ background: '#D8DDE8' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleProceed}
            disabled={!selectedService || !citizenName || !citizenPhone}
            className="w-full py-4 rounded-xl text-white transition-all"
            style={{
              background:
                selectedService && citizenName && citizenPhone
                  ? 'linear-gradient(135deg, #FF9933, #E8701A)'
                  : '#D8DDE8',
              color: selectedService && citizenName && citizenPhone ? 'white' : '#7A8BA3',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            दस्तावेज़ अपलोड करें → Upload Documents
          </button>
        </div>

        {/* Right: AI Chat Panel */}
        <div
          className="rounded-xl border flex flex-col overflow-hidden"
          style={{ borderColor: '#D8DDE8', background: 'white' }}
        >
          <div className="flex items-center gap-2 px-4 py-3.5 border-b" style={{ background: '#1C2B4A', borderColor: '#2D3F5E' }}>
            <Bot size={18} className="text-yellow-400" />
            <div>
              <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>AI सहायक</p>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>AI Assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400" style={{ fontSize: '11px' }}>Active</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: '400px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                    style={{ background: '#1C2B4A' }}
                  >
                    <Bot size={13} className="text-yellow-400" />
                  </div>
                )}
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl"
                  style={{
                    background: msg.sender === 'bot' ? '#EEF1F7' : '#E8701A',
                    color: msg.sender === 'bot' ? '#3D4F6B' : 'white',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    borderRadius: msg.sender === 'bot' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t" style={{ borderColor: '#EEF1F7' }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="प्रश्न पूछें... Ask a question..."
                className="flex-1 px-3 py-2.5 border rounded-lg focus:outline-none"
                style={{ borderColor: '#D8DDE8', fontSize: '13px' }}
              />
              <button
                onClick={sendMessage}
                className="p-2.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{ background: '#003380' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}