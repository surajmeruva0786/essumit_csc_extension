import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { AshokChakra } from './AshokChakra';

const navItems = [
  { label: 'मुख्य पृष्ठ', labelEn: 'Home', path: '/' },
  { label: 'सेवाएं', labelEn: 'Services', path: '/services' },
  { label: 'नया आवेदन', labelEn: 'New Application', path: '/login' },
  { label: 'आवेदन इतिहास', labelEn: 'History', path: '/app/history' },
  { label: 'डैशबोर्ड', labelEn: 'Dashboard', path: '/app' },
  { label: 'सहायता', labelEn: 'Help', path: '/app/help' },
];

interface GovHeaderProps {
  isLoggedIn?: boolean;
  operatorName?: string;
}

export function GovHeader({ isLoggedIn = false, operatorName = 'राजेश कुमार साहू' }: GovHeaderProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Indian Flag Tricolor Strip */}
      <div className="flex h-2">
        <div className="flex-1" style={{ background: '#FF9933' }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: '#138808' }} />
      </div>

      {/* Top Utility Bar */}
      <div style={{ background: '#274C77' }} className="py-1.5 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-white" style={{ fontSize: '13px' }}>
            <a href="#" className="hover:underline opacity-80 hover:opacity-100">स्क्रीन रीडर</a>
            <span className="opacity-40">|</span>
            <a href="#" className="hover:underline opacity-80 hover:opacity-100">Skip to main content</a>
            <span className="opacity-40">|</span>
            <span className="opacity-70">साइटमैप | Sitemap</span>
          </div>
          <div className="flex items-center gap-3 text-white" style={{ fontSize: '12px' }}>
            <span className="opacity-70">Font Size:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded border border-white/30 text-xs hover:bg-white/20 transition-colors ${fontSize === 'normal' ? 'bg-white/20' : ''}`}
            >A-</button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded border border-white/30 hover:bg-white/20 transition-colors ${fontSize === 'large' ? 'bg-white/20' : ''}`}
              style={{ fontSize: '14px' }}
            >A</button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded border border-white/30 hover:bg-white/20 transition-colors ${fontSize === 'xlarge' ? 'bg-white/20' : ''}`}
              style={{ fontSize: '16px' }}
            >A+</button>
            <span className="opacity-40">|</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-2 py-0.5 rounded border border-white/30 text-xs hover:bg-white/20 transition-colors ${highContrast ? 'bg-white/20' : ''}`}
            >High Contrast</button>
            <span className="opacity-40">|</span>
            <button className="px-2 py-0.5 rounded bg-white/20 border border-white/40 text-xs hover:bg-white/30 transition-colors">हिंदी</button>
            <button className="px-2 py-0.5 rounded border border-white/30 text-xs hover:bg-white/20 transition-colors">English</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b-4" style={{ borderColor: '#E8701A' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-7 flex items-center">
          {/* Left: CG Logo + Title */}
          <Link to="/" className="flex-1 flex items-center gap-4">
            <img
              src="/cg.png"
              alt="Chhattisgarh e-District"
              className="h-24 object-contain"
            />
            <div>
              <p
                style={{
                  fontFamily: "'Noto Sans Devanagari', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1C2B4A',
                  lineHeight: 1.2,
                }}
              >
                छत्तीसगढ़ ई-डिस्ट्रिक्ट
              </p>
              <p style={{ fontSize: '13px', color: '#5A6B85', fontWeight: 500, marginTop: '3px' }}>
                Chhattisgarh e-District
              </p>
            </div>
          </Link>

          {/* Center: Site Title */}
          <div className="flex-1 text-center px-4">
            <div className="text-gray-500 mb-2" style={{ fontSize: '15px', letterSpacing: '0.05em' }}>
              भारत सरकार | Government of India &nbsp;|&nbsp; छत्तीसगढ़ सरकार | Government of Chhattisgarh
            </div>
            <h1
              className="text-[#1C2B4A] leading-tight"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: '38px',
                fontWeight: 700,
              }}
            >
              CSC सहायक
            </h1>
            <p className="text-[#E8701A]" style={{ fontSize: '19px', fontWeight: 600 }}>
              AI-संचालित नागरिक सेवा प्रबंधन प्रणाली
            </p>
            <p className="text-gray-500" style={{ fontSize: '14px' }}>
              AI-Powered Citizen Services Management System
            </p>
          </div>

          {/* Right: National Emblem + NIC */}
          <div className="flex-1 flex items-center gap-6 justify-end">
            <div className="text-center">
              <AshokChakra size={80} color="#003380" />
              <p className="text-[#1C2B4A] mt-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>
                सत्यमेव जयते
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-white px-6 py-3 rounded text-center"
                style={{ background: '#003380', fontSize: '15px' }}
              >
                <div style={{ fontWeight: 700, fontSize: '22px' }}>NIC</div>
                <div className="opacity-80" style={{ fontSize: '13px' }}>राष्ट्रीय सूचना केंद्र</div>
              </div>
              {isLoggedIn && (
                <div className="mt-2 text-right">
                  <span
                    className="text-white px-3 py-1.5 rounded cursor-pointer"
                    style={{ background: '#1A7A38', fontSize: '12px' }}
                  >
                    👤 {operatorName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav style={{ background: '#003380' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <ul className="flex items-center w-full">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path} className="flex-1">
                  <Link
                    to={item.path}
                    className="flex flex-col items-center justify-center w-full py-3 text-white transition-all relative group"
                    style={{ fontSize: '14px' }}
                  >
                    <span
                      style={{
                        fontFamily: "'Noto Sans Devanagari', sans-serif",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#FFD700' : 'white',
                      }}
                    >
                      {item.label}
                    </span>
                    <span className="opacity-60" style={{ fontSize: '11px' }}>{item.labelEn}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8701A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              );
            })}
            {!isLoggedIn ? (
              <li>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-5 py-2.5 mx-2 rounded text-white transition-all"
                  style={{ background: '#E8701A', fontSize: '14px' }}
                >
                  <span style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: 600 }}>लॉगिन करें</span>
                  <span className="opacity-80 text-xs">/ Login</span>
                </Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-5 py-2.5 mx-2 rounded text-white transition-all"
                  style={{ background: '#D93025', fontSize: '13px' }}
                >
                  लॉगआउट / Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Scrolling News Ticker */}
      <div className="flex items-center py-1.5 border-b" style={{ background: '#FFF0E0', borderColor: '#E8701A' }}>
        <div
          className="flex-shrink-0 text-white px-3 py-1 font-semibold mr-3"
          style={{ background: '#E8701A', fontSize: '13px' }}
        >
          📢 सूचना
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="whitespace-nowrap"
            style={{
              animation: 'marquee 30s linear infinite',
              color: '#3D4F6B',
              fontSize: '13px',
            }}
          >
            &nbsp;&nbsp;&nbsp; CSC सहायक v2.0 अब AI-संचालित दस्तावेज़ सत्यापन के साथ उपलब्ध है &nbsp;|&nbsp; 
            नए ऑपरेटर प्रशिक्षण कार्यक्रम 15 अप्रैल 2026 से शुरू होंगे &nbsp;|&nbsp;
            CSC Sahayak v2.0 now available with AI-powered document verification &nbsp;|&nbsp;
            New operator training program starting April 15, 2026 &nbsp;|&nbsp;
            राजनांदगांव जिले में 1,200+ आवेदन सफलतापूर्वक प्रस्तुत किए गए &nbsp;|&nbsp;
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    </header>
  );
}