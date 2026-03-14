import React from 'react';
import { Link } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FilePlus, CheckCircle, TrendingUp, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

const weeklyData = [
  { day: 'सोम', apps: 72, submitted: 68 },
  { day: 'मंगल', apps: 85, submitted: 80 },
  { day: 'बुध', apps: 78, submitted: 75 },
  { day: 'गुरु', apps: 90, submitted: 87 },
  { day: 'शुक्र', apps: 83, submitted: 79 },
  { day: 'शनि', apps: 61, submitted: 58 },
  { day: 'आज', apps: 47, submitted: 43 },
];

const serviceData = [
  { name: 'जन्म प्रमाण पत्र', value: 28, color: '#003380' },
  { name: 'आय प्रमाण पत्र', value: 22, color: '#E8701A' },
  { name: 'जाति प्रमाण पत्र', value: 18, color: '#1A7A38' },
  { name: 'निवास प्रमाण पत्र', value: 15, color: '#E8A020' },
  { name: 'अन्य', value: 17, color: '#7A8BA3' },
];

const rejectionData = [
  { reason: 'दस्तावेज़ कमी', count: 12 },
  { reason: 'आय मेल नहीं', count: 8 },
  { reason: 'पात्रता विफल', count: 6 },
  { reason: 'डेटा त्रुटि', count: 4 },
  { reason: 'अन्य', count: 3 },
];

const recentApps = [
  { id: 'REF2026031401', name: 'सुनीता देवी', service: 'जन्म प्रमाण पत्र', status: 'स्वीकृत', time: '10:32 AM', risk: 'Low' },
  { id: 'REF2026031402', name: 'रामकुमार वर्मा', service: 'आय प्रमाण पत्र', status: 'प्रक्रियाधीन', time: '11:05 AM', risk: 'Medium' },
  { id: 'REF2026031403', name: 'प्रीति साहू', service: 'जाति प्रमाण पत्र', status: 'स्वीकृत', time: '11:48 AM', risk: 'Low' },
  { id: 'REF2026031404', name: 'महेश कुमार', service: 'निवास प्रमाण पत्र', status: 'अस्वीकृत', time: '12:15 PM', risk: 'High' },
  { id: 'REF2026031405', name: 'दुर्गाबाई', service: 'विवाह पंजीकरण', status: 'प्रक्रियाधीन', time: '01:20 PM', risk: 'Low' },
  { id: 'REF2026031406', name: 'लक्ष्मी नारायण', service: 'पेंशन योजना', status: 'स्वीकृत', time: '02:05 PM', risk: 'Low' },
];

const statusConfig: Record<string, { bg: string; color: string }> = {
  'स्वीकृत': { bg: '#E6F5EC', color: '#1A7A38' },
  'प्रक्रियाधीन': { bg: '#FFF0E0', color: '#E8701A' },
  'अस्वीकृत': { bg: '#FEECEC', color: '#D93025' },
};

const riskConfig: Record<string, { bg: string; color: string }> = {
  Low: { bg: '#E6F5EC', color: '#1A7A38' },
  Medium: { bg: '#FFF8E0', color: '#E8A020' },
  High: { bg: '#FEECEC', color: '#D93025' },
};

