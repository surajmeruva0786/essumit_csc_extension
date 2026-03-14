import { useState, useRef, useMemo, useEffect, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import NavigationButtons from '../components/NavigationButtons';
import { getServiceById } from '../config/services';
import { getServiceConfig } from '../config/serviceConfig';
import { getFormFieldsForExtraction } from '../api/formScanApi';

interface Document {
  id: string;
  nameHi: string;
  nameEn: string;
  mandatory: boolean;
  uploaded: boolean;
  checked: boolean; // operator ticked (with or without upload)
  fileName?: string;
  fileSize?: string;
}

export default function DocumentChecklist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, mobile, serviceId } = location.state || {};
  const service = serviceId ? getServiceById(serviceId) : null;
  const serviceConfig = serviceId ? getServiceConfig(serviceId) : null;

  const baseDocuments = useMemo(() => {
    if (!serviceConfig?.requiredDocuments) {
      return [
        { id: 'aadhaar', nameHi: 'आधार कार्ड', nameEn: 'Aadhaar card', mandatory: true, uploaded: false, checked: false },
        { id: 'address_proof', nameHi: 'पता प्रमाण', nameEn: 'Address proof', mandatory: true, uploaded: false, checked: false },
      ];
    }
    return serviceConfig.requiredDocuments.map(d => ({
      id: d.id,
      nameHi: d.nameHindi,
      nameEn: d.name,
      mandatory: d.mandatory,
      uploaded: false,
      checked: false,
    }));
  }, [serviceConfig]);

  const [documents, setDocuments] = useState<Document[]>(() =>
    baseDocuments.map(d => ({ ...d, uploaded: false, checked: false }))
  );
  const [filesById, setFilesById] = useState<Record<string, File>>({});
  const [formFieldsCache, setFormFieldsCache] = useState<{
    fieldKeys: string[];
    scannedFields: Array<{ fieldKey: string; label: string; labelHi: string; selector?: string; semanticKey?: string }>;
    formTabId: number | null;
  } | null>(null);

  // Scan form from active tab when Documents screen loads (ensure portal/form tab is active)
  useEffect(() => {
    getFormFieldsForExtraction().then(({ fieldKeys, scannedFields, formTabId }) => {
      if (fieldKeys.length > 0) {
        setFormFieldsCache({ fieldKeys, scannedFields, formTabId });
      }
    });
  }, [serviceId]);

  useEffect(() => {
    setDocuments(baseDocuments.map(d => ({ ...d, uploaded: false, checked: false })));
    setFilesById({});
    setFormFieldsCache(null); // Rescan when service changes
  }, [serviceId]);

  // Single hidden file input reused for all documents
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

  const handleUploadClick = (docId: string) => {
    setPendingDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingDocId) {
      return;
    }

    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const displaySize = `${sizeKB} KB`;

    // Mark the document as uploaded and checked
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === pendingDocId
          ? { ...doc, uploaded: true, checked: true, fileName: file.name, fileSize: displaySize }
          : doc
      )
    );

    setFilesById(prev => ({
      ...prev,
      [pendingDocId]: file,
    }));

    // Clear input so same file can be selected again if needed
    event.target.value = '';
    setPendingDocId(null);
  };

  const mandatoryCount = documents.filter(d => d.mandatory).length;
  const completedMandatoryCount = documents.filter(d => d.mandatory && (d.uploaded || d.checked)).length;
  const allMandatoryComplete = mandatoryCount === 0 || completedMandatoryCount === mandatoryCount;
  const progressPercent = mandatoryCount ? (completedMandatoryCount / mandatoryCount) * 100 : 100;

  const handleToggleChecked = (docId: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, checked: !doc.checked } : doc
      )
    );
  };

  const handleContinue = () => {
    if (allMandatoryComplete) {
      const files = Object.values(filesById);
      navigate('/ai-extraction', {
        state: {
          name,
          mobile,
          serviceId,
          files,
          formFieldKeys: formFieldsCache?.fieldKeys,
          formScannedFields: formFieldsCache?.scannedFields,
          formTabId: formFieldsCache?.formTabId ?? null,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6">
        {/* User Message */}
        <ChatBubble 
          type="user"
          content={service?.nameHi || 'जन्म प्रमाण पत्र'}
        />

        {/* Bot Message */}
        <ChatBubble 
          type="bot"
          titleHi="इन दस्तावेज़ों की ज़रूरत है"
          titleEn="These documents are required"
        />

        {formFieldsCache && formFieldsCache.fieldKeys.length > 0 && (
          <div className="px-4 mb-3">
            <div className="text-xs text-green bg-green-light border border-green/30 rounded-md px-3 py-2">
              ✓ पोर्टल फॉर्म से {formFieldsCache.fieldKeys.length} फ़ील्ड मिले — इन्हीं से डेटा निकाला जाएगा
            </div>
          </div>
        )}

        {/* Document Checklist Card */}
        <div className="px-4 mb-4">
          <div className="bg-surface rounded-lg overflow-hidden border border-border-custom">
            {/* Header */}
            <div className="px-4 py-3 bg-navy flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" strokeWidth={2} />
                <span className="text-white font-semibold text-sm">दस्तावेज़ सूची</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-white/10 text-white text-[10px] font-mono font-semibold">
                {completedMandatoryCount}/{mandatoryCount} अनिवार्य
              </div>
            </div>

            {/* Document List */}
            <div>
              {documents.map((doc, index) => (
                <div 
                  key={doc.id}
                  className={`px-4 py-3.5 ${index !== documents.length - 1 ? 'border-b border-border-custom' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox - clickable to tick without upload */}
                    <button
                      type="button"
                      onClick={() => handleToggleChecked(doc.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all cursor-pointer hover:border-saffron ${
                        doc.uploaded || doc.checked
                          ? 'bg-green border-green'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {(doc.uploaded || doc.checked) && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </button>

                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-semibold text-navy">
                          {doc.nameHi}
                        </span>
                        {doc.mandatory && <AlertCircle className="w-3.5 h-3.5 text-risk-red" />}
                      </div>
                      <div className="text-xs text-muted-text">
                        {doc.nameEn}
                      </div>

                      {/* Uploaded or manually checked state */}
                      {doc.uploaded && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded bg-green-light">
                          <div className="w-8 h-8 rounded bg-green/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-green" strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-navy font-medium">{doc.fileName}</div>
                            <div className="text-[10px] text-muted-text">{doc.fileSize}</div>
                          </div>
                          <div className="px-2 py-0.5 rounded bg-green/10 text-green text-[10px] font-semibold">
                            Uploaded
                          </div>
                        </div>
                      )}
                      {doc.checked && !doc.uploaded && (
                        <div className="mt-2 inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                          दस्तावेज़ प्राप्त
                        </div>
                      )}
                    </div>

                    {/* Upload Button - optional */}
                    {!doc.uploaded && (
                      <button
                        onClick={() => handleUploadClick(doc.id)}
                        className="px-3 py-1.5 rounded-md bg-saffron hover:bg-saffron-hover text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Upload</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Footer */}
            <div className="px-4 py-4 bg-slate-50 border-t border-border-custom">
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-muted-text mt-1.5">
                  {completedMandatoryCount} / {mandatoryCount} दस्तावेज़ पूर्ण
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onNext={handleContinue}
        nextDisabled={!allMandatoryComplete}
        nextLabel={allMandatoryComplete ? 'आगे बढ़ें' : `${mandatoryCount - completedMandatoryCount} दस्तावेज़ शेष`}
      />

      {/* Hidden file input used for all Upload buttons */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
        onChange={handleFileSelected}
      />
    </div>
  );
}