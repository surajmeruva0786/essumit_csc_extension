import { Building2, Circle, Bot, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface HeaderProps {
  onOpenAI: () => void;
}

export default function Header({ onOpenAI }: HeaderProps) {
  const { syncState, syncMsg, triggerSync } = useOfflineSync();

  const syncTitle =
    syncState === 'loading'
      ? 'Sync चल रहा है...'
      : syncState === 'success'
        ? syncMsg || 'Sync हो गया'
        : syncState === 'error'
          ? syncMsg || 'Sync failed'
          : 'ऑफ़लाइन ऐप सिंक करें (Desktop App → form auto-fill)';

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

      <div className="flex items-center gap-1.5">
        {/* Offline Sync – small icon button, top right */}
        <button
          onClick={triggerSync}
          disabled={syncState === 'loading'}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors border border-slate-500/50 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
          title={syncTitle}
        >
          {syncState === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
          {syncState === 'success' && <CheckCircle className="w-3.5 h-3.5 text-green" strokeWidth={2} />}
          {syncState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />}
          {(syncState === 'idle' || !syncState) && <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>

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