import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  ChevronRight, TrendingUp, TrendingDown, CheckCircle, AlertTriangle,
  Clock, BarChart3, Download, Calendar, Filter, FileText, Cpu,
  Users, Activity,
} from 'lucide-react';

/* ─── colours (minimal – navy + accent stripe only) ─── */
const NAVY   = '#1C2B4A';
const INK    = '#3D4F6B';
const MUTED  = '#6B7A93';
const RULE   = '#DDE1EA';
const SHEET  = '#F5F7FA';
const SAFFRON = '#E8701A';
const GREEN   = '#1A7A38';
const RED     = '#C0392B';

/* ─── mock data ─── */
const monthlyData = [
  { month: 'अप्रैल',   apps: 312, approved: 278, rejected: 34,  pending: 0  },
  { month: 'मई',       apps: 345, approved: 298, rejected: 47,  pending: 0  },
  { month: 'जून',      apps: 289, approved: 251, rejected: 38,  pending: 0  },
  { month: 'जुलाई',    apps: 378, approved: 335, rejected: 43,  pending: 0  },
  { month: 'अगस्त',    apps: 401, approved: 362, rejected: 39,  pending: 0  },
  { month: 'सितंबर',   apps: 356, approved: 319, rejected: 37,  pending: 0  },
  { month: 'अक्टूबर',  apps: 423, approved: 384, rejected: 39,  pending: 0  },
  { month: 'नवंबर',    apps: 392, approved: 351, rejected: 41,  pending: 0  },
  { month: 'दिसंबर',   apps: 445, approved: 401, rejected: 44,  pending: 0  },
  { month: 'जनवरी',    apps: 468, approved: 419, rejected: 49,  pending: 0  },
  { month: 'फरवरी',    apps: 412, approved: 376, rejected: 36,  pending: 0  },
  { month: 'मार्च',    apps: 487, approved: 431, rejected: 38,  pending: 18 },
];

const serviceBreakdown = [
  { service: 'जन्म प्रमाण',    total: 412, approved: 389, rejected: 23  },
  { service: 'आय प्रमाण',      total: 356, approved: 318, rejected: 38  },
  { service: 'जाति प्रमाण',    total: 298, approved: 274, rejected: 24  },
  { service: 'निवास प्रमाण',   total: 241, approved: 219, rejected: 22  },
  { service: 'विवाह पंजीकरण',  total: 187, approved: 172, rejected: 15  },
  { service: 'किसान पंजीकरण',  total: 156, approved: 145, rejected: 11  },
  { service: 'पेंशन योजना',    total: 134, approved: 121, rejected: 13  },
  { service: 'मृत्यु प्रमाण',  total: 124, approved: 116, rejected: 8   },
];

const weekdayData = [
  { day: 'सोम', avg: 68 },
  { day: 'मंगल', avg: 79 },
  { day: 'बुध', avg: 74 },
  { day: 'गुरु', avg: 85 },
  { day: 'शुक्र', avg: 81 },
  { day: 'शनि', avg: 52 },
];

const aiAccuracy = [
  { month: 'अक्टू', accuracy: 91.2, extractions: 423 },
  { month: 'नव',   accuracy: 92.1, extractions: 392 },
  { month: 'दिस',  accuracy: 93.4, extractions: 445 },
  { month: 'जन',   accuracy: 93.8, extractions: 468 },
  { month: 'फर',   accuracy: 94.2, extractions: 412 },
  { month: 'मार',  accuracy: 94.7, extractions: 487 },
];

const servicePieData = [
  { name: 'जन्म प्रमाण',   value: 18,  fill: NAVY       },
  { name: 'आय प्रमाण',     value: 16,  fill: '#2D4A7A'  },
  { name: 'जाति प्रमाण',   value: 13,  fill: '#4A6A9A'  },
  { name: 'निवास प्रमाण',  value: 11,  fill: '#6A8AAA'  },
  { name: 'विवाह',          value: 8,   fill: '#8AAAC0'  },
  { name: 'अन्य',           value: 34,  fill: RULE       },
];

