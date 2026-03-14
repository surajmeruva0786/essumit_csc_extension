import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, ChevronsUpDown, Users, TrendingUp, AlertTriangle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { getRecentSessions, type SessionDoc } from '../../api/activityApi';
import { formatDistanceToNow } from 'date-fns';

const SAMPLE_OPERATORS = [
  { id: 'CSC-MH-001', name: 'Rajesh Kumar', district: 'Pune', state: 'Maharashtra', submitted: 324, accepted: 266, acceptanceRate: 82, warnings: 12, lastActive: '2 min ago', status: 'active' },
  { id: 'CSC-UP-043', name: 'Anil Sharma', district: 'Lucknow', state: 'Uttar Pradesh', submitted: 289, accepted: 219, acceptanceRate: 76, warnings: 18, lastActive: '5 min ago', status: 'active' },
  { id: 'CSC-RJ-012', name: 'Priya Verma', district: 'Jaipur', state: 'Rajasthan', submitted: 412, accepted: 363, acceptanceRate: 88, warnings: 7, lastActive: '1 min ago', status: 'active' },
  { id: 'CSC-MP-067', name: 'Suresh Yadav', district: 'Bhopal', state: 'Madhya Pradesh', submitted: 178, accepted: 126, acceptanceRate: 71, warnings: 24, lastActive: '12 min ago', status: 'idle' },
  { id: 'CSC-GJ-034', name: 'Neha Patel', district: 'Ahmedabad', state: 'Gujarat', submitted: 356, accepted: 299, acceptanceRate: 84, warnings: 9, lastActive: '3 min ago', status: 'active' },
  { id: 'CSC-KA-089', name: 'Kavitha Reddy', district: 'Bengaluru', state: 'Karnataka', submitted: 445, accepted: 405, acceptanceRate: 91, warnings: 5, lastActive: '1 min ago', status: 'active' },
  { id: 'CSC-TN-023', name: 'Murugan S', district: 'Chennai', state: 'Tamil Nadu', submitted: 267, accepted: 211, acceptanceRate: 79, warnings: 15, lastActive: '8 min ago', status: 'active' },
  { id: 'CSC-WB-056', name: 'Debashish Roy', district: 'Kolkata', state: 'West Bengal', submitted: 198, accepted: 135, acceptanceRate: 68, warnings: 31, lastActive: '20 min ago', status: 'idle' },
];

const SERVICE_NAMES: Record<string, string> = {
  birth: 'Birth Certificate',
  death: 'Death Certificate',
  domicile: 'Domicile',
  income: 'Income Certificate',
  caste: 'Caste Certificate',
  'pension-old': 'Old Age Pension',
  'pension-widow': 'Widow Pension',
  kisan: 'Kisan Registration',
  ration: 'Ration Card',
  other: 'Other',
  default: 'Other',
};

function getServiceLabel(id: string): string {
  return SERVICE_NAMES[id] || id;
}

function getRiskLabel(session: SessionDoc): string {
  const r = session.aiValidationResult?.overallRisk;
  if (r === 'HIGH') return 'High';
  if (r === 'MEDIUM') return 'Medium';
  return 'Low';
}

function getWarningCount(session: SessionDoc): number {
  return session.aiValidationResult?.issues?.length ?? 0;
}

type SortKey = 'timestamp' | 'refId' | 'service' | 'risk' | 'warnings';
type SortDir = 'asc' | 'desc';

