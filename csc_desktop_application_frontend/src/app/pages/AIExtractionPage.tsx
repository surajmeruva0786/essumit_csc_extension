import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AshokChakra } from '../components/AshokChakra';
import { CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, label: 'दस्तावेज़ पढ़ा जा रहा है', labelEn: 'Reading document', delay: 0 },
  { id: 2, label: 'फ़ील्ड निकाले जा रहे हैं', labelEn: 'Extracting fields', delay: 2000 },
  { id: 3, label: 'डेटा का विश्लेषण हो रहा है', labelEn: 'Analyzing data', delay: 4000 },
  { id: 4, label: 'पात्रता की जांच', labelEn: 'Checking eligibility', delay: 6000 },
  { id: 5, label: 'रिपोर्ट तैयार की जा रही है', labelEn: 'Preparing report', delay: 7500 },
];

const skeletonFields = [
  'नाम / Name',
  'जन्म तिथि / Date of Birth',
  'पिता का नाम / Father\'s Name',
  'माता का नाम / Mother\'s Name',
  'पता / Address',
  'आधार संख्या / Aadhaar No.',
  'मोबाइल / Mobile',
  'जाति / Caste',
];

export function AIExtractionPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setCurrentStep(i);
          setProgress(Math.round(((i + 1) / steps.length) * 100));
        }, step.delay)
      );
    });

    timers.push(
      setTimeout(() => {
        setCompleted(true);
        setProgress(100);
      }, 9000)
    );

    timers.push(
      setTimeout(() => {
        navigate('/app/review');
      }, 10500)
    );

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #EEF1F7 0%, #E8EDF5 100%)',
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
          {/* Header */}
          <div
            className="px-8 py-6 text-center"
            style={{ background: 'linear-gradient(135deg, #1C2B4A, #003380)' }}
          >
            <div className="flex justify-center mb-4">
              {completed ? (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: '#1A7A38' }}
                >
                  <CheckCircle size={40} className="text-white" />
                </div>
              ) : (
                <div className="relative">
                  <AshokChakra size={80} color="#FFD700" animated />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                  </div>
                </div>
              )}
            </div>
            <h2
              className="text-white mb-1"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '22px', fontWeight: 700 }}
            >
              {completed ? '✅ AI निष्कर्षण पूर्ण' : '🤖 AI दस्तावेज़ निष्कर्षण'}
            </h2>
            <p className="text-gray-400" style={{ fontSize: '13px' }}>
              {completed
                ? 'Extraction Complete — Redirecting to Review...'
                : 'AI Document Extraction — Please wait...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-4 border-b" style={{ borderColor: '#EEF1F7' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#3D4F6B]" style={{ fontSize: '13px', fontWeight: 600 }}>
                {completed ? 'पूर्ण' : 'प्रगति में...'}
              </span>
              <span
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: completed ? '#1A7A38' : '#003380',
                }}
              >
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: completed
                    ? 'linear-gradient(90deg, #1A7A38, #2E9E50)'
                    : 'linear-gradient(90deg, #003380, #0055CC)',
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="px-8 py-5 border-b" style={{ borderColor: '#EEF1F7' }}>
            <p className="text-[#7A8BA3] mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>
              PROCESSING STEPS
            </p>
            <div className="space-y-3">
              {steps.map((step, i) => {
                const isDone = i < currentStep || completed;
                const isActive = i === currentStep && !completed;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isDone ? '#1A7A38' : isActive ? '#003380' : '#EEF1F7',
                      }}
                    >
                      {isDone ? (
                        <span className="text-white" style={{ fontSize: '10px' }}>✓</span>
                      ) : isActive ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <span className="text-[#7A8BA3]" style={{ fontSize: '10px' }}>{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        style={{
                          fontFamily: "'Noto Sans Devanagari', sans-serif",
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 400,
                          color: isDone ? '#1A7A38' : isActive ? '#1C2B4A' : '#7A8BA3',
                        }}
                      >
                        {step.label}
                      </p>
                      <p style={{ fontSize: '11px', color: '#7A8BA3' }}>{step.labelEn}</p>
                    </div>
                    {isDone && (
                      <CheckCircle size={14} style={{ color: '#1A7A38', flexShrink: 0 }} />
                    )}
                    {isActive && (
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((d) => (
                          <div
                            key={d}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: '#003380',
                              animation: `bounce 1s ease-in-out ${d * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skeleton fields */}
          <div className="px-8 py-5">
            <p className="text-[#7A8BA3] mb-3" style={{ fontSize: '12px', fontWeight: 600 }}>
              EXTRACTING FIELDS
            </p>
            <div className="grid grid-cols-2 gap-2">
              {skeletonFields.map((field, i) => {
                const isExtracted = i < (currentStep * 2);
                return (
                  <div key={field} className="flex items-center gap-2">
                    <div
                      className="rounded px-2 py-1 flex-shrink-0"
                      style={{
                        background: isExtracted ? '#E6F5EC' : '#EEF1F7',
                        fontSize: '11px',
                        color: isExtracted ? '#1A7A38' : '#7A8BA3',
                        fontWeight: isExtracted ? 600 : 400,
                      }}
                    >
                      {isExtracted ? '✓' : '·'} {field}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-[#7A8BA3] mt-4" style={{ fontSize: '12px' }}>
          कृपया प्रतीक्षा करें। पृष्ठ स्वचालित रूप से आगे बढ़ेगा। | Please wait. Page will advance automatically.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
