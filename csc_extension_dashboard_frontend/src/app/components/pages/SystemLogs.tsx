import { useState, useMemo } from 'react';
import { Search, Download, RefreshCw, Filter, AlertTriangle, Info, CheckCircle, XCircle, Terminal } from 'lucide-react';

const allLogs = [
  { id: 'LOG-2026-089234', level: 'INFO', service: 'AI Engine', message: 'Model inference completed for batch APP-BATCH-2026-0312 — 42 applications processed', timestamp: '2026-03-13 15:42:18', source: 'ai-engine-v2.3.1', duration: '1.24s' },
  { id: 'LOG-2026-089233', level: 'WARN', service: 'Data Sync', message: 'Slow response from Aadhaar verification API (latency: 4.2s). Threshold: 3s', timestamp: '2026-03-13 15:41:55', source: 'sync-service', duration: '4.2s' },
  { id: 'LOG-2026-089232', level: 'ERROR', service: 'Chrome Extension', message: 'Extension heartbeat missed for operator CSC-BR-031 (Patna). Connection timeout after 30s', timestamp: '2026-03-13 15:41:20', source: 'extension-gateway', duration: '—' },
  { id: 'LOG-2026-089231', level: 'INFO', service: 'API Gateway', message: 'Rate limit threshold reached for district: Varanasi. Auto-scaling initiated', timestamp: '2026-03-13 15:40:44', source: 'api-gateway', duration: '—' },
  { id: 'LOG-2026-089230', level: 'SUCCESS', service: 'Document Verify', message: 'Aadhaar verification successful for application APP-2026-034521 (operator: CSC-MH-001)', timestamp: '2026-03-13 15:40:12', source: 'doc-verify-service', duration: '0.87s' },
  { id: 'LOG-2026-089229', level: 'INFO', service: 'AI Engine', message: 'Model warm-up completed. Inference ready. GPU utilization: 62%', timestamp: '2026-03-13 15:39:50', source: 'ai-engine-v2.3.1', duration: '—' },
  { id: 'LOG-2026-089228', level: 'WARN', service: 'Database', message: 'PostgreSQL connection pool nearing capacity: 87/100 connections used', timestamp: '2026-03-13 15:39:22', source: 'db-pool-monitor', duration: '—' },
  { id: 'LOG-2026-089227', level: 'ERROR', service: 'Notification', message: 'SMS notification failed for citizen +91-XXXX-XXXX34. Provider: MSG91 error 503', timestamp: '2026-03-13 15:38:45', source: 'notification-service', duration: '—' },
  { id: 'LOG-2026-089226', level: 'SUCCESS', service: 'Application', message: 'Application APP-2026-034498 status updated to APPROVED. Sync to district portal complete', timestamp: '2026-03-13 15:38:10', source: 'application-service', duration: '0.45s' },
  { id: 'LOG-2026-089225', level: 'INFO', service: 'Data Sync', message: 'Daily data sync with NIC portal started. Syncing 1,243 records', timestamp: '2026-03-13 15:37:44', source: 'sync-service', duration: '—' },
  { id: 'LOG-2026-089224', level: 'WARN', service: 'AI Engine', message: 'Confidence score below threshold (0.78) for application APP-2026-034476. Flagged for human review', timestamp: '2026-03-13 15:37:18', source: 'ai-engine-v2.3.1', duration: '0.92s' },
  { id: 'LOG-2026-089223', level: 'INFO', service: 'Auth Service', message: 'Admin login successful. User: admin@csc.gov.in. IP: 192.168.1.45', timestamp: '2026-03-13 15:36:52', source: 'auth-service', duration: '—' },
  { id: 'LOG-2026-089222', level: 'SUCCESS', service: 'Chrome Extension', message: 'Extension v3.2.1 update deployed to 2,891 active operators', timestamp: '2026-03-13 15:36:20', source: 'extension-gateway', duration: '2.1s' },
  { id: 'LOG-2026-089221', level: 'ERROR', service: 'Document Verify', message: 'Income certificate OCR extraction failed for APP-2026-034445. Requesting manual upload', timestamp: '2026-03-13 15:35:44', source: 'doc-verify-service', duration: '—' },
  { id: 'LOG-2026-089220', level: 'INFO', service: 'Report Engine', message: 'Daily analytics report generated. Size: 2.4MB. Available for download', timestamp: '2026-03-13 15:35:10', source: 'report-engine', duration: '3.4s' },
];

const levelConfig: Record<string, { color: string; bg: string; icon: any; textColor: string }> = {
  INFO: { color: '#2563eb', bg: '#eff6ff', icon: Info, textColor: 'text-blue-700' },
  WARN: { color: '#d97706', bg: '#fffbeb', icon: AlertTriangle, textColor: 'text-amber-700' },
  ERROR: { color: '#dc2626', bg: '#fef2f2', icon: XCircle, textColor: 'text-red-700' },
  SUCCESS: { color: '#138808', bg: '#f0fdf4', icon: CheckCircle, textColor: 'text-green-700' },
};

export default function SystemLogs() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  const services = ['All', ...Array.from(new Set(allLogs.map(l => l.service))).sort()];

  const filtered = useMemo(() => allLogs.filter(log =>
    (levelFilter === 'All' || log.level === levelFilter) &&
    (serviceFilter === 'All' || log.service === serviceFilter) &&
    (search === '' || log.message.toLowerCase().includes(search.toLowerCase()) || log.id.toLowerCase().includes(search.toLowerCase()) || log.source.toLowerCase().includes(search.toLowerCase()))
  ), [search, levelFilter, serviceFilter]);

  const counts = {
    INFO: allLogs.filter(l => l.level === 'INFO').length,
    WARN: allLogs.filter(l => l.level === 'WARN').length,
    ERROR: allLogs.filter(l => l.level === 'ERROR').length,
    SUCCESS: allLogs.filter(l => l.level === 'SUCCESS').length,
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">System Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time system activity and error tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm">
            <Download size={15}/> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-white shadow-sm hover:opacity-90" style={{ backgroundColor: '#1e3a5f' }}>
            <RefreshCw size={15}/> Refresh
          </button>
        </div>
      </div>

      {/* Level Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(counts).map(([level, count]) => {
          const cfg = levelConfig[level];
          return (
            <button
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? 'All' : level)}
              className={`p-4 shadow-sm border text-left transition-all hover:shadow-md ${ levelFilter === level ? 'ring-2' : '' } rounded-[11px]`}
              style={levelFilter === level
                ? { backgroundColor: cfg.bg, borderColor: cfg.color, ringColor: cfg.color }
                : { backgroundColor: '#fff', borderColor: '#f1f5f9' }
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <cfg.icon size={16} style={{ color: cfg.color }}/>
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>{level}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{count}</div>
              <div className="text-xs text-gray-400">events today</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400"/>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none"
            >
              {services.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {allLogs.length} entries</span>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#0f172a' }}>
          <Terminal size={14} className="text-green-400"/>
          <span className="text-xs text-green-400 font-mono">csc-ai-platform — system logs — live</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            LIVE
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((log) => {
            const cfg = levelConfig[log.level];
            return (
              <div key={log.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="p-1.5 rounded h-fit flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                  <cfg.icon size={13} style={{ color: cfg.color }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${cfg.textColor}`} style={{ backgroundColor: cfg.bg }}>
                      {log.level}
                    </span>
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{log.service}</span>
                    <span className="text-xs text-gray-400 font-mono ml-auto">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-1">{log.message}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-mono">{log.id}</span>
                    <span>src: {log.source}</span>
                    {log.duration !== '—' && <span>⏱ {log.duration}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">
              No logs match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