export function DashboardPage() {
  return (
    <div
      className="p-6"
      style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#7A8BA3] mb-1" style={{ fontSize: '13px' }}>
            <span>मुख्य पृष्ठ</span> <ChevronRight size={13} /> <span className="text-[#3D4F6B]">डैशबोर्ड</span>
          </div>
          <h1
            className="text-[#1C2B4A]"
            style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '26px', fontWeight: 700 }}
          >
            ऑपरेटर डैशबोर्ड
          </h1>
          <p className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>
            Operator Dashboard | राजनांदगांव CSC | 14 मार्च 2026, शनिवार
          </p>
        </div>
        <Link
          to="/app/new"
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #FF9933, #E8701A)' }}
        >
          <FilePlus size={20} />
          <span style={{ fontWeight: 600, fontSize: '15px' }}>नया आवेदन | New Application</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: FilePlus, label: 'आज के आवेदन', labelEn: 'Applications Today',
            value: '47', sub: '+8% कल से', color: '#003380', bg: '#EEF4FF',
          },
          {
            icon: CheckCircle, label: 'सबमिट किए', labelEn: 'Submitted',
            value: '43', sub: '91.5% सफलता दर', color: '#1A7A38', bg: '#E6F5EC',
          },
          {
            icon: TrendingUp, label: 'स्वीकृति दर', labelEn: 'Acceptance Rate',
            value: '87%', sub: 'इस सप्ताह', color: '#E8701A', bg: '#FFF0E0',
          },
          {
            icon: AlertTriangle, label: 'AI चेतावनियां', labelEn: 'AI Warnings',
            value: '4', sub: '3 उच्च जोखिम', color: '#D93025', bg: '#FEECEC',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: '#D8DDE8' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p
                    className="text-[#3D4F6B]"
                    style={{
                      fontFamily: "'Noto Sans Devanagari', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {card.label}
                  </p>
                  <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>{card.labelEn}</p>
                </div>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                  <Icon size={22} style={{ color: card.color }} />
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: '36px',
                  fontWeight: 700,
                  color: card.color,
                  lineHeight: 1,
                }}
              >
                {card.value}
              </p>
              <p className="text-[#7A8BA3] mt-1" style={{ fontSize: '12px' }}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Area Chart */}
        <div className="col-span-2 bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-[#1C2B4A]"
                style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: 700 }}
              >
                साप्ताहिक आवेदन | Weekly Applications
              </h3>
              <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
                Applications vs Submitted (this week)
              </p>
            </div>
            <Clock size={18} className="text-[#7A8BA3]" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="dashAppGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop key="dash-app-stop-top" offset="5%" stopColor="#003380" stopOpacity={0.2} />
                  <stop key="dash-app-stop-bot" offset="95%" stopColor="#003380" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashSubGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop key="dash-sub-stop-top" offset="5%" stopColor="#E8701A" stopOpacity={0.2} />
                  <stop key="dash-sub-stop-bot" offset="95%" stopColor="#E8701A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="dash-grid" strokeDasharray="3 3" stroke="#EEF1F7" />
              <XAxis key="dash-xaxis" dataKey="day" tick={{ fontSize: 12, fill: '#7A8BA3' }} />
              <YAxis key="dash-yaxis" tick={{ fontSize: 12, fill: '#7A8BA3' }} />
              <Tooltip
                key="dash-tooltip"
                contentStyle={{ borderRadius: '8px', border: '1px solid #D8DDE8', fontSize: '13px' }}
              />
              <Legend key="dash-legend" wrapperStyle={{ fontSize: '13px' }} />
              <Area key="dash-area-apps" type="monotone" dataKey="apps" stroke="#003380" fill="url(#dashAppGrad)" name="आवेदन" strokeWidth={2.5} />
              <Area key="dash-area-sub" type="monotone" dataKey="submitted" stroke="#E8701A" fill="url(#dashSubGrad)" name="सबमिट" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
          <h3
            className="text-[#1C2B4A] mb-1"
            style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: 700 }}
          >
            सेवा वितरण
          </h3>
          <p className="text-[#7A8BA3] mb-3" style={{ fontSize: '13px' }}>Top Services Used</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie key="dash-pie" data={serviceData} cx="50%" cy="50%" innerRadius={44} outerRadius={76} dataKey="value">
                {serviceData.map((entry) => (
                  <Cell key={`dash-cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip key="dash-pie-tooltip" contentStyle={{ fontSize: '13px', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {serviceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-[#3D4F6B]" style={{ fontSize: '12px' }}>{item.name}</span>
                </div>
                <span className="text-[#7A8BA3]" style={{ fontSize: '12px', fontFamily: "'Roboto Mono', monospace" }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection Reasons + Recent Activity */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart: Rejection Reasons */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#D8DDE8' }}>
          <h3
            className="text-[#1C2B4A] mb-1"
            style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: 700 }}
          >
            अस्वीकृति कारण
          </h3>
          <p className="text-[#7A8BA3] mb-3" style={{ fontSize: '13px' }}>Rejection Reasons</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rejectionData} layout="vertical">
              <CartesianGrid key="dash-bar-grid" strokeDasharray="3 3" stroke="#EEF1F7" horizontal={false} />
              <XAxis key="dash-bar-xaxis" type="number" tick={{ fontSize: 11, fill: '#7A8BA3' }} />
              <YAxis key="dash-bar-yaxis" type="category" dataKey="reason" tick={{ fontSize: 11, fill: '#7A8BA3' }} width={85} />
              <Tooltip key="dash-bar-tooltip" contentStyle={{ fontSize: '13px', borderRadius: '8px' }} />
              <Bar key="dash-bar-count" dataKey="count" fill="#D93025" radius={[0, 4, 4, 0]} name="संख्या">
                {rejectionData.map((entry) => (
                  <Cell key={`dash-bar-cell-${entry.reason}`} fill="#D93025" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Table */}
        <div className="col-span-2 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
          <div
            className="flex items-center justify-between px-5 py-3.5 border-b"
            style={{ borderColor: '#D8DDE8' }}
          >
            <h3
              className="text-[#1C2B4A]"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: 700 }}
            >
              हाल की गतिविधि | Recent Activity
            </h3>
            <Link to="/app/history" className="text-[#003380] hover:underline" style={{ fontSize: '13px' }}>
              सभी देखें →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F8F9FC' }}>
                  {['संदर्भ ID', 'नागरिक नाम', 'सेवा', 'स्थिति', 'समय', 'AI जोखिम'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[#7A8BA3] border-b"
                      style={{ fontSize: '12px', fontWeight: 600, borderColor: '#D8DDE8' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: '1px solid #EEF1F7' }}
                  >
                    <td className="px-4 py-3.5" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: '12px', color: '#003380' }}>
                      {app.id}
                    </td>
                    <td className="px-4 py-3.5 text-[#1C2B4A]" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {app.name}
                    </td>
                    <td className="px-4 py-3.5 text-[#3D4F6B]" style={{ fontSize: '13px' }}>
                      {app.service}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded"
                        style={{
                          background: statusConfig[app.status]?.bg,
                          color: statusConfig[app.status]?.color,
                          fontWeight: 600,
                          fontSize: '13px',
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#7A8BA3]" style={{ fontSize: '13px' }}>
                      {app.time}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded"
                        style={{
                          background: riskConfig[app.risk]?.bg,
                          color: riskConfig[app.risk]?.color,
                          fontWeight: 600,
                          fontSize: '13px',
                        }}
                      >
                        {app.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}