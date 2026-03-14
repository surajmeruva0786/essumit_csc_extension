import { Building2, Circle, Bot } from 'lucide-react';

interface HeaderProps {
  onOpenAI: () => void;
}

export default function Header({ onOpenAI }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-navy border-b border-navy-light">
      <div className="flex items-center gap-2.5">
        {/* Government Emblem Icon */}
        <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            CSC सहायक
          </h1>
          <p className="text-[10px] text-slate-300 leading-none">Digital Service Portal</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAI}
          className="w-9 h-9 rounded-md bg-saffron/20 hover:bg-saffron/30 flex items-center justify-center transition-colors group relative"
          title="AI सहायक"
        >
          <Bot className="w-4 h-4 text-saffron" strokeWidth={2} />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green rounded-full border border-navy"></div>
        </button>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green/10 border border-green/20">
          <Circle className="w-1.5 h-1.5 fill-green text-green animate-pulse" />
          <span className="text-[11px] font-medium text-green">Online</span>
        </div>
      </div>
    </header>
  );
}