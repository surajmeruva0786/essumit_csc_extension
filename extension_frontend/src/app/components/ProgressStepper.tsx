import { useLocation } from 'react-router';
import { Check } from 'lucide-react';

const steps = [
  { key: 'citizen-details', labelHi: 'नागरिक', labelEn: 'Citizen' },
  { key: 'service-selection', labelHi: 'सेवा', labelEn: 'Service' },
  { key: 'documents', labelHi: 'दस्तावेज़', labelEn: 'Documents' },
  { key: 'ai-extraction', labelHi: 'निकालें', labelEn: 'Extract' },
  { key: 'data-review', labelHi: 'जांचें', labelEn: 'Review' },
  { key: 'validation', labelHi: 'जमा करें', labelEn: 'Submit' },
];

export default function ProgressStepper() {
  const location = useLocation();
  
  const getCurrentStep = () => {
    const currentPath = location.pathname.replace('/', '');
    const stepIndex = steps.findIndex(step => step.key === currentPath);
    return stepIndex >= 0 ? stepIndex : 0;
  };
  
  const currentStepIndex = getCurrentStep();

  return (
    <div className="bg-surface border-b border-border-custom py-2.5 px-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Circle */}
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                  index < currentStepIndex 
                    ? 'bg-green text-white'
                    : index === currentStepIndex 
                    ? 'bg-saffron text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </div>
              {/* Label */}
              <div className={`text-[9px] text-center mt-1 font-medium ${
                index <= currentStepIndex ? 'text-navy' : 'text-muted-text'
              }`}>
                {step.labelHi}
              </div>
            </div>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div 
                className={`h-[2px] flex-1 -mt-4 transition-all ${
                  index < currentStepIndex ? 'bg-green' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}