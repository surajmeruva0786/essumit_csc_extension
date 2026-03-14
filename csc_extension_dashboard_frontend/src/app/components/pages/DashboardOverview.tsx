import { useState, useEffect } from 'react';
import folderFilesImg from '../../../assets/3d5c53e7ff6eb0f0ef371df02dc1a47255339082.png';
import warningImg from '../../../assets/33ff4940dc520f1800d6231d06b2526f524e6466.png';
import operatorImg from '../../../assets/8bff0e9c8e75280c706ba071ac18c3e825858a6c.png';
import trendingImg from '../../../assets/095f4d4c301603c5d35bfdb7025dc66c31bbe3f9.png';
import { getAggregatedStats, getRecentSessions } from '../../api/activityApi';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FileStack, TrendingUp, AlertCircle, UserCheck, ArrowUp, ArrowDown,
  Download, RefreshCw, Filter, ChevronRight, AlertTriangle, X
} from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';

const appOverTimeData = [
  { date: 'Mar 1', submissions: 2840 },
  { date: 'Mar 2', submissions: 3120 },
  { date: 'Mar 3', submissions: 2978 },
  { date: 'Mar 4', submissions: 3450 },
  { date: 'Mar 5', submissions: 3210 },
  { date: 'Mar 6', submissions: 2750 },
  { date: 'Mar 7', submissions: 3750 },
  { date: 'Mar 8', submissions: 3560 },
  { date: 'Mar 9', submissions: 4100 },
  { date: 'Mar 10', submissions: 3780 },
  { date: 'Mar 11', submissions: 3310 },
  { date: 'Mar 12', submissions: 3895 },
  { date: 'Mar 13', submissions: 3640 },
];

const acceptanceData = [
  { month: 'Oct', approved: 12405, rejected: 3100, pending: 1200 },
  { month: 'Nov', approved: 13800, rejected: 2805, pending: 1500 },
  { month: 'Dec', approved: 11200, rejected: 3400, pending: 910 },
  { month: 'Jan', approved: 14500, rejected: 2600, pending: 1105 },
  { month: 'Feb', approved: 15200, rejected: 2910, pending: 1300 },
  { month: 'Mar', approved: 9805, rejected: 1805, pending: 785 },
];

const topServicesData = [
  { service: 'Birth Certificate', count: 28500, fill: '#1e3a5f' },
  { service: 'Caste Certificate', count: 24300, fill: '#2d5a9b' },
  { service: 'Residence Certificate', count: 19800, fill: '#3b82f6' },
  { service: 'Widow Pension', count: 15600, fill: '#6366f1' },
  { service: 'Old Age Pension', count: 12410, fill: '#8b5cf6' },
  { service: 'Income Certificate', count: 9810, fill: '#a78bfa' },
];

const errorData = [
  { name: 'Document Mismatch', value: 34, color: '#ef4444' },
  { name: 'Eligibility Violation', value: 28, color: '#f97316' },
  { name: 'Missing Documents', value: 22, color: '#3b82f6' },
  { name: 'Incorrect Field Values', value: 16, color: '#8b5cf6' },
];

const operatorData = [
  { id: 'CSC-MH-001', district: 'Pune', submitted: 324, acceptanceRate: '82%', warnings: 12, lastActive: '2 min ago', status: 'active' },
  { id: 'CSC-UP-043', district: 'Lucknow', submitted: 289, acceptanceRate: '76%', warnings: 18, lastActive: '5 min ago', status: 'active' },
  { id: 'CSC-RJ-012', district: 'Jaipur', submitted: 412, acceptanceRate: '88%', warnings: 7, lastActive: '1 min ago', status: 'active' },
  { id: 'CSC-MP-067', district: 'Bhopal', submitted: 178, acceptanceRate: '71%', warnings: 24, lastActive: '12 min ago', status: 'idle' },
  { id: 'CSC-GJ-034', district: 'Ahmedabad', submitted: 356, acceptanceRate: '84%', warnings: 9, lastActive: '3 min ago', status: 'active' },
  { id: 'CSC-KA-089', district: 'Bengaluru', submitted: 445, acceptanceRate: '91%', warnings: 5, lastActive: '1 min ago', status: 'active' },
  { id: 'CSC-TN-023', district: 'Chennai', submitted: 267, acceptanceRate: '79%', warnings: 15, lastActive: '8 min ago', status: 'active' },
  { id: 'CSC-WB-056', district: 'Kolkata', submitted: 198, acceptanceRate: '68%', warnings: 31, lastActive: '20 min ago', status: 'idle' },
];

