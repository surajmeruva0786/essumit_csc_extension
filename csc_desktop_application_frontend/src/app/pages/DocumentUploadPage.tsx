import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, CheckCircle, FileText, X, ChevronRight, Eye } from 'lucide-react';

const requiredDocs = [
  { id: 'aadhar', label: 'आधार कार्ड', labelEn: 'Aadhaar Card', required: true, size: '2MB max', formats: 'PDF, JPG, PNG' },
  { id: 'ration', label: 'राशन कार्ड', labelEn: 'Ration Card', required: true, size: '2MB max', formats: 'PDF, JPG, PNG' },
  { id: 'birth_cert', label: 'जन्म प्रमाण पत्र / स्कूल प्रमाण पत्र', labelEn: 'Birth Certificate / School Certificate', required: true, size: '2MB max', formats: 'PDF, JPG, PNG' },
  { id: 'income_doc', label: 'आय का प्रमाण', labelEn: 'Income Proof Document', required: false, size: '2MB max', formats: 'PDF, JPG' },
  { id: 'photo', label: 'पासपोर्ट साइज फोटो', labelEn: 'Passport Size Photo', required: true, size: '500KB max', formats: 'JPG, PNG' },
];

interface UploadedFile {
  name: string;
  size: string;
  progress: number;
}

