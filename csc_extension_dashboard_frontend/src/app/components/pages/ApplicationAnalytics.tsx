import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Download, TrendingUp, TrendingDown, FileCheck, FileClock, FileX } from 'lucide-react';
import { toast } from 'sonner';

const monthlyData = [
  { month: 'Apr', total: 42300, approved: 32100, rejected: 7200, pending: 3000 },
  { month: 'May', total: 45800, approved: 34500, rejected: 7800, pending: 3500 },
  { month: 'Jun', total: 39200, approved: 29800, rejected: 6900, pending: 2500 },
  { month: 'Jul', total: 51400, approved: 39200, rejected: 8500, pending: 3700 },
  { month: 'Aug', total: 48900, approved: 37500, rejected: 8100, pending: 3300 },
  { month: 'Sep', total: 55200, approved: 42800, rejected: 8920, pending: 3510 },
  { month: 'Oct', total: 61200, approved: 47800, rejected: 9200, pending: 4200 },
  { month: 'Nov', total: 58400, approved: 44600, rejected: 9400, pending: 4400 },
  { month: 'Dec', total: 62100, approved: 48900, rejected: 8960, pending: 4300 },
  { month: 'Jan', total: 67500, approved: 52400, rejected: 10200, pending: 4900 },
  { month: 'Feb', total: 72300, approved: 56200, rejected: 11100, pending: 5000 },
  { month: 'Mar', total: 38500, approved: 29850, rejected: 5800, pending: 2900 },
];

const weeklyRate = [
  { week: 'W1 Jan', rate: 76.2 },
  { week: 'W2 Jan', rate: 77.8 },
  { week: 'W3 Jan', rate: 75.1 },
  { week: 'W4 Jan', rate: 78.4 },
  { week: 'W1 Feb', rate: 79.2 },
  { week: 'W2 Feb', rate: 80.1 },
  { week: 'W3 Feb', rate: 78.6 },
  { week: 'W4 Feb', rate: 79.9 },
  { week: 'W1 Mar', rate: 81.2 },
  { week: 'W2 Mar', rate: 78.3 },
];

const stateData = [
  { state: 'Maharashtra', applications: 18400, approved: 15200, rate: '82.6%' },
  { state: 'Uttar Pradesh', applications: 22100, approved: 16500, rate: '74.7%' },
  { state: 'Rajasthan', applications: 14300, approved: 11400, rate: '79.7%' },
  { state: 'Madhya Pradesh', applications: 12800, approved: 9400, rate: '73.4%' },
  { state: 'Gujarat', applications: 11900, approved: 10200, rate: '85.7%' },
  { state: 'Karnataka', applications: 10400, approved: 9100, rate: '87.5%' },
  { state: 'Tamil Nadu', applications: 9800, approved: 8200, rate: '83.7%' },
  { state: 'West Bengal', applications: 13200, approved: 9400, rate: '71.2%' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-xs">
            {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ApplicationAnalytics() {
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Application Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Detailed submission and approval trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            {['monthly', 'weekly', 'daily'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  period === p ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={period === p ? { backgroundColor: '#1e3a5f' } : {}}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-sm" onClick={() => toast.promise(
              new Promise((resolve) => setTimeout(resolve, 1500)),
              {
                loading: 'Preparing export...',
                success: 'Analytics data exported successfully!',
                error: 'Failed to export data',
              }
            )}>
            <Download size={15}/>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total This Year', value: '6,43,100', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Total Approved', value: '4,89,200', icon: FileCheck, color: '#138808', bg: '#f0fdf4' },
          { label: 'Total Pending', value: '43,200', icon: FileClock, color: '#d97706', bg: '#fffbeb' },
          { label: 'Total Rejected', value: '1,10,700', icon: FileX, color: '#dc2626', bg: '#fef2f2' },
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

      {/* Area Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-gray-800">Monthly Application Volume</h3>
          <p className="text-xs text-gray-500 mt-0.5">Apr 2025 – Mar 2026</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyData}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
            <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
            <Tooltip key="tooltip" content={<CustomTooltip/>}/>
            <Area key="area-approved" type="monotone" dataKey="approved" name="Approved" stroke="#138808" strokeWidth={2} fill="#138808" fillOpacity={0.12} isAnimationActive={false}/>
            <Area key="area-rejected" type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.10} isAnimationActive={false}/>
            <Area key="area-pending" type="monotone" dataKey="pending" name="Pending" stroke="#FF9933" strokeWidth={1.5} fill="none" strokeDasharray="4 2" isAnimationActive={false}/>
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#138808] inline-block"/><span>Approved</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] inline-block"/><span>Rejected</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF9933] inline-block"/><span>Pending</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Weekly Acceptance Rate */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-gray-800">Weekly Acceptance Rate</h3>
            <p className="text-xs text-gray-500 mt-0.5">Jan – Mar 2026</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyRate}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis key="x-axis" dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
              <YAxis key="y-axis" domain={[70, 85]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/>
              <Tooltip key="tooltip" formatter={(val: any) => [`${val}%`, 'Acceptance Rate']}/>
              <Line key="line-rate" type="monotone" dataKey="rate" name="Rate" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3, fill: '#1e3a5f' }} isAnimationActive={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* State-wise Performance */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-gray-800">State-wise Performance</h3>
            <p className="text-xs text-gray-500 mt-0.5">Applications & acceptance rates</p>
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-[200px] pr-1">
            {stateData.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{s.state}</span>
                    <span className="text-xs font-semibold text-green-700">{s.rate}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: s.rate, backgroundColor: '#1e3a5f' }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-14 text-right">{(s.applications / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}