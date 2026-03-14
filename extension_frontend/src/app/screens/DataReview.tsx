import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Database, AlertTriangle, CheckCircle, AlertCircle, Shield, Loader2 } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import NavigationButtons from '../components/NavigationButtons';
import { getServiceConfig } from '../config/serviceConfig';
import { triggerAutofillInCurrentTab } from '../api/autofillApi';
import { validateExtraction, type ValidationResult as ValidationResultType } from '../api/validationApi';
import { getBackendServiceId } from '../config/serviceConfig';
import { getFieldLabel } from '../config/fieldLabels';

export default function DataReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { extraction, serviceId, name, mobile, formScannedFields, formTabId } = location.state || {};
  const serviceConfig = serviceId ? getServiceConfig(serviceId) : null;
  const backendServiceId = serviceId ? getBackendServiceId(serviceId) : 'birth_certificate';

  interface Field {
    id: string;
    labelHi: string;
    labelEn: string;
    value: string;
    confidence: number;
    validationMsg?: string;
    validationSuggestion?: string;
  }

  const [fields, setFields] = useState<Field[]>([]);
  const [validation, setValidation] = useState<ValidationResultType | null>(null);
  const [validationLoading, setValidationLoading] = useState(true);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillFailed, setAutofillFailed] = useState(false);

  useEffect(() => {
    if (!extraction || !extraction.extractedFields || !Object.keys(extraction.extractedFields).length) {
      setFields([]);
      setValidationLoading(false);
      return;
    }

    const scannedByKey = (formScannedFields || []).reduce(
      (acc: Record<string, { label: string; labelHi: string }>, f: { fieldKey?: string; semanticKey?: string; label: string; labelHi: string }) => {
        const key = f.semanticKey || f.fieldKey || '';
        if (key) acc[key] = { label: f.label, labelHi: f.labelHi };
        return acc;
      },
      {}
    );

    const issuesByField: Record<string, { message: string; suggestion?: string }> = {};
    const prepared: Field[] = Object.entries(extraction.extractedFields).map(([key, field]: any) => {
      const scanned = scannedByKey[key];
      const labels = scanned
        ? { hi: scanned.labelHi || scanned.label, en: scanned.label }
        : getFieldLabel(key);
      return {
        id: key,
        labelHi: labels.hi || key,
        labelEn: labels.en || key,
        value: field?.value ?? '',
        confidence: typeof field?.confidence === 'number' ? Math.round(field.confidence * 100) : 0,
      };
    });

    setFields(prepared);

    // Run AI validation
    (async () => {
      try {
        const result = await validateExtraction(backendServiceId || 'birth_certificate', extraction.extractedFields);
        setValidation(result);
        result.issues?.forEach((issue) => {
          if (issue.field) {
            issuesByField[issue.field] = {
              message: issue.messageHindi || issue.message,
              suggestion: issue.suggestion,
            };
          }
        });
        setFields((prev) =>
          prev.map((f) => ({
            ...f,
            validationMsg: issuesByField[f.id]?.message,
            validationSuggestion: issuesByField[f.id]?.suggestion,
          }))
        );
      } catch (e) {
        console.warn('[DataReview] Validation error', e);
      } finally {
        setValidationLoading(false);
      }
    })();
  }, [extraction, formScannedFields, backendServiceId]);

  const handleFieldChange = (id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85)
      return {
        bg: 'bg-green-light',
        border: 'border-l-2 border-green',
        text: 'text-green',
        icon: CheckCircle,
        ringClass: 'focus:ring-green/30',
      };
    if (confidence >= 60)
      return {
        bg: 'bg-amber-50',
        border: 'border-l-2 border-risk-amber',
        text: 'text-risk-amber',
        icon: AlertCircle,
        ringClass: 'focus:ring-amber-500/30',
      };
    return {
      bg: 'bg-red-50',
      border: 'border-l-2 border-risk-red',
      text: 'text-risk-red',
      icon: AlertTriangle,
      ringClass: 'focus:ring-red-500/30',
    };
  };

  const warningCount = fields.filter((f) => f.confidence < 85).length;

  // Build extractedFields from current (edited) fields for autofill, validation, and navigation
  const getEditedExtractedFields = () => {
    const out: Record<string, { value: string | null; confidence?: number }> = {};
    fields.forEach((f) => {
      out[f.id] = { value: f.value || null, confidence: f.confidence / 100 };
    });
    return out;
  };

  const handleRevalidate = async () => {
    if (!fields.length) return;
    setValidationLoading(true);
    try {
      const editedFields = getEditedExtractedFields();
      const result = await validateExtraction(backendServiceId || 'birth_certificate', editedFields);
      setValidation(result);
      const issuesByField: Record<string, { message: string; suggestion?: string }> = {};
      result.issues?.forEach((issue) => {
        if (issue.field) {
          issuesByField[issue.field] = {
            message: issue.messageHindi || issue.message,
            suggestion: issue.suggestion,
          };
        }
      });
      setFields((prev) =>
        prev.map((f) => ({
          ...f,
          validationMsg: issuesByField[f.id]?.message,
          validationSuggestion: issuesByField[f.id]?.suggestion,
        }))
      );
    } catch (e) {
      console.warn('[DataReview] Re-validation error', e);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleAutofill = async () => {
    if (!formScannedFields?.length || !fields.length) return;
    setAutofillFailed(false);
    setAutofillLoading(true);
    try {
      const editedFields = getEditedExtractedFields();
      const result = await triggerAutofillInCurrentTab(
        editedFields,
        formScannedFields,
        typeof formTabId === 'number' ? formTabId : undefined
      );
      if (result === null) setAutofillFailed(true);
    } catch (e) {
      console.warn('[DataReview] Autofill error', e);
      setAutofillFailed(true);
    } finally {
      setAutofillLoading(false);
    }
  };

  const handleNext = () => {
    if (!extraction || !serviceId) return;
    const editedFields = getEditedExtractedFields();
    const editedExtraction = {
      ...extraction,
      extractedFields: editedFields,
    };
    navigate('/validation', {
      state: {
        extraction: editedExtraction,
        serviceId,
        name,
        mobile,
        formScannedFields,
        formTabId,
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        {/* Bot Message */}
        <ChatBubble
          type="bot"
          titleHi="AI ने यह जानकारी निकाली"
          titleEn="AI extracted this information"
        />

        {/* AI Validation Loading / Summary Banner */}
        {validationLoading && (
          <div className="px-4 mb-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-saffron animate-spin" strokeWidth={2} />
              <span className="text-xs text-slate-600">AI सत्यापन कर रहा है...</span>
            </div>
          </div>
        )}
        {validation && !validationLoading && (
          <div className="px-4 mb-3">
            <div
              className={`rounded-lg border-l-4 p-3 ${
                validation.overallRisk === 'HIGH'
                  ? 'bg-red-50 border-risk-red'
                  : validation.overallRisk === 'MEDIUM'
                  ? 'bg-amber-50 border-risk-amber'
                  : 'bg-green-light border-green'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="text-xs">
                    <div className="font-semibold text-navy mb-0.5">
                      AI सत्यापन: {validation.summaryHindi || validation.summaryEnglish}
                    </div>
                    <div className="text-muted-text">{validation.summaryEnglish}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRevalidate}
                  disabled={validationLoading}
                  className="shrink-0 px-2 py-1 rounded text-[10px] font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  फिर सत्यापित करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Review Card */}
        <div className="px-4 mb-4">
          <div className="bg-surface rounded-lg overflow-hidden border border-border-custom">
            <div className="px-4 py-3 bg-navy flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-white" strokeWidth={2} />
                <span className="text-white font-semibold text-sm">निकाली गई जानकारी</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-amber-500/20 text-white text-[10px] font-semibold">
                {fields.length} फ़ील्ड्स • {warningCount} चेतावनी
              </div>
            </div>

            <div className="divide-y divide-border-custom">
              {fields.map((field) => {
                const confidenceStyle = getConfidenceColor(field.confidence);
                const ConfidenceIcon = confidenceStyle.icon;

                return (
                  <div
                    key={field.id}
                    className={`px-4 py-3 ${confidenceStyle.border} ${confidenceStyle.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-muted-text mb-1.5">
                          {field.labelHi} / {field.labelEn}
                        </div>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.confidence === 0 ? 'खाली' : ''}
                          className={`w-full text-sm font-semibold text-navy bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-slate-400 ${confidenceStyle.ringClass}`}
                        />
                        {/* AI Validation for this field - always show when validation done */}
                        {validation && !validationLoading && (
                          <div
                            className={`mt-2 text-[10px] rounded px-2 py-1 flex items-center gap-1 ${
                              field.validationMsg
                                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                : 'bg-green-light/70 border border-green/30 text-green-800'
                            }`}
                          >
                            <Shield className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                            {field.validationMsg ? (
                              <>
                                <span>{field.validationMsg}</span>
                                {field.validationSuggestion && (
                                  <span className="text-saffron">→ {field.validationSuggestion}</span>
                                )}
                              </>
                            ) : (
                              <span>AI ✓ नियमों के अनुसार</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={`flex flex-col items-center gap-1 ${confidenceStyle.text}`}>
                        <ConfidenceIcon className="w-4 h-4" strokeWidth={2} />
                        <div className="text-xs font-mono font-semibold">{field.confidence}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {extraction?.crossDocumentMismatches?.length > 0 && (
              <div className="px-4 py-4 bg-amber-50 border-t-2 border-risk-amber">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-risk-amber flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-risk-amber mb-1">दस्तावेज़ों में अंतर मिला</div>
                    {extraction.crossDocumentMismatches.map((m: { field: string; val1: string; val2: string }, i: number) => (
                      <div key={i} className="text-xs text-slate bg-white p-2.5 rounded mb-3 border border-amber-200">
                        {m.field}: {m.val1} vs {m.val2}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-2 space-y-2">
        {autofillFailed && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            फॉर्म भर नहीं सका। फॉर्म वाला टैब खुला रखें, पेज रिफ्रेश करें और फिर से कोशिश करें।
          </div>
        )}
        {formScannedFields?.length ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAutofill}
              disabled={autofillLoading}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-green-light text-green border border-green/30 hover:bg-green/10"
            >
              {autofillLoading ? 'फॉर्म भर रहा है...' : 'फॉर्म ऑटो-फिल करें'}
            </button>
          </div>
        ) : null}
        <p className="text-[10px] text-muted-text text-center">
          संपादित करें, फिर ऑटो-फिल या सत्यापन दोहरा सकते हैं
        </p>
      </div>
      <NavigationButtons
        onNext={handleNext}
        nextLabel="सत्यापन देखें"
        nextDisabled={false}
      />
    </div>
  );
}
