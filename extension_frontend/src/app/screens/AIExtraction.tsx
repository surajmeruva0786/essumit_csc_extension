import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FileSearch, Scan, Brain, FileText } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { extractFromDocuments } from '../api/filetractApi';
import { getFormFieldsForExtraction } from '../api/formScanApi';
import { getServiceById } from '../config/services';

const genericStatusMessages = [
  { icon: FileSearch, textHi: 'दस्तावेज़ पढ़ रहा है...', textEn: 'Reading document' },
  { icon: Scan, textHi: 'फ़ील्ड्स खोज रहा है...', textEn: 'Extracting fields' },
  { icon: Brain, textHi: 'AI विश्लेषण कर रहा है...', textEn: 'AI analysis in progress' },
];

export default function AIExtraction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, mobile, serviceId, files, formFieldKeys, formScannedFields: formScannedFieldsFromState, formTabId: formTabIdFromState } = location.state || {};
  const service = serviceId ? getServiceById(serviceId) : null;
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileList = files && Array.isArray(files) ? files : [];
  const currentFileName = fileList[currentFileIndex]?.name || '';
  const statusText = currentFileName
    ? `"${currentFileName}" से डेटा निकाल रहा है...`
    : genericStatusMessages[0].textHi;
  const statusTextEn = currentFileName
    ? `Extracting from ${currentFileName}`
    : genericStatusMessages[0].textEn;

  useEffect(() => {
    if (!fileList.length || !service) {
      setError('कोई दस्तावेज़ नहीं मिले या सेवा चयनित नहीं है।');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // 1. Use form fields from state (scanned on Document Checklist) or scan now
        let fieldKeys = Array.isArray(formFieldKeys) ? formFieldKeys : [];
        let scannedFields = Array.isArray(formScannedFieldsFromState) ? formScannedFieldsFromState : [];
        let formTabId = typeof formTabIdFromState === 'number' ? formTabIdFromState : null;

        if (fieldKeys.length === 0) {
          const scanned = await getFormFieldsForExtraction();
          fieldKeys = scanned.fieldKeys;
          scannedFields = scanned.scannedFields;
          formTabId = scanned.formTabId;
        }

        if (cancelled) return;

        // 2. Run extraction with form fields (or service config if no form)
        const result = await extractFromDocuments(
          fileList,
          service,
          fieldKeys.length > 0 ? fieldKeys : undefined
        );

        if (cancelled) return;

        navigate('/data-review', {
          state: {
            name,
            mobile,
            serviceId,
            extraction: result,
            formScannedFields: scannedFields.length > 0 ? scannedFields : undefined,
            formTabId,
          },
        });
      } catch (e: unknown) {
        if (cancelled) return;
        console.error('[AIExtraction] Extraction error', e);
        setError('दस्तावेज़ से जानकारी निकालने में समस्या आई। कृपया बाद में फिर कोशिश करें।');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileList, service, navigate, name, mobile, serviceId, formFieldKeys, formScannedFieldsFromState, formTabIdFromState]);

  // Cycle through file names during loading
  useEffect(() => {
    if (fileList.length < 2) return;
    const interval = setInterval(() => {
      setCurrentFileIndex((prev) => (prev + 1) % fileList.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [fileList.length]);

  const CurrentIcon = genericStatusMessages[0].icon;

  return (
    <div className="py-6">
      {/* Bot Message */}
      <ChatBubble
        type="bot"
        titleHi="AI दस्तावेज़ पढ़ रहा है..."
        titleEn="AI is reading documents"
      />

      {error && (
        <div className="px-4 mb-3">
          <div className="bg-red-50 border border-risk-red rounded-md p-3 text-xs text-risk-red">
            {error}
          </div>
        </div>
      )}

      {/* Extraction Loader Card */}
      <div className="px-4">
        <div className="bg-surface rounded-lg p-8 border border-border-custom">
          {/* Ashoka Chakra Spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <svg
                className="animate-spin w-16 h-16"
                viewBox="0 0 100 100"
                style={{ animationDuration: '3s' }}
              >
                <circle cx="50" cy="50" r="45" fill="none" stroke="#D56B14" strokeWidth="2" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 50 + 30 * Math.cos(rad);
                  const y1 = 50 + 30 * Math.sin(rad);
                  const x2 = 50 + 45 * Math.cos(rad);
                  const y2 = 50 + 45 * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#D56B14"
                      strokeWidth="1.5"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="6" fill="#1A2332" />
              </svg>
            </div>
          </div>

          {/* Status Text - real file name when available */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <CurrentIcon className="w-5 h-5 text-saffron animate-pulse flex-shrink-0" strokeWidth={2} />
            <div>
              <div className="text-sm font-semibold text-navy">{statusText}</div>
              <div className="text-xs text-muted-text">{statusTextEn}</div>
            </div>
          </div>

          {/* File list being processed */}
          {fileList.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {fileList.map((f: File, i: number) => (
                <div
                  key={f.name + i}
                  className="flex items-center gap-2 text-xs text-slate"
                >
                  <FileText className="w-3.5 h-3.5 text-saffron flex-shrink-0" strokeWidth={2} />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2.5">
            <div className="h-2 bg-slate-200 rounded-full animate-pulse overflow-hidden">
              <div
                className="h-full bg-saffron/60 transition-all duration-500"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
