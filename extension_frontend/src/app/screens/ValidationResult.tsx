import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ShieldAlert, AlertTriangle, AlertCircle, X, Check, ChevronLeft, Loader2 } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { validateExtraction, type ValidationResult as ValidationResultType } from '../api/validationApi';
import { getBackendServiceId } from '../config/serviceConfig';

export default function ValidationResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { extraction, serviceId, name, mobile, formScannedFields, formTabId } = location.state || {};
  const backendServiceId = serviceId ? getBackendServiceId(serviceId) : 'birth_certificate';

  const [validation, setValidation] = useState<ValidationResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!extraction?.extractedFields) {
      setError('कोई निकाला गया डेटा नहीं मिला।');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const result = await validateExtraction(backendServiceId || 'birth_certificate', extraction.extractedFields);
        setValidation(result);
      } catch (e: unknown) {
        console.error('[ValidationResult] Validation error', e);
        setError('सत्यापन में समस्या आई।');
        setValidation({
          overallRisk: 'MEDIUM',
          riskScore: 0.5,
          issues: [],
          eligibilityVerdict: 'NEEDS_REVIEW',
          summaryHindi: 'सत्यापन असफल रहा।',
          summaryEnglish: 'Validation failed.',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [extraction, backendServiceId]);

  const rejectionProbability = validation ? Math.round(validation.riskScore * 100) : 0;
  const issues = validation?.issues ?? [];
  const riskLevel = validation?.overallRisk || 'MEDIUM';
  const hasRedBorder = riskLevel === 'HIGH';

  const riskHeaderBg =
    riskLevel === 'HIGH' ? 'bg-risk-red' : riskLevel === 'MEDIUM' ? 'bg-risk-amber' : 'bg-green';
  const riskCardBorder =
    riskLevel === 'HIGH' ? 'border-risk-red' : riskLevel === 'MEDIUM' ? 'border-risk-amber' : 'border-green';

  const handleSubmit = () => {
    navigate('/success', {
      state: {
        extraction,
        serviceId,
        name,
        mobile,
        validation,
      },
    });
  };

  const handleCancel = () => {
    navigate('/welcome');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-saffron animate-spin mb-4" strokeWidth={2} />
        <div className="text-sm text-muted-text">AI सत्यापन कर रहा है...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        {/* Bot Message */}
        <ChatBubble
          type="bot"
          titleHi={issues.length ? 'AI ने समस्याएं पाई' : 'AI ने डेटा जाँच लिया'}
          titleEn={issues.length ? 'AI found issues' : 'AI verified data'}
          hasRedBorder={hasRedBorder}
        />

        {error && (
          <div className="px-4 mb-3">
            <div className="bg-red-50 border border-risk-red rounded-md p-3 text-xs text-risk-red">
              {error}
            </div>
          </div>
        )}

        {/* Risk Assessment Card */}
        <div className="px-4 mb-4">
          <div className={`bg-surface rounded-lg overflow-hidden border-2 ${riskCardBorder}`}>
            {/* Header */}
            <div className={`px-4 py-3 ${riskHeaderBg} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" strokeWidth={2} />
                <div>
                  <div className="text-white font-semibold text-sm">
                    {validation?.overallRisk === 'HIGH' ? 'उच्च जोखिम' : validation?.overallRisk === 'MEDIUM' ? 'मध्यम जोखिम' : 'कम जोखिम'}
                  </div>
                  <div className="text-white/80 text-[10px]">
                    {validation?.overallRisk || 'MEDIUM'} RISK
                  </div>
                </div>
              </div>
              <div className="text-white font-mono font-bold text-base">
                {rejectionProbability}%
              </div>
            </div>

            {/* Risk Meter */}
            <div className="px-4 py-4 bg-slate-50">
              <div className="text-xs text-muted-text mb-2 text-center font-medium">
                अस्वीकृति संभावना / Rejection Probability
              </div>
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(to right, #138944 0%, #D97706 50%, #DC2626 100%)',
                  }}
                />
              </div>
              <div
                className="relative h-5 flex justify-center"
                style={{ marginLeft: `${Math.min(98, rejectionProbability)}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-px h-full bg-navy" />
                <div className="absolute -top-0.5 w-2.5 h-2.5 bg-navy rounded-full" />
              </div>
            </div>

            {/* Issues List */}
            <div className="px-4 pb-4 space-y-2.5">
              {issues.map((issue, idx) => (
                <div
                  key={issue.field + idx}
                  className={`p-3 rounded-lg border-l-2 ${
                    issue.severity === 'CRITICAL'
                      ? 'border-risk-red bg-red-50'
                      : issue.severity === 'WARNING'
                      ? 'border-risk-amber bg-amber-50'
                      : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="flex gap-2.5">
                    {issue.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-risk-red flex-shrink-0 mt-0.5" strokeWidth={2} />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-risk-amber flex-shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <div className="flex-1">
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          issue.severity === 'CRITICAL' ? 'text-risk-red' : 'text-risk-amber'
                        }`}
                      >
                        {issue.messageHindi || issue.message}
                      </div>
                      <div className="text-xs text-slate mb-2">
                        {issue.message}
                      </div>
                      {issue.suggestion && (
                        <div className="inline-block px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-navy border border-border-strong">
                          {issue.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Operator Decision */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-border-custom" />
                <div className="text-xs text-muted-text font-medium">आप क्या करना चाहते हैं?</div>
                <div className="flex-1 h-px bg-border-custom" />
              </div>
              <div className="text-center text-[10px] text-muted-text mb-3">
                निर्णय आपका है — डेटा सुरक्षित है
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 bg-white border-t border-border-custom">
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button
            onClick={handleCancel}
            className="h-10 rounded-md bg-white border border-risk-red text-risk-red font-medium text-sm flex items-center justify-center gap-1.5 transition-colors hover:bg-red-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
            <span>रद्द करें</span>
          </button>
          <button
            onClick={handleSubmit}
            className="h-10 rounded-md bg-saffron hover:bg-saffron-hover text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            <span>जमा करें</span>
          </button>
        </div>
        <button
          onClick={() =>
            navigate('/data-review', {
              state: { extraction, serviceId, name, mobile, formScannedFields, formTabId },
            })
          }
          className="w-full h-9 rounded-md bg-surface border border-border-custom text-navy text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          <span>संपादित करें / पीछे जाएं</span>
        </button>
      </div>
    </div>
  );
}
