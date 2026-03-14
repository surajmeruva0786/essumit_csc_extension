import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Cpu, CheckCircle, Zap, Target, RefreshCw, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const accuracyData = [
  { date: 'Oct', precision: 87.2, recall: 84.1, f1: 85.6, accuracy: 88.1 },
  { date: 'Nov', precision: 88.4, recall: 85.3, f1: 86.8, accuracy: 89.2 },
  { date: 'Dec', precision: 89.1, recall: 86.2, f1: 87.6, accuracy: 89.8 },
  { date: 'Jan', precision: 90.2, recall: 87.4, f1: 88.8, accuracy: 90.9 },
  { date: 'Feb', precision: 90.8, recall: 88.1, f1: 89.4, accuracy: 91.4 },
  { date: 'Mar', precision: 91.2, recall: 88.7, f1: 89.9, accuracy: 91.8 },
];

const radarData = [
  { metric: 'Precision', value: 91.2 },
  { metric: 'Recall', value: 88.7 },
  { metric: 'F1 Score', value: 89.9 },
  { metric: 'Specificity', value: 93.4 },
  { metric: 'AUC-ROC', value: 94.1 },
  { metric: 'Accuracy', value: 91.8 },
];

const inferenceData = [
  { hour: '00:00', latency: 42, requests: 120 },
  { hour: '03:00', latency: 38, requests: 80 },
  { hour: '06:00', latency: 45, requests: 340 },
  { hour: '09:00', latency: 67, requests: 1240 },
  { hour: '12:00', latency: 78, requests: 1680 },
  { hour: '15:00', latency: 72, requests: 1420 },
  { hour: '18:00', latency: 58, requests: 980 },
  { hour: '21:00', latency: 44, requests: 420 },
];

const modelVersions = [
  { version: 'v2.3.1 (current)', deployed: '01 Mar 2026', accuracy: '91.8%', f1: '89.9%', status: 'active' },
  { version: 'v2.2.0', deployed: '12 Feb 2026', accuracy: '90.4%', f1: '88.6%', status: 'retired' },
  { version: 'v2.1.2', deployed: '20 Jan 2026', accuracy: '89.1%', f1: '87.2%', status: 'retired' },
  { version: 'v2.0.0', deployed: '05 Dec 2025', accuracy: '87.6%', f1: '85.4%', status: 'retired' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-xs">
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AIModelPerformance() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Refreshing metrics...',
        success: 'Metrics refreshed successfully!',
        error: 'Failed to refresh metrics.',
      }
    ).then(() => setRefreshing(false));
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">AI Model Performance</h1>
          <p className="text-sm text-gray-500 mt-0.5">CSC Co-Pilot ML Model v2.3.1 — Real-time metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
            <CheckCircle size={14}/>
            Model Active & Healthy
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/>
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Model Accuracy', value: '91.8%', sub: '+0.4% from last month', icon: Target, color: '#138808', bg: '#f0fdf4' },
          { label: 'F1 Score', value: '0.899', sub: 'Precision-Recall balance', icon: Cpu, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Avg. Inference Time', value: '67ms', sub: 'Per application check', icon: Zap, color: '#d97706', bg: '#fffbeb' },
          { label: 'Daily API Calls', value: '8,34,210', sub: 'Requests processed today', icon: Clock, color: '#7c3aed', bg: '#faf5ff' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon size={20} style={{ color: kpi.color }}/>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
                <div className="text-xs text-gray-400">{kpi.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Accuracy Trend */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-gray-800">Model Performance Metrics Over Time</h3>
            <p className="text-xs text-gray-500 mt-0.5">Oct 2025 – Mar 2026</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={accuracyData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis key="x-axis" dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
              <YAxis key="y-axis" domain={[82, 95]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/>
              <Tooltip key="tooltip" content={<CustomTooltip/>}/>
              <Line key="line-accuracy" type="monotone" dataKey="accuracy" name="Accuracy" stroke="#138808" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false}/>
              <Line key="line-precision" type="monotone" dataKey="precision" name="Precision" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false}/>
              <Line key="line-recall" type="monotone" dataKey="recall" name="Recall" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false}/>
              <Line key="line-f1" type="monotone" dataKey="f1" name="F1 Score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#138808] inline-block rounded"/><span>Accuracy</span></div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#1e3a5f] inline-block rounded"/><span>Precision</span></div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#f97316] inline-block rounded"/><span>Recall</span></div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-[#8b5cf6] inline-block rounded"/><span>F1 Score</span></div>
          </div>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-gray-800">Performance Radar</h3>
            <p className="text-xs text-gray-500 mt-0.5">Current model v2.3.1</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid key="polar-grid" stroke="#f1f5f9"/>
              <PolarAngleAxis key="angle-axis" dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }}/>
              <Radar key="radar-model" name="Model" dataKey="value" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false}/>
              <Tooltip key="tooltip" formatter={(val: any) => [`${val}%`, 'Score']}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inference Latency */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h3 className="text-gray-800">Inference Latency & Request Volume (Today)</h3>
          <p className="text-xs text-gray-500 mt-0.5">Average response time per API call vs. hourly request volume</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={inferenceData} barSize={20}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
            <XAxis key="x-axis" dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
            <YAxis key="y-axis-left" yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}ms`}/>
            <YAxis key="y-axis-right" yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
            <Tooltip key="tooltip" content={<CustomTooltip/>}/>
            <Bar key="bar-requests" yAxisId="right" dataKey="requests" name="Requests" fill="#eff6ff" stroke="#93c5fd" strokeWidth={1} radius={[4,4,0,0]} isAnimationActive={false}/>
            <Bar key="bar-latency" yAxisId="left" dataKey="latency" name="Latency (ms)" fill="#1e3a5f" radius={[4,4,0,0]} isAnimationActive={false}/>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#eff6ff] border border-[#93c5fd] inline-block"/><span>Requests</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#1e3a5f] inline-block"/><span>Latency (ms)</span></div>
        </div>
      </div>

      {/* Model Versions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-gray-800">Model Version History</h3>
          <p className="text-xs text-gray-500 mt-0.5">Deployment history and performance comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                {['Version', 'Deployed On', 'Accuracy', 'F1 Score', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelVersions.map((v, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800 font-mono text-xs">{v.version}</td>
                  <td className="px-5 py-3 text-gray-600">{v.deployed}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{v.accuracy}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{v.f1}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {v.status === 'active' ? 'Active' : 'Retired'}
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