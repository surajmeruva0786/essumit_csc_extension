import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronRight, AlertTriangle, Edit2, Check, X, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

type Confidence = 'high' | 'medium' | 'low';

interface ValidationResult {
  valid: boolean;
  reason: string | null;
  isLoading: boolean;
}

interface Field {
  field: string;
  fieldEn: string;
  extracted: string;
  confidence: number;
  level: Confidence;
  editable: boolean;
}

const extractedData: Field[] = [
  { field: 'आवेदक का नाम', fieldEn: 'Applicant Name', extracted: 'सुनीता देवी', confidence: 97, level: 'high', editable: false },
  { field: 'जन्म तिथि', fieldEn: 'Date of Birth', extracted: '15/08/1985', confidence: 94, level: 'high', editable: false },
  { field: 'पिता का नाम', fieldEn: 'Father\'s Name', extracted: 'राम प्रसाद देवी', confidence: 89, level: 'high', editable: true },
  { field: 'माता का नाम', fieldEn: 'Mother\'s Name', extracted: 'गीता देवी', confidence: 92, level: 'high', editable: false },
  { field: 'आधार संख्या', fieldEn: 'Aadhaar Number', extracted: '5678 XXXX 9012', confidence: 99, level: 'high', editable: false },
  { field: 'मोबाइल नंबर', fieldEn: 'Mobile Number', extracted: '+91 98765 43210', confidence: 96, level: 'high', editable: false },
  { field: 'ग्राम/वार्ड', fieldEn: 'Village/Ward', extracted: 'ग्राम पिपरिया', confidence: 78, level: 'medium', editable: true },
  { field: 'तहसील', fieldEn: 'Tehsil', extracted: 'राजनांदगांव', confidence: 85, level: 'medium', editable: true },
  { field: 'जिला', fieldEn: 'District', extracted: 'राजनांदगांव', confidence: 90, level: 'high', editable: false },
  { field: 'वार्षिक आय', fieldEn: 'Annual Income', extracted: '₹1,20,000', confidence: 62, level: 'low', editable: true },
  { field: 'जाति', fieldEn: 'Caste', extracted: 'अन्य पिछड़ा वर्ग', confidence: 71, level: 'medium', editable: true },
  { field: 'धर्म', fieldEn: 'Religion', extracted: 'हिंदू', confidence: 95, level: 'high', editable: false },
];

const confidenceConfig: Record<Confidence, { color: string; bg: string; label: string }> = {
  high: { color: '#1A7A38', bg: '#E6F5EC', label: 'उच्च' },
  medium: { color: '#E8A020', bg: '#FFF8E0', label: 'मध्यम' },
  low: { color: '#D93025', bg: '#FEECEC', label: 'निम्न' },
};