export default function OperatorActivity() {
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getRecentSessions(200);
      setSessions(data);
    } catch (e) {
      console.error('[OperatorActivity] Failed to load sessions', e);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Use sample data until 10+ Firebase sessions (keeps dashboard full)
  const MIN_SESSIONS_FOR_LIVE = 10;
  const useSampleData = sessions.length < MIN_SESSIONS_FOR_LIVE;

  const MINS_AGO = [2, 5, 1, 12, 3, 1, 8, 20];
  const displaySessions: SessionDoc[] = useSampleData
    ? SAMPLE_OPERATORS.map((op, i) => ({
          id: op.id,
          sessionId: op.id,
          refId: op.id,
          timestamp: new Date(Date.now() - (MINS_AGO[i] ?? 5) * 60 * 1000).toISOString(),
          citizenName: op.name,
          citizenPhone: null,
          serviceType: 'birth',
          extractedFields: {},
          confidenceScores: {},
          aiValidationResult: {
            overallRisk: op.acceptanceRate >= 80 ? 'LOW' : op.acceptanceRate >= 70 ? 'MEDIUM' : 'HIGH',
            issues: Array.from({ length: op.warnings }, () => ({ field: 'sample', severity: 'WARNING' })),
          },
          operatorDecision: 'SUBMITTED',
          operatorId: op.id,
        }))
    : sessions;

  useEffect(() => {
    loadSessions();
  }, []);

  const services = ['All', ...Array.from(new Set(displaySessions.map((s) => s.serviceType))).sort()];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    return displaySessions
      .filter(
        (s) =>
          (search === '' ||
            s.refId.toLowerCase().includes(search.toLowerCase()) ||
            (s.citizenName || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.citizenPhone || '').includes(search)) &&
          (serviceFilter === 'All' || s.serviceType === serviceFilter) &&
          (riskFilter === 'All' || getRiskLabel(s) === riskFilter)
      )
      .sort((a, b) => {
        const mult = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'timestamp')
          return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * mult;
        if (sortKey === 'refId') return (a.refId.localeCompare(b.refId)) * mult;
        if (sortKey === 'service') return (a.serviceType.localeCompare(b.serviceType)) * mult;
        if (sortKey === 'risk')
          return (
            (getRiskLabel(a).localeCompare(getRiskLabel(b))) * mult
          );
        if (sortKey === 'warnings') return (getWarningCount(a) - getWarningCount(b)) * mult;
        return 0;
      }      );
  }, [displaySessions, search, serviceFilter, riskFilter, sortKey, sortDir]);

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown size={13} className="text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-blue-600" /> : <ChevronDown size={13} className="text-blue-600" />;
  };

  const highRiskCount = displaySessions.filter((s) => getRiskLabel(s) === 'High').length;
  const totalWarnings = displaySessions.reduce((s, sum) => sum + getWarningCount(s), 0);
  const lowRiskCount = displaySessions.filter((s) => getRiskLabel(s) === 'Low').length;
  const acceptanceRate = displaySessions.length > 0 ? Math.round((lowRiskCount / displaySessions.length) * 100) : 82;

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">CSC Operator Activity</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor performance of all registered CSC operators</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSessions}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: displaySessions.length, icon: Users, color: '#138808', bg: '#f0fdf4' },
          { label: 'Recent Activity', value: filtered.length, icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Acceptance Rate', value: `${acceptanceRate}%`, icon: TrendingUp, color: '#d97706', bg: '#fffbeb' },
          { label: 'Total AI Warnings', value: totalWarnings, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon size={20} style={{ color: kpi.color }}/>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Ref ID, citizen name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:border-blue-400"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Services' : getServiceLabel(s)}
                </option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:border-blue-400"
            >
              {['All', 'High', 'Medium', 'Low'].map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Risk' : s}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500 ml-auto">{filtered.length} sessions</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" /> Loading activity from Firebase...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer" onClick={() => toggleSort('refId')}>
                    <span className="flex items-center gap-1">Ref ID <SortIcon k="refId" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Citizen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer" onClick={() => toggleSort('service')}>
                    <span className="flex items-center gap-1">Service <SortIcon k="service" /></span>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer" onClick={() => toggleSort('risk')}>
                    <span className="flex items-center justify-end gap-1">Risk <SortIcon k="risk" /></span>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer" onClick={() => toggleSort('warnings')}>
                    <span className="flex items-center justify-end gap-1">Warnings <SortIcon k="warnings" /></span>
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer" onClick={() => toggleSort('timestamp')}>
                    <span className="flex items-center justify-end gap-1">Submitted <SortIcon k="timestamp" /></span>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Operator</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.sessionId} className={`border-t border-gray-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="font-mono text-gray-800 text-xs">{s.refId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 text-sm">{s.citizenName || '-'}</div>
                      <div className="text-xs text-gray-400">{s.citizenPhone || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{getServiceLabel(s.serviceType)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          getRiskLabel(s) === 'High' ? 'bg-red-100 text-red-700' :
                          getRiskLabel(s) === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                        {getRiskLabel(s)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          getWarningCount(s) > 5 ? 'text-red-600' : getWarningCount(s) > 2 ? 'text-orange-500' : 'text-green-600'
                        }`}
                      >
                        {getWarningCount(s)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-500 flex items-center justify-end gap-1.5">
                      <Clock size={11} />
                      {formatDistanceToNow(new Date(s.timestamp), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500">{s.operatorId || '—'}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                      No Firebase sessions yet. Sample data shown above when no extension activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
