import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';
import { AshokChakra } from '../components/AshokChakra';
import bannerImg from 'figma:asset/ff09e3e590edd9910d68b0496ed82e2fbc7fddf3.png';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [operatorId, setOperatorId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 1200));
    if (operatorId === 'OP-4521' || operatorId.length > 0) {
      navigate('/app');
    } else {
      setError('अमान्य ऑपरेटर ID या पासवर्ड। कृपया पुनः प्रयास करें।');
    }
    setLoading(false);
  };

  return (
    <div
      className="flex"
      style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif", minHeight: 'calc(100vh - 200px)' }}
    >
      {/* Left Panel */}
      <div
        className="flex-1 flex flex-col justify-center items-center p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003380 0%, #1C2B4A 60%, #142038 100%)' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-6 gap-8 p-8">
            {Array.from({ length: 30 }, (_, i) => (
              <AshokChakra key={i} size={60} color="white" />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="flex justify-center mb-6">
            <AshokChakra size={90} color="#FFD700" />
          </div>

          <h1
            className="text-white mb-2"
            style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '36px', fontWeight: 800 }}
          >
            CSC सहायक
          </h1>
          <p className="text-yellow-300 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
            AI-संचालित नागरिक सेवा प्रणाली
          </p>
          <p className="text-gray-400 mb-8" style={{ fontSize: '14px' }}>
            AI-Powered Citizen Service Management Platform
          </p>

          {/* Banner preview */}
          <div className="rounded-xl overflow-hidden shadow-2xl mb-6">
            <img src={bannerImg} alt="लोक सेवा केंद्र" className="w-full object-cover" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: '70-90', l: 'प्रतिदिन आवेदन', sub: 'Apps/Day' },
              { n: '99.2%', l: 'सफलता दर', sub: 'Success Rate' },
              { n: '< 60s', l: 'प्रति स्क्रीन', sub: 'Per Screen' },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 rounded-lg p-3">
                <p
                  className="text-yellow-400"
                  style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '22px', fontWeight: 700 }}
                >
                  {s.n}
                </p>
                <p className="text-white" style={{ fontSize: '12px', fontWeight: 600 }}>{s.l}</p>
                <p className="text-gray-400" style={{ fontSize: '11px' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div
        className="w-full max-w-lg flex flex-col justify-center p-10"
        style={{ background: '#F4F6FA' }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 border" style={{ borderColor: '#D8DDE8' }}>
          {/* Header */}
          <div className="text-center mb-7">
            <div
              className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #003380, #1C2B4A)', width: '72px', height: '72px' }}
            >
              <Shield size={36} className="text-white" />
            </div>
            <h2
              className="text-[#1C2B4A]"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '26px', fontWeight: 700 }}
            >
              ऑपरेटर लॉगिन
            </h2>
            <p className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>
              Operator Login | CSC सहायक
            </p>
          </div>

          {/* Breadcrumb-like info */}
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-6"
            style={{ background: '#FFF0E0', border: '1px solid #E8701A33' }}
          >
            <Shield size={15} className="text-orange-600 flex-shrink-0" />
            <p className="text-orange-700" style={{ fontSize: '13px' }}>
              यह एक सुरक्षित सरकारी पोर्टल है। केवल अधिकृत CSC ऑपरेटर ही लॉगिन करें।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Operator ID */}
            <div>
              <label
                className="block text-[#3D4F6B] mb-1.5"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                ऑपरेटर ID <span className="text-red-500">*</span>
                <span className="text-[#7A8BA3] ml-2 font-normal">Operator ID</span>
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8BA3]" />
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="जैसे: OP-4521 | e.g., OP-4521"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: '#D8DDE8',
                    fontSize: '15px',
                    color: '#3D4F6B',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#003380')}
                  onBlur={(e) => (e.target.style.borderColor = '#D8DDE8')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-[#3D4F6B] mb-1.5"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                पासवर्ड <span className="text-red-500">*</span>
                <span className="text-[#7A8BA3] ml-2 font-normal">Password</span>
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8BA3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: '#D8DDE8',
                    fontSize: '15px',
                    color: '#3D4F6B',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#003380')}
                  onBlur={(e) => (e.target.style.borderColor = '#D8DDE8')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8BA3] hover:text-[#3D4F6B]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Captcha */}
            <div>
              <label className="block text-[#3D4F6B] mb-1.5" style={{ fontSize: '14px', fontWeight: 600 }}>
                कैप्चा <span className="text-red-500">*</span>
                <span className="text-[#7A8BA3] ml-2 font-normal">Captcha</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 flex items-center justify-center py-2.5 rounded-lg border select-none"
                  style={{
                    background: 'linear-gradient(135deg, #EEF1F7, #D8DDE8)',
                    borderColor: '#D8DDE8',
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: '20px',
                    letterSpacing: '0.3em',
                    color: '#1C2B4A',
                    textDecoration: 'line-through',
                    userSelect: 'none',
                  }}
                >
                  X4K9P2
                </div>
                <input
                  type="text"
                  placeholder="कैप्चा दर्ज करें"
                  className="flex-1 py-3 px-3 border rounded-lg focus:outline-none"
                  style={{ borderColor: '#D8DDE8', fontSize: '15px' }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ background: '#FEF2F2', border: '1px solid #D93025' }}
              >
                <span className="text-red-600 mt-0.5">⚠️</span>
                <p className="text-red-700" style={{ fontSize: '14px' }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-70"
              style={{
                background: loading ? '#7A8BA3' : 'linear-gradient(135deg, #003380, #1C2B4A)',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AshokChakra size={18} color="white" animated />
                  सत्यापित हो रहा है... Verifying...
                </span>
              ) : (
                'लॉगिन करें | Login'
              )}
            </button>

            <div className="text-center">
              <a href="#" className="text-[#003380] hover:underline" style={{ fontSize: '14px' }}>
                पासवर्ड भूल गए? | Forgot Password?
              </a>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>
            Powered by{' '}
            <span className="text-[#1C2B4A] font-semibold">CHIPS Chhattisgarh</span>
            {' '}| NIC India
          </p>
          <p className="text-[#7A8BA3] mt-1" style={{ fontSize: '12px' }}>
            यह एक सरकारी वेबसाइट है। This is an official Government website.
          </p>
        </div>
      </div>
    </div>
  );
}