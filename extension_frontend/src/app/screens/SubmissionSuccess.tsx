import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle2, FileText, MessageSquare, ChevronRight, Printer } from 'lucide-react';
import { saveSession, getWhatsAppShareLink } from '../api/sessionApi';
import { getServiceById } from '../config/services';
import { getFieldLabel } from '../config/fieldLabels';

export default function SubmissionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { extraction, serviceId, name, mobile, validation } = location.state || {};
  const service = serviceId ? getServiceById(serviceId) : null;

  const [refId, setRefId] = useState<string>('REF-CG-2024-XXXXX');
  const [saved, setSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (saved) return;
    const extracted = extraction?.extractedFields || {};
    const flatFields: Record<string, string | null> = {};
    const confidenceScores: Record<string, number> = {};
    Object.entries(extracted).forEach(([k, v]: [string, unknown]) => {
      const entry = v as { value?: string | null; confidence?: number } | null;
      flatFields[k] = entry?.value ?? null;
      confidenceScores[k] = typeof entry?.confidence === 'number' ? entry.confidence : 0;
    });

    saveSession({
      citizenName: name || null,
      citizenPhone: mobile || null,
      serviceType: serviceId || 'default',
      extractedFields: flatFields,
      confidenceScores,
      aiValidationResult: validation || null,
      operatorDecision: 'SUBMITTED',
    })
      .then((s) => {
        if (s?.refId) setRefId(s.refId);
        setSaved(true);
      })
      .catch((e) => {
        console.warn('[SubmissionSuccess] Session save failed', e);
        setRefId('REF-CG-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase());
        setSaved(true);
      });
  }, [extraction, serviceId, name, mobile, validation, saved]);

  const fieldEntries = useMemo(() => {
    const extracted = extraction?.extractedFields || {};
    return Object.entries(extracted)
      .map(([key, entry]: [string, unknown]) => {
        const e = entry as { value?: string | null } | null;
        const val = e?.value;
        if (val == null || !String(val).trim()) return null;
        const { hi } = getFieldLabel(key);
        return { labelHi: hi || key, value: String(val).trim() };
      })
      .filter((x): x is { labelHi: string; value: string } => x != null);
  }, [extraction]);

  const whatsappUrl = mobile
    ? getWhatsAppShareLink(mobile, refId, service?.nameHi || 'सेवा', name, fieldEntries)
    : null;

  const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const handlePrint = () => {
    if (!printRef.current) return;
    const extracted = extraction?.extractedFields || {};
    const rows = Object.entries(extracted)
      .map(([key, entry]: [string, unknown]) => {
        const e = entry as { value?: string | null } | null;
        const val = e?.value;
        if (val == null || !String(val).trim()) return null;
        const { hi } = getFieldLabel(key);
        return `<tr><td>${esc(hi || key)}</td><td>${esc(String(val))}</td></tr>`;
      })
      .filter(Boolean)
      .join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Receipt - ${refId}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
          h2 { color: #138944; margin-bottom: 8px; }
          .ref { font-family: monospace; font-weight: bold; font-size: 14px; background: #1A2332; color: white; padding: 8px 12px; border-radius: 6px; display: inline-block; margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
          td:first-child { color: #64748b; font-size: 12px; width: 40%; }
          .footer { margin-top: 24px; font-size: 11px; color: #64748b; }
          .fields-header { margin-top: 16px; font-weight: 600; font-size: 13px; color: #1A2332; }
        </style>
        </head>
        <body>
          <h2>आवेदन जमा हो गया</h2>
          <p style="color:#64748b;font-size:12px;">Application Submitted Successfully</p>
          <div class="ref">${refId}</div>
          <table>
            <tr><td>नागरिक</td><td>${esc(name || '-')}</td></tr>
            <tr><td>मोबाइल</td><td>${esc(mobile || '-')}</td></tr>
            <tr><td>सेवा</td><td>${esc(service?.nameHi || serviceId || '-')}</td></tr>
            <tr><td>तारीख</td><td>${esc(new Date().toLocaleString('hi-IN'))}</td></tr>
          </table>
          ${rows ? `<div class="fields-header">निकाली गई जानकारी / Extracted Fields</div><table>${rows}</table>` : ''}
          <div class="footer">CSC Sahayak | निर्णय आपका है — डेटा सुरक्षित है</div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
    win.close();
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center" ref={printRef}>
        {/* Success Animation */}
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#138944" strokeWidth="2" />
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x1 = 50 + 32 * Math.cos(rad);
                const y1 = 50 + 32 * Math.sin(rad);
                const x2 = 50 + 45 * Math.cos(rad);
                const y2 = 50 + 45 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#138944"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-green flex items-center justify-center">
                <CheckCircle2 className="w-11 h-11 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-lg font-semibold text-green mb-1">आवेदन जमा हो गया!</h1>
          <p className="text-sm text-muted-text">Application Submitted Successfully</p>
        </div>

        <div className="mb-5">
          <div className="inline-block px-4 py-2 rounded-md bg-navy text-white font-mono font-semibold text-xs">
            {refId}
          </div>
        </div>

        {/* WhatsApp + Print */}
        <div className="mb-8 flex flex-col gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-green-light text-green text-xs font-medium border border-green/20 hover:bg-green/10 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
              <span>WhatsApp पर भेजें</span>
            </a>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={2} />
            <span>रसीद प्रिंट करें</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => navigate('/welcome')}
            className="w-full h-11 rounded-md bg-saffron hover:bg-saffron-hover text-white font-medium text-sm flex items-center justify-between px-4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" strokeWidth={2} />
              <span>नया आवेदन / New Application</span>
            </div>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => navigate('/welcome')}
            className="w-full h-9 text-saffron font-medium text-sm hover:underline"
          >
            इतिहास देखें / View History
          </button>
        </div>
      </div>
    </div>
  );
}
