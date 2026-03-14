import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, TrendingDown, FileSearch, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const rejectionReasons = [
  { reason: 'Income Exceeds Eligibility', count: 4230, percent: 34, color: '#ef4444', trend: '+2%' },
  { reason: 'Aadhaar Mismatch', count: 3480, percent: 28, color: '#f97316', trend: '-1%' },
  { reason: 'Missing Certificate', count: 2740, percent: 22, color: '#3b82f6', trend: '+0.5%' },
  { reason: 'Address Inconsistency', count: 1990, percent: 16, color: '#8b5cf6', trend: '-1.5%' },
];

const rejectionByService = [
  { service: 'Old Age Pension', rejections: 1240, rate: '28%' },
  { service: 'Widow Pension', rejections: 980, rate: '24%' },
  { service: 'Caste Certificate', rejections: 760, rate: '19%' },
  { service: 'Income Certificate', rejections: 640, rate: '22%' },
  { service: 'Birth Certificate', rejections: 420, rate: '12%' },
  { service: 'Residence Certificate', rejections: 380, rate: '15%' },
];

const monthlyRejections = [
  { month: 'Oct', rejections: 3100, predicted: 3205 },
  { month: 'Nov', rejections: 2810, predicted: 2905 },
  { month: 'Dec', rejections: 3415, predicted: 3312 },
  { month: 'Jan', rejections: 2620, predicted: 2715 },
  { month: 'Feb', rejections: 2950, predicted: 2845 },
  { month: 'Mar', rejections: 1820, predicted: 1915 },
];

const recentRejections = [
  { appId: 'APP-2026-034521', service: 'Old Age Pension', district: 'Varanasi', reason: 'Income Exceeds Eligibility', date: '13 Mar 2026', confidence: '94%' },
  { appId: 'APP-2026-034498', service: 'Widow Pension', district: 'Agra', reason: 'Missing Certificate', date: '13 Mar 2026', confidence: '89%' },
  { appId: 'APP-2026-034476', service: 'Caste Certificate', district: 'Patna', reason: 'Aadhaar Mismatch', date: '13 Mar 2026', confidence: '97%' },
  { appId: 'APP-2026-034445', service: 'Birth Certificate', district: 'Surat', reason: 'Address Inconsistency', date: '13 Mar 2026', confidence: '82%' },
  { appId: 'APP-2026-034432', service: 'Income Certificate', district: 'Indore', reason: 'Income Exceeds Eligibility', date: '13 Mar 2026', confidence: '91%' },
  { appId: 'APP-2026-034411', service: 'Old Age Pension', district: 'Bhopal', reason: 'Missing Certificate', date: '13 Mar 2026', confidence: '88%' },
];

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

export default function RejectionInsights() {
  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Rejection Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-predicted rejection analysis & patterns</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <AlertTriangle size={14}/>
            <span>1,243 active warnings today</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Predicted Rejections', value: '12,440', sub: 'This month', color: '#ef4444', bg: '#fef2f2', icon: AlertTriangle },
          { label: 'Actual Rejections', value: '10,100', sub: 'Confirmed by officials', color: '#f97316', bg: '#fff7ed', icon: FileSearch },
          { label: 'AI Prediction Accuracy', value: '91.2%', sub: 'Model confidence', color: '#138808', bg: '#f0fdf4', icon: TrendingDown },
          { label: 'Warnings Resolved', value: '8,890', sub: 'Operator action taken', color: '#2563eb', bg: '#eff6ff', icon: ChevronRight },
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Rejection Reasons Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-gray-800 mb-4">Top Rejection Reasons</h3>
          <div className="flex items-center gap-4 mb-4">
            <PieChart width={160} height={160}>
              <Pie data={rejectionReasons} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="percent" isAnimationActive={false}>
                {rejectionReasons.map((entry, i) => (
                  <Cell key={`rejection-cell-${entry.reason}`} fill={entry.color} stroke="none"/>
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-3">
              {rejectionReasons.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}/>
                      <span className="text-xs font-medium text-gray-700">{item.reason}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold" style={{ color: item.color }}>{item.percent}%</span>
                      <span className="text-xs text-gray-400">({item.trend})</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-4">
                    <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-gray-800 mb-4">Actual vs Predicted Rejections</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRejections} barSize={18}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
              <YAxis key="y-axis" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}k`}/>
              <Tooltip key="tooltip" content={<CustomTooltip/>}/>
              <Bar key="bar-rejections" dataKey="rejections" name="Actual" fill="#ef4444" radius={[4,4,0,0]} isAnimationActive={false}/>
              <Bar key="bar-predicted" dataKey="predicted" name="Predicted" fill="#f97316" radius={[4,4,0,0]} opacity={0.6} isAnimationActive={false}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] inline-block"/><span>Actual</span></div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] inline-block opacity-60"/><span>Predicted</span></div>
          </div>
        </div>
      </div>

      {/* Rejection by Service */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-gray-800 mb-4">Rejection Rate by Service Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {rejectionByService.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{item.service}</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{item.rate}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-red-400" style={{ width: item.rate }}/>
                </div>
                <span className="text-xs text-gray-500">{item.rejections.toLocaleString()} cases</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Rejections Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-gray-800">Recent Predicted Rejections</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1" onClick={() => toast.info('Loading all rejection records...')}>
            View all <ChevronRight size={14}/>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                {['Application ID', 'Service', 'District', 'Rejection Reason', 'Date', 'AI Confidence'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRejections.map((row, i) => (
                <tr key={i} className={`border-t border-gray-50 hover:bg-red-50/20 transition-colors`}>
                  <td className="px-5 py-3 font-mono text-xs text-blue-600 font-medium">{row.appId}</td>
                  <td className="px-5 py-3 text-gray-700">{row.service}</td>
                  <td className="px-5 py-3 text-gray-600">{row.district}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">{row.reason}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{row.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${parseInt(row.confidence) >= 90 ? 'text-red-600' : 'text-orange-500'}`}>
                      {row.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}