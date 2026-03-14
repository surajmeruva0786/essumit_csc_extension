import { useNavigate } from 'react-router';
import { FileText, Bot, ChevronRight } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-lg p-6 border border-border-custom shadow-sm">

          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-lg bg-saffron/10 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-saffron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy mb-1">नमस्ते, Welcome</h2>
            <p className="text-sm text-muted-text">Digital India service delivery platform</p>
          </div>

          {/* New Application */}
          <button
            onClick={() => navigate('/citizen-details')}
            className="w-full h-11 rounded-md bg-green hover:bg-green-hover text-white font-medium text-sm mb-3 flex items-center justify-between px-4 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" strokeWidth={2} />
              <span>नया आवेदन शुरू करें</span>
            </div>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <p className="text-xs text-muted-text mb-5 px-1">Start New Application</p>

          {/* AI Assistant */}
          <button
            onClick={() => navigate('/ai-assistant')}
            className="w-full h-11 rounded-md bg-surface border border-border-strong hover:bg-slate-50 text-navy font-medium text-sm flex items-center justify-between px-4 transition-colors mb-3"
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4" strokeWidth={2} />
              <span>AI सहायक से बात करें</span>
            </div>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <p className="text-xs text-muted-text mb-5 px-1">Chat with AI Assistant</p>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-border-custom text-center">
            <p className="text-[10px] text-muted-text">
              v1.0.0 • CHIPS Chhattisgarh • Government of India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}