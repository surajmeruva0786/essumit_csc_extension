import React from 'react';
import { Link } from 'react-router';
import { CheckCircle, FilePlus, Clock, Copy } from 'lucide-react';
import { AshokChakra } from '../components/AshokChakra';

const refId = 'REF2026031443';

export function SuccessPage() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(refId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #EEF1F7 0%, #E8EDF5 100%)',
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      }}
    >
      <div className="w-full max-w-xl">
        {/* Main Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
          {/* Success Header */}
          <div
            className="px-8 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #1A7A38, #2E9E50)' }}
          >
            {/* Animated circles */}
            <div className="relative flex justify-center mb-5">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)', width: '72px', height: '72px' }}
                >
                  <CheckCircle size={40} className="text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 opacity-30">
                <AshokChakra size={50} color="white" />
              </div>
            </div>

            <h2
              className="text-white mb-1"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '24px', fontWeight: 800 }}
            >
              आवेदन सफलतापूर्वक सबमिट हो गया!
            </h2>
            <p className="text-green-100" style={{ fontSize: '14px' }}>
              Application Submitted Successfully
            </p>
          </div>

          {/* Reference ID */}
          <div className="px-8 py-6 border-b" style={{ borderColor: '#EEF1F7' }}>
            <p className="text-center text-[#7A8BA3] mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
              संदर्भ संख्या | Reference Number
            </p>
            <div
              className="flex items-center justify-between p-4 rounded-xl border-2"
              style={{
                background: '#EEF4FF',
                borderColor: '#003380',
                borderStyle: 'dashed',
              }}
            >
              <span
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#003380',
                  letterSpacing: '0.05em',
                }}
              >
                {refId}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all"
                style={{
                  background: copied ? '#1A7A38' : '#003380',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                {copied ? 'कॉपी!' : 'कॉपी'}
              </button>
            </div>
            <p className="text-center text-[#7A8BA3] mt-2" style={{ fontSize: '12px' }}>
              इस नंबर को नागरिक के साथ साझा करें। Share this with the citizen.
            </p>
          </div>

          {/* Application Details */}
          <div className="px-8 py-5 border-b" style={{ borderColor: '#EEF1F7' }}>
            <p className="text-[#1C2B4A] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>
              आवेदन विवरण | Application Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'नागरिक का नाम', value: 'सुनीता देवी', en: 'Citizen Name' },
                { label: 'सेवा', value: 'जन्म प्रमाण पत्र', en: 'Service' },
                { label: 'सबमिट तिथि', value: '14 मार्च 2026', en: 'Submission Date' },
                { label: 'अनुमानित समय', value: '7 कार्य दिवस', en: 'Expected Time' },
                { label: 'ऑपरेटर ID', value: 'OP-4521', en: 'Operator ID' },
                { label: 'CSC केंद्र', value: 'राजनांदगांव', en: 'CSC Center' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[#7A8BA3]" style={{ fontSize: '11px' }}>
                    {item.label} | {item.en}
                  </p>
                  <p className="text-[#1C2B4A]" style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="px-8 py-5 border-b" style={{ borderColor: '#EEF1F7' }}>
            <p className="text-[#1C2B4A] mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>
              📋 अगले चरण | Next Steps
            </p>
            <div className="space-y-3">
              {[
                { step: '✅ सबमिट', desc: 'आवेदन सफलतापूर्वक सबमिट हुआ', done: true },
                { step: '🔍 सत्यापन', desc: 'अधिकारी दस्तावेज़ जांच करेंगे (1-2 दिन)', done: false },
                { step: '✍️ अनुमोदन', desc: 'सक्षम अधिकारी द्वारा अनुमोदन (3-5 दिन)', done: false },
                { step: '📜 जारी', desc: 'डिजिटल प्रमाण पत्र जारी (7 दिन)', done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: s.done ? '#1A7A38' : '#EEF1F7',
                      color: s.done ? 'white' : '#7A8BA3',
                      fontSize: '13px',
                    }}
                  >
                    {s.done ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className="text-[#1C2B4A]" style={{ fontSize: '14px', fontWeight: 600 }}>{s.step}</p>
                    <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/app/new"
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF9933, #E8701A)', fontSize: '15px', fontWeight: 600 }}
              >
                <FilePlus size={17} />
                नया आवेदन | New App
              </Link>
              <Link
                to="/app/history"
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all hover:bg-gray-50"
                style={{ borderColor: '#003380', color: '#003380', fontSize: '15px', fontWeight: 600 }}
              >
                <Clock size={17} />
                इतिहास देखें | History
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[#7A8BA3] mt-4" style={{ fontSize: '13px' }}>
          Powered by <strong className="text-[#1C2B4A]">CHIPS Chhattisgarh</strong> | CSC सहायक
        </p>
      </div>
    </div>
  );
}