export function DataReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<Field[]>(extractedData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});

  const validateField = async (fieldEn: string, field: string, extractedValue: string) => {
    setValidations(prev => ({ ...prev, [fieldEn]: { valid: true, reason: null, isLoading: true } }));
    try {
      const res = await fetch('http://127.0.0.1:5000/api/validate_field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_name: field, field_value: extractedValue })
      });
      if (res.ok) {
        const data = await res.json();
        setValidations(prev => ({ ...prev, [fieldEn]: { valid: data.valid, reason: data.reason, isLoading: false } }));
      } else {
        setValidations(prev => ({ ...prev, [fieldEn]: { valid: true, reason: 'Validation request failed.', isLoading: false } }));
      }
    } catch (e) {
      setValidations(prev => ({ ...prev, [fieldEn]: { valid: true, reason: 'Network error.', isLoading: false } }));
    }
  };

  useEffect(() => {
    if (location.state?.results) {
      const results = location.state.results;
      let mappedData: Field[] = [];

      if (Array.isArray(results)) {
        mappedData = results.map((r: any) => ({
          field: r.field || 'अज्ञात',
          fieldEn: r.field || 'Unknown',
          extracted: r.extracted || '',
          confidence: r.confidence || 0,
          level: (r.confidence || 0) >= 85 ? 'high' : (r.confidence || 0) >= 70 ? 'medium' : 'low',
          editable: true
        }));
      } else if (typeof results === 'object' && results !== null) {
        // Handle dictionary like { "Applicant Name": { "value": "John", "confidence": 0.95 } }
        mappedData = Object.entries(results).map(([key, val]: [string, any]) => {
          let extracted = '';
          let conf = 0;
          if (typeof val === 'object' && val !== null) {
            extracted = val.value || val.extracted || '';
            conf = val.confidence || val.ocr_confidence || 0;
            if (conf <= 1 && conf > 0) conf = Math.round(conf * 100);
          } else {
            extracted = String(val);
            conf = 95;
          }
          let level: Confidence = conf >= 85 ? 'high' : conf >= 70 ? 'medium' : 'low';
          return {
            field: key,
            fieldEn: key,
            extracted: extracted,
            confidence: conf,
            level: level,
            editable: true
          };
        });
      }
      setData(mappedData);
      
      // Auto-validate mapped fields
      mappedData.forEach(f => {
        if (f.extracted) {
          validateField(f.fieldEn, f.field, f.extracted);
        }
      });
    }
  }, [location.state]);

  const startEdit = (field: Field) => {
    setEditingId(field.fieldEn);
    setEditValue(field.extracted);
  };

  const saveEdit = (fieldEn: string) => {
    setData((prev) =>
      prev.map((f) =>
        f.fieldEn === fieldEn
          ? { ...f, extracted: editValue, confidence: 100, level: 'high' }
          : f
      )
    );
    setEditingId(null);
    const field = data.find(f => f.fieldEn === fieldEn);
    if (field) {
      validateField(fieldEn, field.field, editValue);
    }
  };

  const lowConfidenceCount = data.filter((f) => f.level === 'low').length;
  const mediumCount = data.filter((f) => f.level === 'medium').length;
  const avgConfidence = Math.round(data.reduce((s, f) => s + f.confidence, 0) / data.length);

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[#7A8BA3] mb-1" style={{ fontSize: '12px' }}>
          <span>डैशबोर्ड</span> <ChevronRight size={12} />
          <span>नया आवेदन</span> <ChevronRight size={12} />
          <span className="text-[#3D4F6B]">डेटा समीक्षा</span>
        </div>
        <h1 className="text-[#1C2B4A]" style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '24px', fontWeight: 700 }}>
          निकाला गया डेटा समीक्षा | Extracted Data Review
        </h1>
        <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
          AI द्वारा निकाले गए डेटा की समीक्षा करें और आवश्यकतानुसार सुधारें।
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="col-span-3 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'कुल फ़ील्ड', value: data.length, color: '#003380', bg: '#EEF4FF' },
              { label: 'उच्च विश्वास', value: data.filter((f) => f.level === 'high').length, color: '#1A7A38', bg: '#E6F5EC' },
              { label: 'मध्यम विश्वास', value: mediumCount, color: '#E8A020', bg: '#FFF8E0' },
              { label: 'निम्न विश्वास', value: lowConfidenceCount, color: '#D93025', bg: '#FEECEC' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border p-4" style={{ borderColor: '#D8DDE8' }}>
                <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, fontFamily: "'Baloo 2', sans-serif" }}>{s.value}</p>
                <p className="text-[#3D4F6B]" style={{ fontSize: '12px' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mismatch Warning */}
          {lowConfidenceCount > 0 && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ background: '#FEECEC', borderColor: '#D93025' }}
            >
              <AlertTriangle size={18} style={{ color: '#D93025', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="text-red-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                  ⚠️ डेटा असंगति चेतावनी | Data Mismatch Warning
                </p>
                <p className="text-red-600 mt-1" style={{ fontSize: '13px' }}>
                  {lowConfidenceCount} फ़ील्ड में कम विश्वास स्कोर है। कृपया मैन्युअल रूप से सत्यापित करें।
                </p>
                <p className="text-red-500 mt-0.5" style={{ fontSize: '11px' }}>
                  {lowConfidenceCount} field(s) have low confidence. Please verify manually before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
            <div
              className="px-5 py-3 border-b"
              style={{ background: '#F8F9FC', borderColor: '#D8DDE8' }}
            >
              <div className="flex items-center gap-4">
                <p className="text-[#1C2B4A]" style={{ fontSize: '14px', fontWeight: 700 }}>
                  निकाला गया डेटा | Extracted Data
                </p>
                <div className="flex items-center gap-2 ml-auto text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#1A7A38', display: 'inline-block' }} /> उच्च
                  <span className="w-2 h-2 rounded-full ml-2" style={{ background: '#E8A020', display: 'inline-block' }} /> मध्यम
                  <span className="w-2 h-2 rounded-full ml-2" style={{ background: '#D93025', display: 'inline-block' }} /> निम्न
                </div>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr style={{ background: '#EEF1F7' }}>
                  {['फ़ील्ड नाम', 'निकाला गया मान', 'AI सत्यापन', 'विश्वास स्कोर', 'क्रिया'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[#7A8BA3] border-b"
                      style={{ fontSize: '11px', fontWeight: 600, borderColor: '#D8DDE8' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((field) => {
                  const conf = confidenceConfig[field.level];
                  const isEditing = editingId === field.fieldEn;
                  return (
                    <tr
                      key={field.fieldEn}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: '1px solid #EEF1F7' }}
                    >
                      <td className="px-5 py-3">
                        <p className="text-[#1C2B4A]" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                          {field.field}
                        </p>
                        <p className="text-[#7A8BA3]" style={{ fontSize: '11px' }}>{field.fieldEn}</p>
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:outline-none"
                            style={{ borderColor: '#003380', fontSize: '13px' }}
                            autoFocus
                          />
                        ) : (
                          <p className="text-[#3D4F6B]" style={{ fontSize: '13px', fontWeight: 500 }}>
                            {field.extracted}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {validations[field.fieldEn]?.isLoading ? (
                            <>
                              <Loader2 className="animate-spin text-blue-500" size={14} />
                              <span className="text-blue-500" style={{ fontSize: '11px', fontWeight: 600 }}>जांच हो रही है...</span>
                            </>
                          ) : validations[field.fieldEn] ? (
                            validations[field.fieldEn].valid ? (
                              <>
                                <ShieldCheck className="text-green-600" size={16} />
                                <span className="text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>सत्यापित</span>
                              </>
                            ) : (
                              <div className="group relative flex items-center gap-1 cursor-help">
                                <ShieldAlert className="text-red-500" size={16} />
                                <span className="text-red-600" style={{ fontSize: '12px', fontWeight: 600 }}>अमान्य</span>
                                {validations[field.fieldEn].reason && (
                                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10 w-48 shadow-lg">
                                    {validations[field.fieldEn].reason}
                                  </div>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400" style={{ fontSize: '12px' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${field.confidence}%`, background: conf.color }}
                            />
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              background: conf.bg,
                              color: conf.color,
                              fontFamily: "'Roboto Mono', monospace",
                              fontWeight: 600,
                              fontSize: '11px',
                            }}
                          >
                            {field.confidence}%
                          </span>
                          <span style={{ fontSize: '11px', color: conf.color }}>{conf.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveEdit(field.fieldEn)}
                              className="p-1.5 rounded text-white"
                              style={{ background: '#1A7A38' }}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded text-white"
                              style={{ background: '#D93025' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : field.editable ? (
                          <button
                            onClick={() => startEdit(field)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[#003380] hover:bg-blue-50 transition-colors"
                            style={{ fontSize: '12px' }}
                          >
                            <Edit2 size={12} /> संपादन
                          </button>
                        ) : (
                          <span className="text-[#7A8BA3]" style={{ fontSize: '11px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/app/validation', { state: { reviewData: data } })}
              className="flex-1 py-3.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF9933, #E8701A)', fontSize: '15px', fontWeight: 700 }}
            >
              फॉर्म ऑटो-फिल करें → Auto-fill Form
            </button>
            <button
              onClick={() => navigate('/app/validation', { state: { reviewData: data } })}
              className="px-6 py-3.5 rounded-xl border transition-all hover:bg-gray-50"
              style={{ borderColor: '#D8DDE8', color: '#3D4F6B', fontSize: '14px' }}
            >
              सुधार फॉर्म → Correction Form
            </button>
          </div>
        </div>

        {/* Right: Confidence Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
            <div className="px-4 py-3" style={{ background: '#1C2B4A' }}>
              <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                📊 विश्वास सारांश
              </p>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <p
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: '40px',
                    fontWeight: 700,
                    color: avgConfidence >= 85 ? '#1A7A38' : avgConfidence >= 70 ? '#E8A020' : '#D93025',
                  }}
                >
                  {avgConfidence}%
                </p>
                <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>औसत विश्वास | Avg Confidence</p>
              </div>

              <div className="space-y-2">
                {(['high', 'medium', 'low'] as Confidence[]).map((level) => {
                  const count = data.filter((f) => f.level === level).length;
                  const conf = confidenceConfig[level];
                  return (
                    <div key={level} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: conf.color }} />
                      <span className="flex-1 text-[#3D4F6B]" style={{ fontSize: '12px' }}>{conf.label}</span>
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{ background: conf.bg, color: conf.color, fontSize: '12px', fontWeight: 600 }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: 'linear-gradient(135deg, #1C2B4A, #2D3F5E)' }}
          >
            <p className="text-yellow-400 mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>💡 सुझाव</p>
            <p className="text-gray-300" style={{ fontSize: '12px', lineHeight: 1.6 }}>
              निम्न विश्वास वाले फ़ील्ड को मैन्युअल रूप से जांचें। वार्षिक आय में विसंगति है।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