const rejectionReasons = [
  { reason: 'Income Exceeds Eligibility', percent: 34, color: '#ef4444' },
  { reason: 'Aadhaar Mismatch', percent: 28, color: '#f97316' },
  { reason: 'Missing Certificate', percent: 22, color: '#3b82f6' },
  { reason: 'Address Inconsistency', percent: 16, color: '#8b5cf6' },
];

const StatCard = ({
  title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendValue, accentColor
}: {
  title: string; value: string; subtitle: string; icon: any;
  iconBg: string; iconColor: string; trend?: 'up' | 'down'; trendValue?: string; accentColor?: string;
}) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: accentColor || '#1e3a5f' }}/>
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 rounded-lg" style={{ backgroundColor: iconBg }}>
        {(() => {
          if (Icon === FileStack) {
            return (
              <img
                src={folderFilesImg}
                alt="Applications"
                style={{
                  width: 26,
                  height: 26,
                  objectFit: 'contain',
                  filter: `drop-shadow(0 2px 5px ${iconColor}88)`,
                }}
              />
            );
          }
          if (Icon === AlertCircle) {
            return (
              <img
                src={warningImg}
                alt="Warnings"
                style={{
                  width: 26,
                  height: 26,
                  objectFit: 'contain',
                  filter: `drop-shadow(0 2px 6px ${iconColor}99) drop-shadow(0 1px 2px ${iconColor}55)`,
                }}
              />
            );
          }
          if (Icon === UserCheck) {
            return (
              <img
                src={operatorImg}
                alt="Active Operators"
                style={{
                  width: 26,
                  height: 26,
                  objectFit: 'contain',
                  filter: `drop-shadow(0 2px 5px ${iconColor}88)`,
                }}
              />
            );
          }
          if (Icon === TrendingUp) {
            return (
              <img
                src={trendingImg}
                alt="Acceptance Rate"
                style={{
                  width: 26,
                  height: 26,
                  objectFit: 'contain',
                  filter: `drop-shadow(0 2px 5px ${iconColor}88)`,
                }}
              />
            );
          }
          return (
            <Icon
              size={24}
              strokeWidth={1.75}
              style={{
                color: iconColor,
                filter: `drop-shadow(0 2px 6px ${iconColor}99) drop-shadow(0 1px 2px ${iconColor}55)`,
              }}
            />
          );
        })()}
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {trend === 'up' ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
          {trendValue}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold mb-1" style={{ color: '#1e3a5f' }}>{value}</div>
    <div className="text-sm font-medium text-gray-700 mb-0.5">{title}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-xs">
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MIN_SESSIONS_FOR_LIVE_VIEW = 50; // Show sample data until enough Firebase sessions
const USE_SAMPLE_DATA = (stats: { totalSessions: number } | null) =>
  !stats || stats.totalSessions < MIN_SESSIONS_FOR_LIVE_VIEW;

const SERVICE_NAMES: Record<string, string> = {
  birth: 'Birth Certificate',
  death: 'Death Certificate',
  domicile: 'Residence Certificate',
  income: 'Income Certificate',
  caste: 'Caste Certificate',
  'pension-old': 'Old Age Pension',
  'pension-widow': 'Widow Pension',
  kisan: 'Kisan Registration',
  ration: 'Ration Card',
  other: 'Other',
  default: 'Other',
};

export default function DashboardOverview() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAggregatedStats>> | null>(null);
  const [operatorSessions, setOperatorSessions] = useState<Awaited<ReturnType<typeof getRecentSessions>>>([]);

  const loadData = async () => {
    try {
      const [s, sessions] = await Promise.all([getAggregatedStats(), getRecentSessions(50)]);
      setStats(s);
      setOperatorSessions(sessions);
    } catch (e) {
      console.warn('[DashboardOverview] Failed to load Firebase data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
      toast.success('Dashboard refreshed successfully!');
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Preparing export...',
        success: 'Dashboard data exported successfully!',
        error: 'Failed to export data',
      }
    );
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    toast.success('Filters applied successfully!');
  };

  const handleViewAllOperators = () => {
    toast.info('Navigating to Operator Activity page...');
  };

  const handleViewDetailedReport = () => {
    toast.info('Navigating to Rejection Insights page...');
  };

  const handleLoadSync = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/sync/get_staged');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      if (data.status === 'success' && data.data) {
        // Send to content script to auto-fill
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'FILL_FORM_DESKTOP', // Special action for desktop sync
                data: JSON.parse(data.data.fields_json)
              });
              toast.success('Offline data loaded! Auto-filling form...');
            } else {
              toast.error('Could not find active form tab.');
            }
          });
        } else {
          toast.info(`Running outside extension. Data: ${data.data.applicant_name}`);
        }
      } else {
        toast.error('No pending synced applications found.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect to Local Desktop App.');
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-7 rounded-full" style={{ backgroundColor: '#FF9933' }}/>
            <div>
              <h1 style={{ color: '#0c2461' }}>Dashboard Overview</h1>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280', fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                डैशबोर्ड अवलोकन · Friday, 13 March 2026 · Real-time monitoring
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* New Button for Offline Sync Handshake */}
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm rounded text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1A7A38, #2E9E50)' }}
            onClick={handleLoadSync}
          >
            <Download size={15}/><span>Load Offline Sync ⚡</span>
          </button>
          
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm rounded border transition-colors shadow-sm"
            style={{ borderColor: '#d1d5db', backgroundColor: '#fff', color: '#374151' }}
            onClick={() => setIsFilterOpen(true)}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#eef2f7'; e.currentTarget.style.borderColor = '#1a4592'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >
            <Filter size={15}/><span>Filter</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm rounded border transition-colors shadow-sm"
            style={{ borderColor: '#d1d5db', backgroundColor: '#fff', color: '#374151' }}
            onClick={handleExport}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#eef2f7'; e.currentTarget.style.borderColor = '#1a4592'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >
            <Download size={15}/><span>Export</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm rounded text-white shadow-sm transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#1a4592' }}
            onClick={handleRefresh}
            disabled={refreshing}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0c2461')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a4592')}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/><span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-50 max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-bold text-gray-800">Filter Dashboard</Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">States</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {['Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Gujarat'].map(state => (
                    <label key={state} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStates([...selectedStates, state]);
                          } else {
                            setSelectedStates(selectedStates.filter(s => s !== state));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-gray-700">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  {['Approved', 'Rejected', 'Pending'].map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, status]);
                          } else {
                            setSelectedStatus(selectedStatus.filter(s => s !== status));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setSelectedStates([]);
                    setSelectedStatus([]);
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 text-sm rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#1e3a5f' }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Stat Cards — sample data until 50+ Firebase sessions, then live data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications Submitted"
          value={USE_SAMPLE_DATA(stats) ? '1,24,567' : (stats!.totalSessions.toLocaleString())}
          subtitle={USE_SAMPLE_DATA(stats) ? 'Today: 3,421 • This week: 23,890' : `Today: ${stats!.todayCount} • This week: ${stats!.weekCount}`}
          icon={FileStack}
          iconBg="#eef2f7"
          iconColor="#1a4592"
          trend={USE_SAMPLE_DATA(stats) ? 'up' : undefined}
          trendValue={USE_SAMPLE_DATA(stats) ? '+8.2%' : undefined}
          accentColor="#1a4592"
        />
        <StatCard
          title="Acceptance Rate"
          value={USE_SAMPLE_DATA(stats) ? '78.4%' : `${stats!.acceptanceRate}%`}
          subtitle="Applications approved"
          icon={TrendingUp}
          iconBg="#f0fdf4"
          iconColor="#138808"
          trend={USE_SAMPLE_DATA(stats) ? 'up' : undefined}
          trendValue={USE_SAMPLE_DATA(stats) ? '+2.3%' : undefined}
          accentColor="#138808"
        />
        <StatCard
          title="Rejection Warnings"
          value={USE_SAMPLE_DATA(stats) ? '1,243' : stats!.totalWarnings.toLocaleString()}
          subtitle="AI predicted rejection alerts"
          icon={AlertCircle}
          iconBg="#fff7ed"
          iconColor="#ea580c"
          trend={USE_SAMPLE_DATA(stats) ? 'down' : undefined}
          trendValue={USE_SAMPLE_DATA(stats) ? '-4.1%' : undefined}
          accentColor="#FF9933"
        />
        <StatCard
          title="Active CSC Operators"
          value={USE_SAMPLE_DATA(stats) ? '2,891' : String(stats!.activeOperatorCount)}
          subtitle="Using extension today"
          icon={UserCheck}
          iconBg="#eef2f7"
          iconColor="#1a4592"
          trend={USE_SAMPLE_DATA(stats) ? 'up' : undefined}
          trendValue={USE_SAMPLE_DATA(stats) ? '+124' : undefined}
          accentColor="#0c2461"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Applications Over Time */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800">Applications Over Time</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daily submission trends — last 13 days</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-gray-50 focus:outline-none">
              <option>Last 13 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={USE_SAMPLE_DATA(stats) || !stats?.sessionsByDate?.length ? appOverTimeData : stats.sessionsByDate.map((d) => ({ date: d.date.slice(5), submissions: d.count }))}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis key="x-axis" dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
              <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString()}/>
              <Tooltip key="tooltip" content={<CustomTooltip/>}/>
              <Line key="line-submissions" type="monotone" dataKey="submissions" name="Submissions" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3, fill: '#1e3a5f' }} activeDot={{ r: 5 }} isAnimationActive={false}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#1e3a5f] inline-block rounded"/><span>Submissions</span></div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="inline-block w-5 border-t-2 border-dashed border-[#FF9933]"/><span>Daily Target (3k)</span></div>
          </div>
        </div>

        {/* AI Error Detection */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-gray-800">AI Error Detection</h3>
            <p className="text-xs text-gray-500 mt-0.5">Error category breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie key="pie-errors" data={errorData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" isAnimationActive={false}>
                {errorData.map((entry, i) => (
                  <Cell key={`error-cell-${entry.name}-${i}`} fill={entry.color} stroke="none"/>
                ))}
              </Pie>
              <Tooltip key="tooltip" formatter={(value: any) => [`${value}%`, '']}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {errorData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}/>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
        {/* Top Services */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800">Top Services Requested</h3>
              <p className="text-xs text-gray-500 mt-0.5">By total application volume</p>
            </div>
          </div>
          {/* Custom CSS horizontal bars — no Recharts to avoid key collision */}
          <div className="space-y-3 py-1">
            {(() => {
              const topServicesArray =
                !USE_SAMPLE_DATA(stats) && stats?.byService && Object.keys(stats.byService).length > 0
                  ? Object.entries(stats.byService)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([service, count], i) => ({
                        service: SERVICE_NAMES[service] || service,
                        count,
                        fill: ['#1e3a5f', '#2d5a9b', '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa'][i] || '#1e3a5f',
                      }))
                  : topServicesData;
              const maxCount = topServicesArray[0]?.count ?? 1;
              return topServicesArray.map((item, i) => {
                const widthPct = (item.count / maxCount) * 100;
                return (
                  <div key={`svc-${i}`} className="flex items-center gap-3">
                    <div className="w-36 text-xs text-gray-600 text-right flex-shrink-0 truncate">{item.service}</div>
                    <div className="flex-1 h-5 bg-gray-100 rounded-r-full overflow-hidden">
                      <div
                        className="h-full rounded-r-full"
                        style={{ width: `${widthPct}%`, backgroundColor: item.fill }}
                      />
                    </div>
                    <div className="w-12 text-xs text-gray-500 text-right flex-shrink-0">
                      {item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Operator Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 style={{ color: '#0c2461' }}>Operator Activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">CSC operator performance & AI warning tracking</p>
          </div>
          <button
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: '#1a4592' }}
            onClick={handleViewAllOperators}
            onMouseEnter={e => (e.currentTarget.style.color = '#0c2461')}
            onMouseLeave={e => (e.currentTarget.style.color = '#1a4592')}
          >
            View All <ChevronRight size={14}/>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#eef2f7' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a4592' }}>Operator ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a4592' }}>District</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a4592' }}>Submitted</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a4592' }}>Accept Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a4592' }}>AI Warnings</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a4592' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {(!USE_SAMPLE_DATA(stats) && operatorSessions.length > 0
              ? operatorSessions.slice(0, 8).map((s) => {
                  const risk = s.aiValidationResult?.overallRisk || 'LOW';
                  const warnings = s.aiValidationResult?.issues?.length ?? 0;
                  const approved = risk === 'LOW' || risk === 'MEDIUM';
                  return {
                    id: s.refId,
                    district: s.citizenName || '—',
                    submitted: 1,
                    acceptanceRate: approved ? '85%' : '65%',
                    warnings,
                    lastActive: new Date(s.timestamp).toLocaleDateString(),
                    status: 'active' as const,
                  };
                })
              : operatorData
            ).map((op, i) => (
                <tr key={op.id} className={`border-t border-gray-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}`}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eef2f7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ffffff' : '#f8fafc')}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${op.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}/>
                      <span className="font-medium" style={{ color: '#0c2461' }}>{op.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{op.district}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{op.submitted}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      parseInt(op.acceptanceRate) >= 80 ? 'bg-green-100 text-green-700' :
                      parseInt(op.acceptanceRate) >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {op.acceptanceRate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${op.warnings > 20 ? 'text-red-600' : op.warnings > 10 ? 'text-orange-500' : 'text-green-600'}`}>
                      {op.warnings}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">{op.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Insights Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ color: '#0c2461' }}>Rejection Insights</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top reasons for predicted rejection by AI</p>
          </div>
          <button
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: '#1a4592' }}
            onClick={handleViewDetailedReport}
            onMouseEnter={e => (e.currentTarget.style.color = '#0c2461')}
            onMouseLeave={e => (e.currentTarget.style.color = '#1a4592')}
          >
            Detailed Report <ChevronRight size={14}/>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {rejectionReasons.map((item, i) => (
            <div key={i} className="rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }}/>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                  <AlertTriangle size={16} style={{ color: item.color }}/>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">{item.reason}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.percent}%`, backgroundColor: item.color }}/>
                    </div>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.percent}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}