const processingTime = [
  { service: 'जन्म',   days: 2.1 },
  { service: 'आय',     days: 3.4 },
  { service: 'जाति',   days: 2.8 },
  { service: 'निवास',  days: 2.3 },
  { service: 'विवाह',  days: 4.1 },
  { service: 'किसान',  days: 3.0 },
  { service: 'पेंशन',  days: 5.2 },
  { service: 'मृत्यु', days: 1.9 },
];

const topRejectionReasons = [
  { reason: 'दस्तावेज़ कमी / अस्पष्ट',  count: 89, pct: 34 },
  { reason: 'आय विसंगति',                 count: 52, pct: 20 },
  { reason: 'पात्रता मानदंड विफल',        count: 41, pct: 16 },
  { reason: 'डेटा असंगतता',              count: 34, pct: 13 },
  { reason: 'डुप्लीकेट आवेदन',           count: 24, pct: 9  },
  { reason: 'अन्य',                       count: 21, pct: 8  },
];

const kpis = [
  { label: 'कुल आवेदन (वार्षिक)', labelEn: 'Total Applications (YTD)',
    value: '4,708', delta: '+12.4%', up: true, icon: FileText },
  { label: 'स्वीकृति दर', labelEn: 'Approval Rate',
    value: '88.6%', delta: '+1.2%', up: true, icon: CheckCircle },
  { label: 'औसत प्रसंस्करण समय', labelEn: 'Avg Processing Time',
    value: '3.1 दिन', delta: '-0.4 दिन', up: true, icon: Clock },
  { label: 'AI निष्कर्षण सटीकता', labelEn: 'AI Extraction Accuracy',
    value: '94.7%', delta: '+3.5%', up: true, icon: Cpu },
  { label: 'कुल नागरिक', labelEn: 'Total Citizens Served',
    value: '3,892', delta: '+8.7%', up: true, icon: Users },
  { label: 'उच्च जोखिम आवेदन', labelEn: 'High Risk Applications',
    value: '261', delta: '-4.2%', up: false, icon: AlertTriangle },
];

/* ─── custom tooltip ─── */
const GovTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded p-2.5 shadow-sm" style={{ borderColor: RULE, fontSize: '12px' }}>
      <p style={{ fontWeight: 700, color: NAVY, marginBottom: '4px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? INK }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

/* ─── section header ─── */
function SectionHead({ title, sub, accent = SAFFRON }: { title: string; sub: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: RULE }}>
      <div className="w-1 h-6 rounded-sm flex-shrink-0" style={{ background: accent }} />
      <div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2', sans-serif" }}>{title}</p>
        <p style={{ fontSize: '11px', color: MUTED }}>{sub}</p>
      </div>
    </div>
  );
}