export function DocumentUploadPage() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState<Record<string, UploadedFile>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (docId: string) => {
    setUploading(docId);
    // Simulate upload
    for (let p = 0; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 150));
      setUploaded((prev) => ({
        ...prev,
        [docId]: { name: `document_${docId}.pdf`, size: '1.2 MB', progress: p },
      }));
    }
    setUploading(null);
  };

  const removeFile = (docId: string) => {
    setUploaded((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  const requiredUploaded = requiredDocs
    .filter((d) => d.required)
    .every((d) => uploaded[d.id]?.progress === 100);

  const totalUploaded = Object.values(uploaded).filter((f) => f.progress === 100).length;
  const totalProgress = Math.round((totalUploaded / requiredDocs.length) * 100);

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[#7A8BA3] mb-1" style={{ fontSize: '13px' }}>
          <span>डैशबोर्ड</span> <ChevronRight size={13} />
          <span>नया आवेदन</span> <ChevronRight size={13} />
          <span className="text-[#3D4F6B]">दस्तावेज़ अपलोड</span>
        </div>
        <h1 className="text-[#1C2B4A]" style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '26px', fontWeight: 700 }}>
          📋 आवश्यक दस्तावेज़ | Required Documents
        </h1>
        <p className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>
          जन्म प्रमाण पत्र आवेदन के लिए | For Birth Certificate Application
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Upload Section */}
        <div className="col-span-2 space-y-4">
          {/* Progress Bar */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#1C2B4A]" style={{ fontSize: '15px', fontWeight: 600 }}>
                अपलोड प्रगति | Upload Progress
              </p>
              <span
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1A7A38',
                }}
              >
                {totalUploaded}/{requiredDocs.length}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${totalProgress}%`,
                  background: 'linear-gradient(90deg, #1A7A38, #2E9E50)',
                }}
              />
            </div>
            <p className="text-[#7A8BA3] mt-1" style={{ fontSize: '12px' }}>
              {totalProgress}% complete • {requiredDocs.length - totalUploaded} documents remaining
            </p>
          </div>

          {/* Document Rows */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
            <div
              className="px-5 py-3.5 border-b flex items-center gap-2"
              style={{ borderColor: '#EEF1F7', background: '#F8F9FC' }}
            >
              <FileText size={17} style={{ color: '#003380' }} />
              <p className="text-[#1C2B4A]" style={{ fontSize: '15px', fontWeight: 700 }}>
                दस्तावेज़ सूची | Document Checklist
              </p>
            </div>

            <div className="divide-y" style={{ divideColor: '#EEF1F7' }}>
              {requiredDocs.map((doc) => {
                const file = uploaded[doc.id];
                const isUploaded = file?.progress === 100;
                const isUploading = uploading === doc.id;

                return (
                  <div key={doc.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div
                        className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          borderColor: isUploaded ? '#1A7A38' : '#D8DDE8',
                          background: isUploaded ? '#1A7A38' : 'white',
                        }}
                      >
                        {isUploaded && <span className="text-white" style={{ fontSize: '12px' }}>✓</span>}
                      </div>

                      {/* Doc Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p
                            className="text-[#1C2B4A]"
                            style={{
                              fontFamily: "'Noto Sans Devanagari', sans-serif",
                              fontSize: '15px',
                              fontWeight: 600,
                            }}
                          >
                            {doc.label}
                          </p>
                          {doc.required && (
                            <span className="text-red-500 font-semibold" style={{ fontSize: '13px' }}>*अनिवार्य</span>
                          )}
                          {!doc.required && (
                            <span
                              className="px-2 py-0.5 rounded"
                              style={{ background: '#EEF1F7', color: '#7A8BA3', fontSize: '12px' }}
                            >
                              वैकल्पिक
                            </span>
                          )}
                        </div>
                        <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>{doc.labelEn}</p>
                        <p className="text-[#7A8BA3] mt-0.5" style={{ fontSize: '12px' }}>
                          {doc.formats} • {doc.size}
                        </p>

                        {/* Progress bar if uploading */}
                        {isUploading && file && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{ width: `${file.progress}%`, background: '#003380' }}
                              />
                            </div>
                            <p className="text-[#003380] mt-1" style={{ fontSize: '12px' }}>
                              अपलोड हो रहा है... {file.progress}%
                            </p>
                          </div>
                        )}

                        {/* Uploaded file preview */}
                        {isUploaded && (
                          <div
                            className="flex items-center gap-2 mt-2 p-2.5 rounded-lg"
                            style={{ background: '#E6F5EC', border: '1px solid #B8E4C8' }}
                          >
                            <FileText size={15} style={{ color: '#1A7A38' }} />
                            <span className="text-[#1A7A38] flex-1" style={{ fontSize: '13px', fontFamily: "'Roboto Mono', monospace" }}>
                              {file.name}
                            </span>
                            <span className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>{file.size}</span>
                            <span
                              className="px-2 py-0.5 rounded text-white"
                              style={{ background: '#1A7A38', fontSize: '11px', fontWeight: 600 }}
                            >
                              ✓ अपलोड
                            </span>
                            <button onClick={() => removeFile(doc.id)}>
                              <X size={15} className="text-gray-400 hover:text-red-500" />
                            </button>
                            <button>
                              <Eye size={15} className="text-[#003380] hover:opacity-70" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      {!isUploaded && (
                        <button
                          onClick={() => handleUpload(doc.id)}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-60 flex-shrink-0"
                          style={{
                            background: isUploading ? '#7A8BA3' : '#003380',
                            fontSize: '13px',
                          }}
                        >
                          <Upload size={15} />
                          {isUploading ? 'अपलोड...' : 'अपलोड करें'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => navigate('/app/extraction')}
            disabled={!requiredUploaded}
            className="w-full py-4 rounded-xl text-white transition-all"
            style={{
              background: requiredUploaded
                ? 'linear-gradient(135deg, #FF9933, #E8701A)'
                : '#D8DDE8',
              color: requiredUploaded ? 'white' : '#7A8BA3',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            जारी रखें → Continue to AI Extraction
          </button>
        </div>

        {/* Right: Instructions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
            <div className="px-4 py-3.5" style={{ background: '#003380' }}>
              <p className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>ℹ️ दिशा-निर्देश | Guidelines</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                'सभी दस्तावेज़ स्पष्ट और पठनीय होने चाहिए।',
                'दस्तावेज़ 2MB से बड़े नहीं होने चाहिए।',
                'PDF, JPG, PNG फॉर्मेट स्वीकार्य हैं।',
                'आधार कार्ड में नाम और पता स्पष्ट दिखना चाहिए।',
                'सभी अनिवार्य (*) दस्तावेज़ अपलोड करना अनिवार्य है।',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: '#E8701A', fontSize: '14px', flexShrink: 0 }}>•</span>
                  <p className="text-[#3D4F6B]" style={{ fontSize: '13px', lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ background: 'linear-gradient(135deg, #1C2B4A, #2D3F5E)' }}
          >
            <p className="text-yellow-400 mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
              🤖 AI निष्कर्षण
            </p>
            <p className="text-gray-300" style={{ fontSize: '13px', lineHeight: 1.6 }}>
              दस्तावेज़ अपलोड करने के बाद, AI स्वचालित रूप से फॉर्म डेटा निकालेगा और सत्यापित करेगा।
            </p>
            <p className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
              After uploading, AI will automatically extract and verify form data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}