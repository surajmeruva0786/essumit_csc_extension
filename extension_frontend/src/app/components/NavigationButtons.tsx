import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
}

export default function NavigationButtons({
  onBack,
  onNext,
  backLabel = 'पीछे',
  nextLabel = 'आगे बढ़ें',
  nextDisabled = false,
  showBack = true,
  showNext = true,
}: NavigationButtonsProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-border-custom sticky bottom-0">
      <div className="flex gap-2.5">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex-1 h-10 rounded-md bg-surface border border-border-strong hover:bg-slate-50 text-navy font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>{backLabel}</span>
          </button>
        )}
        
        {showNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={`flex-1 h-10 rounded-md font-medium text-sm flex items-center justify-center gap-1.5 transition-colors ${
              nextDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-saffron hover:bg-saffron-hover text-white'
            }`}
          >
            <span>{nextLabel}</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