/* ─── main ─── */
export function AnalyticsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const totalApps    = monthlyData.reduce((s, d) => s + d.apps, 0);
  const totalApproved = monthlyData.reduce((s, d) => s + d.approved, 0);
  const totalRejected = monthlyData.reduce((s, d) => s + d.rejected, 0);

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans','Noto Sans Devanagari',sans-serif", background: SHEET, minHeight: '100%' }}>

      {/* ── HEADER ── */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: '12px', color: MUTED }}>
            <Link to="/app" style={{ color: MUTED }} className="hover:underline">डैशबोर्ड</Link>
            <ChevronRight size={12} />
            <span style={{ color: INK }}>विश्लेषण</span>
          </div>
          <h1 style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: '24px', fontWeight: 700, color: NAVY }}>
            विश्लेषण एवं रिपोर्ट
          </h1>
          <p style={{ fontSize: '13px', color: MUTED }}>Analytics &amp; Reports — राजनांदगांव CSC | OP-4521</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period toggle */}
          <div className="flex rounded overflow-hidden border" style={{ borderColor: RULE }}>
            {(['month', 'quarter', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-2 transition-colors"
                style={{
                  fontSize: '12px', fontWeight: 600,
                  background: period === p ? NAVY : 'white',
                  color: period === p ? 'white' : INK,
                  borderRight: p !== 'year' ? `1px solid ${RULE}` : 'none',
                }}
              >
                {p === 'month' ? 'इस माह' : p === 'quarter' ? 'तिमाही' : 'वार्षिक'}
              </button>
            ))}
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded border transition-colors hover:bg-gray-50"
            style={{ fontSize: '12px', fontWeight: 600, color: INK, borderColor: RULE, background: 'white' }}
          >
            <Calendar size={13} /> तिथि चुनें
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded transition-colors hover:bg-[#2D3F5E]"
            style={{ fontSize: '12px', fontWeight: 600, background: NAVY, color: 'white' }}
          >
            <Download size={13} /> रिपोर्ट डाउनलोड
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-lg border p-4" style={{ borderColor: RULE }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: SHEET }}>
                  <Icon size={15} style={{ color: NAVY }} />
                </div>
                <span
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                  style={{
                    fontSize: '10px', fontWeight: 700,
                    background: k.up ? '#E6F5EC' : '#FEECEC',
                    color: k.up ? GREEN : RED,
                  }}
                >
                  {k.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {k.delta}
                </span>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: INK, marginTop: '3px' }}>{k.label}</p>
              <p style={{ fontSize: '10px', color: MUTED }}>{k.labelEn}</p>
            </div>
          );
        })}
      </div>

      {/* ── ROW 1: monthly trend + pie ── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 260px' }}>

        {/* Monthly trend */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: RULE }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-sm" style={{ background: SAFFRON }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2',sans-serif" }}>
                  मासिक आवेदन प्रवृत्ति | Monthly Application Trend
                </p>
                <p style={{ fontSize: '11px', color: MUTED }}>अप्रैल 2025 – मार्च 2026 (वार्षिक)</p>
              </div>
            </div>
            {/* Chart type toggle */}
            <div className="flex rounded overflow-hidden border" style={{ borderColor: RULE }}>
              {(['area', 'bar'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    fontSize: '11px', fontWeight: 600,
                    background: chartType === t ? NAVY : 'white',
                    color: chartType === t ? 'white' : INK,
                    borderRight: t === 'area' ? `1px solid ${RULE}` : 'none',
                  }}
                >
                  {t === 'area' ? 'Area' : 'Bar'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {/* Summary row */}
            <div className="flex items-center gap-6 mb-4">
              {[
                { label: 'कुल आवेदन', value: totalApps.toLocaleString(), color: NAVY },
                { label: 'स्वीकृत',    value: totalApproved.toLocaleString(), color: GREEN  },
                { label: 'अस्वीकृत',  value: totalRejected.toLocaleString(), color: RED    },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                  <span style={{ fontSize: '12px', color: MUTED }}>{s.label}:</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: s.color, fontFamily: "'Baloo 2',sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={220}>
              {chartType === 'area' ? (
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="anaAppsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={NAVY}  stopOpacity={0.18} />
                      <stop offset="95%" stopColor={NAVY}  stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="anaAppGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GREEN} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED }} />
                  <Tooltip content={<GovTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="apps"     stroke={NAVY}  fill="url(#anaAppsGrad)" strokeWidth={2} name="कुल आवेदन" />
                  <Area type="monotone" dataKey="approved" stroke={GREEN} fill="url(#anaAppGrad2)" strokeWidth={2} name="स्वीकृत" />
                </AreaChart>
              ) : (
                <BarChart data={monthlyData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED }} />
                  <Tooltip content={<GovTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="approved" stackId="a" fill={GREEN} name="स्वीकृत" radius={[0,0,0,0]} />
                  <Bar dataKey="rejected" stackId="a" fill={RED}   name="अस्वीकृत" radius={[3,3,0,0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: service share */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <SectionHead title="सेवा वितरण" sub="Service Distribution (%)" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={servicePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {servicePieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-1">
              {servicePieData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.fill, border: d.fill === RULE ? `1px solid ${RULE}` : 'none' }} />
                    <span style={{ fontSize: '11px', color: INK }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: NAVY, fontFamily: "'Roboto Mono',monospace" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: service breakdown bar + weekday + AI accuracy ── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 240px 280px' }}>

        {/* Service-wise breakdown */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <SectionHead title="सेवा-वार स्थिति | Service-wise Status" sub="Total | Approved | Rejected" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceBreakdown} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} />
                <YAxis type="category" dataKey="service" tick={{ fontSize: 11, fill: INK }} width={88} />
                <Tooltip content={<GovTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="approved" fill={NAVY}  name="स्वीकृत"  radius={[0,3,3,0]} />
                <Bar dataKey="rejected" fill={RULE}  name="अस्वीकृत" radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday avg */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <SectionHead title="वार-अनुसार" sub="Applications by Weekday (avg)" accent={NAVY} />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekdayData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: MUTED }} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} />
                <Tooltip content={<GovTooltip />} />
                <Bar dataKey="avg" fill={NAVY} name="औसत आवेदन" radius={[3,3,0,0]}>
                  {weekdayData.map((_, i) => <Cell key={i} fill={i === 3 ? SAFFRON : NAVY} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI accuracy trend */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <SectionHead title="AI सटीकता प्रवृत्ति" sub="AI Extraction Accuracy Trend" accent={NAVY} />
          <div className="p-4">
            <div className="flex items-end gap-2 mb-3">
              <p style={{ fontSize: '32px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1 }}>94.7%</p>
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded mb-1" style={{ background: '#E6F5EC', color: GREEN, fontSize: '11px', fontWeight: 700 }}>
                <TrendingUp size={11} /> +3.5%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={145}>
              <LineChart data={aiAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} />
                <YAxis domain={[89, 96]} tick={{ fontSize: 11, fill: MUTED }} />
                <Tooltip content={<GovTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke={NAVY} strokeWidth={2.5} dot={{ fill: NAVY, r: 3 }} name="सटीकता %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 3: processing time + rejection reasons ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px' }}>

        {/* Processing time per service */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <SectionHead title="औसत प्रसंस्करण समय | Avg Processing Time (days)" sub="Per service type — lower is better" />
          <div className="p-5 space-y-3">
            {processingTime.map((pt, i) => {
              const maxDays = 6;
              const pct = (pt.days / maxDays) * 100;
              const barColor = pt.days <= 2.5 ? GREEN : pt.days <= 4 ? SAFFRON : RED;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span style={{ width: '52px', fontSize: '12px', fontWeight: 600, color: INK, flexShrink: 0 }}>{pt.service}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', background: SHEET }}>
                    <div style={{ width: `${pct}%`, height: '8px', background: barColor, borderRadius: '99px', transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ width: '42px', fontSize: '12px', fontWeight: 700, color: barColor, fontFamily: "'Roboto Mono',monospace", flexShrink: 0, textAlign: 'right' }}>
                    {pt.days}d
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: RULE }}>
              {[[GREEN, '≤ 2.5 दिन — तेज़'], [SAFFRON, '2.5–4 दिन — सामान्य'], [RED, '> 4 दिन — धीमा']].map(([c, l]) => (
                <div key={l as string} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c as string }} />
                  <span style={{ fontSize: '11px', color: MUTED }}>{l as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rejection reasons */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
          <SectionHead title="अस्वीकृति कारण | Rejection Reasons" sub={`कुल ${totalRejected} अस्वीकृत आवेदन`} accent={NAVY} />
          <div className="divide-y" style={{ borderColor: RULE }}>
            {topRejectionReasons.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: SHEET, fontSize: '10px', fontWeight: 700, color: NAVY }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '12px', fontWeight: 600, color: INK }}>{r.reason}</p>
                  <div className="mt-1 rounded-full overflow-hidden" style={{ height: '4px', background: SHEET }}>
                    <div style={{ width: `${r.pct}%`, height: '4px', background: NAVY, borderRadius: '99px' }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY, fontFamily: "'Roboto Mono',monospace" }}>{r.count}</p>
                  <p style={{ fontSize: '10px', color: MUTED }}>{r.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
