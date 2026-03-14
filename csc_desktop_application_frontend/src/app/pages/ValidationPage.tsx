import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronRight, AlertTriangle, XCircle, CheckCircle, Info, Check, X } from 'lucide-react';
import { AshokChakra } from '../components/AshokChakra';

const issues = [
  {
    severity: 'high',
    issue: 'आय दस्तावेज़ में विसंगति',
    issueEn: 'Income Document Mismatch',
    detail: 'राशन कार्ड में दर्ज आय (₹80,000) और प्रमाण पत्र की दावा (₹1,20,000) में अंतर है।',
    recommendation: 'नागरिक से नवीनतम आय प्रमाण दस्तावेज़ प्राप्त करें।',
  },
  {
    severity: 'medium',
    issue: 'पता सत्यापन आवश्यक',
    issueEn: 'Address Verification Required',
    detail: 'आधार कार्ड का पता और आवेदन पता में मामूली अंतर है।',
    recommendation: 'नागरिक से नवीनतम निवास प्रमाण प्राप्त करें।',
  },
  {
    severity: 'low',
    issue: 'दस्तावेज़ गुणवत्ता',
    issueEn: 'Document Quality',
    detail: 'राशन कार्ड की स्कैन गुणवत्ता कम है। कुछ विवरण अस्पष्ट हैं।',
    recommendation: 'बेहतर गुणवत्ता में पुनः स्कैन करें।',
  },
];

const severityConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ReactNode }> = {
  high: {
    color: '#D93025',
    bg: '#FEECEC',
    border: '#D93025',
    label: 'उच्च जोखिम',
    icon: <XCircle size={16} />,
  },
  medium: {
    color: '#E8A020',
    bg: '#FFF8E0',
    border: '#E8A020',
    label: 'मध्यम जोखिम',
    icon: <AlertTriangle size={16} />,
  },
  low: {
    color: '#1A7A38',
    bg: '#E6F5EC',
    border: '#1A7A38',
    label: 'कम जोखिम',
    icon: <Info size={16} />,
  },
};

const riskScore = 72;

