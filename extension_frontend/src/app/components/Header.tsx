import { useState, useEffect, useRef } from 'react';
import { Building2, Circle, Bot, RefreshCw, CheckCircle, AlertCircle, ChevronDown, Cloud, Laptop, Check } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

declare const chrome: any;

interface HeaderProps {
  onOpenAI: () => void;
}

export default function Header({ onOpenAI }: HeaderProps) {
  const { syncState, syncMsg, triggerSync } = useOfflineSync();
  const [activeUrl, setActiveUrl] = useState<string>('https://essumit-csc-extension.onrender.com');
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load backendUrl on mount
  useEffect(() => {
    const chromeGlobal = typeof chrome !== 'undefined' ? chrome : (window as any).chrome;
    if (chromeGlobal?.storage?.local) {
      chromeGlobal.storage.local.get(['backendUrl'], (items: any) => {
        if (items.backendUrl) {
          setActiveUrl(items.backendUrl);
        }
      });
    }
  }, []);

  // Periodic health check ping
  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${activeUrl}/api/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.status === 200 && active) {
          setStatus('online');
        } else if (active) {
          setStatus('offline');
        }
      } catch (err) {
        if (active) setStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000); // Check every 15s

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeUrl]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBackend = (url: string) => {
    setActiveUrl(url);
    setIsDropdownOpen(false);
    setStatus('checking');
    const chromeGlobal = typeof chrome !== 'undefined' ? chrome : (window as any).chrome;
    if (chromeGlobal?.storage?.local) {
      chromeGlobal.storage.local.set({ backendUrl: url });
    }
  };

  const syncTitle =
    syncState === 'loading'
      ? 'Sync चल रहा है...'
      : syncState === 'success'
        ? syncMsg || 'Sync हो गया'
        : syncState === 'error'
          ? syncMsg || 'Sync failed'
          : 'ऑफ़लाइन ऐप सिंक करें (Desktop App → form auto-fill)';

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-gradient-to-r from-navy to-[#1e2a3d] border-b border-white/5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron-deep flex items-center justify-center shadow-lg shadow-saffron/20">
          <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            CSC सहायक
          </h1>
          <p className="text-[10px] text-slate-400 leading-none font-medium">Digital Service Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={triggerSync}
          disabled={syncState === 'loading'}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
          title={syncTitle}
        >
          {syncState === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
          {syncState === 'success' && <CheckCircle className="w-3.5 h-3.5 text-green" strokeWidth={2} />}
          {syncState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />}
          {(syncState === 'idle' || !syncState) && <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>

        <button
          onClick={onOpenAI}
          className="w-9 h-9 rounded-md bg-gradient-to-br from-saffron/20 to-saffron/10 hover:from-saffron/30 hover:to-saffron/20 flex items-center justify-center transition-all duration-200 group relative border border-saffron/10"
          title="AI सहायक"
        >
          <Bot className="w-4 h-4 text-saffron" strokeWidth={2} />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green rounded-full border-2 border-navy"></div>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
              status === 'online'
                ? 'bg-green/10 border-green/20 text-green hover:bg-green/20'
                : status === 'checking'
                  ? 'bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20'
                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
            }`}
            title={`Active API: ${activeUrl}`}
          >
            <Circle className={`w-1.5 h-1.5 ${
              status === 'online'
                ? 'fill-green text-green animate-pulse'
                : status === 'checking'
                  ? 'fill-amber-400 text-amber-400 animate-bounce'
                  : 'fill-red-500 text-red-500'
            }`} />
            <span>
              {status === 'online'
                ? activeUrl.includes('localhost') || activeUrl.includes('127.0.0.1')
                  ? 'Local'
                  : 'Cloud'
                : status === 'checking'
                  ? 'Checking...'
                  : 'Offline'}
            </span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-navy border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-white/5 bg-white/5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Select API Backend</p>
              </div>
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => handleSelectBackend('https://essumit-csc-extension.onrender.com')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-colors duration-150 cursor-pointer ${
                    activeUrl === 'https://essumit-csc-extension.onrender.com'
                      ? 'bg-saffron text-navy font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5" />
                    Cloud API (Render)
                  </span>
                  {activeUrl === 'https://essumit-csc-extension.onrender.com' && <Check className="w-3 h-3 text-navy" strokeWidth={3} />}
                </button>
                <button
                  onClick={() => handleSelectBackend('http://127.0.0.1:5000')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-colors duration-150 cursor-pointer ${
                    activeUrl === 'http://127.0.0.1:5000'
                      ? 'bg-saffron text-navy font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5" />
                    Local API (Localhost)
                  </span>
                  {activeUrl === 'http://127.0.0.1:5000' && <Check className="w-3 h-3 text-navy" strokeWidth={3} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