export function ValidationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirming, setConfirming] = useState(false);
  
  const reviewData = location.state?.reviewData || [];

  const handleFinalSubmit = async (status: string) => {
    setConfirming(true);
    
    try {
      // Find applicant name from data
      const nameField = reviewData.find((f: any) => f.field === 'आवेदक का नाम' || f.fieldEn === 'Applicant Name');
      const applicantName = nameField ? nameField.extracted : 'अज्ञात (Unknown)';
      
      const payload = {
        id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: applicantName,
        type: 'जन्म प्रमाण पत्र',
        date: new Date().toISOString().split('T')[0],
        status: status,
        data_json: JSON.stringify(reviewData)
      };

      const res = await fetch('http://127.0.0.1:5000/api/desktop/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save to SQLite");

      setTimeout(() => navigate('/app/success'), 1500);
    } catch (e) {
      console.error(e);
      alert("Error saving data. Make sure Python backend is running.");
      setConfirming(false);
    }
  };

  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  const riskLabels: Record<string, { label: string; labelEn: string; color: string }> = {
    high: { label: 'उच्च जोखिम', labelEn: 'High Risk', color: '#D93025' },
    medium: { label: 'मध्यम जोखिम', labelEn: 'Medium Risk', color: '#E8A020' },
    low: { label: 'कम जोखिम', labelEn: 'Low Risk', color: '#1A7A38' },
  };

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[#7A8BA3] mb-1" style={{ fontSize: '12px' }}>
          <span>डैशबोर्ड</span> <ChevronRight size={12} />
          <span>नया आवेदन</span> <ChevronRight size={12} />
          <span className="text-[#3D4F6B]">AI सत्यापन</span>
        </div>
        <h1 className="text-[#1C2B4A]" style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '24px', fontWeight: 700 }}>
          AI जोखिम सत्यापन | AI Risk Validation
        </h1>
        <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
          AI-आधारित पात्रता और जोखिम विश्लेषण परिणाम
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          {/* Risk Score Card */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: riskLevel === 'high' ? '#FEECEC' : riskLevel === 'medium' ? '#FFF8E0' : '#E6F5EC',
              borderColor: riskLabels[riskLevel].color,
              borderWidth: '2px',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} style={{ color: riskLabels[riskLevel].color }} />
                  <span
                    className="px-3 py-1 rounded-full text-white"
                    style={{ background: riskLabels[riskLevel].color, fontSize: '14px', fontWeight: 700 }}
                  >
                    {riskLabels[riskLevel].label}
                  </span>
                  <span className="text-gray-500" style={{ fontSize: '13px' }}>
                    {riskLabels[riskLevel].labelEn}
                  </span>
                </div>
                <p className="text-[#1C2B4A]" style={{ fontSize: '15px', fontWeight: 600 }}>
                  इस आवेदन में {issues.length} समस्याएं पाई गई हैं।
                </p>
                <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
                  {issues.length} issues found in this application. Review before submitting.
                </p>
              </div>

              {/* Probability Meter */}
              <div className="text-center">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E0E0E0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={riskLabels[riskLevel].color}
                      strokeWidth="8"
                      strokeDasharray={`${(riskScore / 100) * 264} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontSize: '26px',
                        fontWeight: 700,
                        color: riskLabels[riskLevel].color,
                        lineHeight: 1,
                      }}
                    >
                      {riskScore}%
                    </span>
                    <span className="text-gray-500" style={{ fontSize: '10px' }}>Risk Score</span>
                  </div>
                </div>
                <p className="text-[#3D4F6B]" style={{ fontSize: '12px', fontWeight: 600 }}>अस्वीकृति संभावना</p>
                <p className="text-[#7A8BA3]" style={{ fontSize: '10px' }}>Rejection Probability</p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
            <div className="px-5 py-3 border-b" style={{ background: '#F8F9FC', borderColor: '#D8DDE8' }}>
              <p className="text-[#1C2B4A]" style={{ fontSize: '14px', fontWeight: 700 }}>
                🔍 पाई गई समस्याएं | Issues Found
              </p>
            </div>

            <div className="divide-y" style={{ divideColor: '#EEF1F7' }}>
              {issues.map((issue, i) => {
                const sev = severityConfig[issue.severity];
                return (
                  <div key={i} className="p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: sev.bg, color: sev.color }}
                      >
                        {sev.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[#1C2B4A]" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '14px', fontWeight: 600 }}>
                            {issue.issue}
                          </p>
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ background: sev.bg, color: sev.color, fontWeight: 600 }}
                          >
                            {sev.label}
                          </span>
                        </div>
                        <p className="text-[#7A8BA3] text-xs mb-2">{issue.issueEn}</p>
                        <p className="text-[#3D4F6B]" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                          {issue.detail}
                        </p>
                        <div
                          className="flex items-start gap-2 mt-2 p-2 rounded"
                          style={{ background: '#FFF0E0' }}
                        >
                          <span style={{ fontSize: '12px' }}>💡</span>
                          <p className="text-[#E8701A]" style={{ fontSize: '12px' }}>
                            {issue.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/app/new')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border transition-all hover:bg-gray-50"
              style={{ borderColor: '#D93025', color: '#D93025', fontSize: '14px', fontWeight: 600 }}
            >
              <XCircle size={16} />
              आवेदन रद्द करें | Cancel Application
            </button>
            <button
              onClick={() => handleFinalSubmit('प्रक्रियाधीन')}
              disabled={confirming}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #E8A020, #C87818)', fontSize: '15px', fontWeight: 700 }}
            >
              {confirming ? (
                <><AshokChakra size={18} color="white" animated /> सबमिट हो रहा है...</>
              ) : (
                <>⚠️ फिर भी सबमिट करें | Submit Anyway</>
              )}
            </button>
            <button
              onClick={() => handleFinalSubmit('स्वीकृत')}
              disabled={confirming}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2E9E50, #1A7A38)', fontSize: '15px', fontWeight: 700 }}
            >
              {confirming ? (
                <><AshokChakra size={18} color="white" animated /> प्रस्तुत हो रहा है...</>
              ) : (
                <><CheckCircle size={16} /> सत्यापित सबमिट | Verified Submit</>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Eligibility Check */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
            <div className="px-4 py-3" style={{ background: '#003380' }}>
              <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                ✅ पात्रता जांच | Eligibility
              </p>
            </div>
            <div className="p-4 space-y-2">
              {[
                { check: 'आयु पात्रता', pass: true },
                { check: 'निवास सत्यापन', pass: true },
                { check: 'आय सीमा', pass: false },
                { check: 'दस्तावेज़ पूर्णता', pass: true },
                { check: 'डुप्लीकेट जांच', pass: true },
                { check: 'ब्लैकलिस्ट जांच', pass: true },
              ].map((item) => (
                <div key={item.check} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: item.pass ? '#1A7A38' : '#D93025' }}
                  >
                    {item.pass ? (
                      <Check size={10} className="text-white" />
                    ) : (
                      <X size={10} className="text-white" />
                    )}
                  </div>
                  <p className="text-[#3D4F6B]" style={{ fontSize: '12px' }}>{item.check}</p>
                  <span
                    className="ml-auto px-1.5 py-0.5 rounded text-white"
                    style={{ background: item.pass ? '#1A7A38' : '#D93025', fontSize: '10px' }}
                  >
                    {item.pass ? 'पास' : 'फेल'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Confidence */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'linear-gradient(135deg, #1C2B4A, #2D3F5E)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AshokChakra size={24} color="#FFD700" />
              <p className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                AI सिफारिश
              </p>
            </div>
            <p className="text-gray-300" style={{ fontSize: '12px', lineHeight: 1.6 }}>
              आय दस्तावेज़ में विसंगति के कारण यह आवेदन अस्वीकृत होने का जोखिम है। नागरिक से अद्यतन दस्तावेज़ प्राप्त करें।
            </p>
            <div
              className="mt-3 p-2 rounded flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <span style={{ fontSize: '12px', color: '#E8A020' }}>⚡</span>
              <span className="text-gray-300" style={{ fontSize: '11px' }}>
                सुझाव: आय प्रमाण पत्र पुनः अपलोड करें
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}