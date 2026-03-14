import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronRight, Search, Filter, Download, Eye, X,
  User, Phone, MapPin, Calendar, FileText, CheckCircle,
  Clock, AlertTriangle, ChevronDown, ChevronUp, MoreHorizontal,
} from 'lucide-react';

/* ─── colours ─── */
const NAVY   = '#1C2B4A';
const INK    = '#3D4F6B';
const MUTED  = '#6B7A93';
const RULE   = '#DDE1EA';
const SHEET  = '#F5F7FA';
const SAFFRON = '#E8701A';
const GREEN   = '#1A7A38';
const RED     = '#C0392B';
const AMBER   = '#B45309';

/* ─── mock citizens ─── */
const citizens = [
  {
    id: 'CIT-2024-00312', name: 'सुनीता देवी', nameEn: 'Sunita Devi',
    mobile: '9876543210', dob: '15/08/1985', gender: 'महिला',
    address: 'वार्ड 12, राजनांदगांव', district: 'राजनांदगांव',
    aadhaar: '****  ****  3456', category: 'OBC',
    totalApps: 4, approved: 3, rejected: 0, pending: 1,
    lastService: 'जन्म प्रमाण पत्र', lastDate: '14/03/2026',
    riskScore: 12, riskLevel: 'Low',
    services: ['जन्म प्रमाण पत्र', 'निवास प्रमाण पत्र', 'आय प्रमाण पत्र'],
  },
  {
    id: 'CIT-2024-00287', name: 'रामकुमार वर्मा', nameEn: 'Ramkumar Verma',
    mobile: '9765432109', dob: '22/03/1978', gender: 'पुरुष',
    address: 'ग्राम पंचायत खैरागढ़', district: 'राजनांदगांव',
    aadhaar: '****  ****  7823', category: 'General',
    totalApps: 6, approved: 4, rejected: 1, pending: 1,
    lastService: 'आय प्रमाण पत्र', lastDate: '14/03/2026',
    riskScore: 45, riskLevel: 'Medium',
    services: ['आय प्रमाण पत्र', 'जाति प्रमाण पत्र', 'किसान पंजीकरण'],
  },
  {
    id: 'CIT-2024-00401', name: 'प्रीति साहू', nameEn: 'Preeti Sahu',
    mobile: '9654321098', dob: '07/11/1990', gender: 'महिला',
    address: 'नगर निगम क्षेत्र, राजनांदगांव', district: 'राजनांदगांव',
    aadhaar: '****  ****  1290', category: 'OBC',
    totalApps: 3, approved: 3, rejected: 0, pending: 0,
    lastService: 'जाति प्रमाण पत्र', lastDate: '14/03/2026',
    riskScore: 18, riskLevel: 'Low',
    services: ['जाति प्रमाण पत्र', 'निवास प्रमाण पत्र'],
  },
  {
    id: 'CIT-2024-00198', name: 'महेश कुमार', nameEn: 'Mahesh Kumar',
    mobile: '9543210987', dob: '30/05/1972', gender: 'पुरुष',
    address: 'ग्राम बोड़ला, राजनांदगांव', district: 'राजनांदगांव',
    aadhaar: '****  ****  6541', category: 'SC',
    totalApps: 5, approved: 2, rejected: 2, pending: 1,
    lastService: 'निवास प्रमाण पत्र', lastDate: '14/03/2026',
    riskScore: 82, riskLevel: 'High',
    services: ['निवास प्रमाण पत्र', 'आय प्रमाण पत्र'],
  },
  {
    id: 'CIT-2025-00022', name: 'दुर्गाबाई', nameEn: 'Durgabai',
    mobile: '9432109876', dob: '14/02/1988', gender: 'महिला',
    address: 'ग्राम नाचनखेड़ा', district: 'राजनांदगांव',
    aadhaar: '****  ****  4412', category: 'ST',
    totalApps: 2, approved: 1, rejected: 0, pending: 1,
    lastService: 'विवाह पंजीकरण', lastDate: '13/03/2026',
    riskScore: 22, riskLevel: 'Low',
    services: ['विवाह पंजीकरण'],
  },
  {
    id: 'CIT-2023-00734', name: 'लक्ष्मी नारायण', nameEn: 'Laxmi Narayan',
    mobile: '9321098765', dob: '18/09/1955', gender: 'पुरुष',
    address: 'वार्ड 5, राजनांदगांव', district: 'राजनांदगांव',
    aadhaar: '****  ****  8834', category: 'General',
    totalApps: 7, approved: 7, rejected: 0, pending: 0,
    lastService: 'पेंशन योजना', lastDate: '13/03/2026',
    riskScore: 8, riskLevel: 'Low',
    services: ['पेंशन योजना', 'जन्म प्रमाण पत्र', 'आय प्रमाण पत्र'],
  },
  {
    id: 'CIT-2025-00145', name: 'विजय साहू', nameEn: 'Vijay Sahu',
    mobile: '9210987654', dob: '03/07/1995', gender: 'पुरुष',
    address: 'ग्राम चिचोला', district: 'राजनांदगांव',
    aadhaar: '****  ****  2267', category: 'OBC',
    totalApps: 3, approved: 3, rejected: 0, pending: 0,
    lastService: 'जन्म प्रमाण पत्र', lastDate: '13/03/2026',
    riskScore: 15, riskLevel: 'Low',
    services: ['जन्म प्रमाण पत्र', 'जाति प्रमाण पत्र'],
  },
  {
    id: 'CIT-2024-00512', name: 'गीता देवी', nameEn: 'Geeta Devi',
    mobile: '9109876543', dob: '25/12/1968', gender: 'महिला',
    address: 'मोहल्ला तिलकनगर, राजनांदगांव', district: 'राजनांदगांव',
    aadhaar: '****  ****  9923', category: 'General',
    totalApps: 4, approved: 2, rejected: 2, pending: 0,
    lastService: 'आय प्रमाण पत्र', lastDate: '12/03/2026',
    riskScore: 76, riskLevel: 'High',
    services: ['आय प्रमाण पत्र', 'निवास प्रमाण पत्र'],
  },
  {
    id: 'CIT-2024-00389', name: 'रमेश यादव', nameEn: 'Ramesh Yadav',
    mobile: '9098765432', dob: '11/04/1982', gender: 'पुरुष',
    address: 'ग्राम धनेली', district: 'राजनांदगांव',
    aadhaar: '****  ****  3356', category: 'OBC',
    totalApps: 5, approved: 5, rejected: 0, pending: 0,
    lastService: 'जाति प्रमाण पत्र', lastDate: '12/03/2026',
    riskScore: 38, riskLevel: 'Medium',
    services: ['जाति प्रमाण पत्र', 'किसान पंजीकरण', 'आय प्रमाण पत्र'],
  },
  {
    id: 'CIT-2025-00201', name: 'कमला बाई', nameEn: 'Kamla Bai',
    mobile: '8987654321', dob: '28/06/1970', gender: 'महिला',
    address: 'ग्राम मुड़पार', district: 'राजनांदगांव',
    aadhaar: '****  ****  7781', category: 'SC',
    totalApps: 2, approved: 1, rejected: 0, pending: 1,
    lastService: 'निवास प्रमाण पत्र', lastDate: '11/03/2026',
    riskScore: 25, riskLevel: 'Low',
    services: ['निवास प्रमाण पत्र'],
  },
  {
    id: 'CIT-2023-00612', name: 'भारत लाल', nameEn: 'Bharat Lal',
    mobile: '8876543210', dob: '05/01/1960', gender: 'पुरुष',
    address: 'ग्राम खुजबिया', district: 'राजनांदगांव',
    aadhaar: '****  ****  4490', category: 'ST',
    totalApps: 8, approved: 7, rejected: 1, pending: 0,
    lastService: 'पेंशन योजना', lastDate: '10/03/2026',
    riskScore: 31, riskLevel: 'Low',
    services: ['पेंशन योजना', 'जाति प्रमाण पत्र', 'जन्म प्रमाण पत्र'],
  },
  {
    id: 'CIT-2025-00334', name: 'अनीता पाटिल', nameEn: 'Anita Patil',
    mobile: '8765432109', dob: '17/08/1993', gender: 'महिला',
    address: 'वार्ड 8, राजनांदगांव', district: 'राजनांदगांव',
    aadhaar: '****  ****  6614', category: 'General',
    totalApps: 1, approved: 1, rejected: 0, pending: 0,
    lastService: 'विवाह पंजीकरण', lastDate: '09/03/2026',
    riskScore: 9, riskLevel: 'Low',
    services: ['विवाह पंजीकरण'],
  },
];

const riskCfg: Record<string, { bg: string; color: string }> = {
  Low:    { bg: '#E6F5EC', color: GREEN  },
  Medium: { bg: '#FFF8E0', color: AMBER  },
  High:   { bg: '#FEECEC', color: RED    },
};

const catColors: Record<string, string> = {
  General: '#3D4F6B',
  OBC:     '#003380',
  SC:      '#7A3FC0',
  ST:      '#B45309',
};

const SERVICES_ALL = ['सभी सेवाएं', 'जन्म प्रमाण पत्र', 'मृत्यु प्रमाण पत्र',
  'आय प्रमाण पत्र', 'जाति प्रमाण पत्र', 'निवास प्रमाण पत्र',
  'विवाह पंजीकरण', 'किसान पंजीकरण', 'पेंशन योजना'];

const GENDER_ALL   = ['सभी', 'पुरुष', 'महिला'];
const RISK_ALL     = ['सभी जोखिम', 'Low', 'Medium', 'High'];
const CATEGORY_ALL = ['सभी श्रेणी', 'General', 'OBC', 'SC', 'ST'];

/* ── avatar initials ── */
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.trim().split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded"
      style={{ width: size, height: size, background: SHEET, border: `1px solid ${RULE}`, fontSize: size * 0.35, fontWeight: 700, color: NAVY }}
    >
      {initials}
    </div>
  );
}

/* ── profile drawer ── */
function ProfileDrawer({ citizen, onClose }: { citizen: typeof citizens[0]; onClose: () => void }) {
  const apps = [
    { id: 'REF2026031401', service: citizen.services[0] ?? '—', date: citizen.lastDate, status: 'स्वीकृत', risk: citizen.riskLevel },
    ...(citizen.services[1] ? [{ id: 'REF2026021502', service: citizen.services[1], date: '12/02/2026', status: 'स्वीकृत', risk: 'Low' }] : []),
    ...(citizen.rejected ? [{ id: 'REF2025112803', service: citizen.services[0] ?? '—', date: '28/11/2025', status: 'अस्वीकृत', risk: 'High' }] : []),
  ];

  const statusCfg: Record<string, { bg: string; color: string }> = {
    'स्वीकृत':     { bg: '#E6F5EC', color: GREEN },
    'प्रक्रियाधीन': { bg: '#FFF0E0', color: SAFFRON },
    'अस्वीकृत':    { bg: '#FEECEC', color: RED },
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <div
        className="bg-white h-full flex flex-col overflow-y-auto"
        style={{ width: '420px', fontFamily: "'Noto Sans','Noto Sans Devanagari',sans-serif" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ background: NAVY, borderColor: '#2D3F5E' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>नागरिक प्रोफ़ाइल</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Citizen Profile</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} style={{ color: 'white' }} />
          </button>
        </div>

        {/* ID bar */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b" style={{ borderColor: RULE, background: SHEET }}>
          <span style={{ fontSize: '12px', color: MUTED }}>नागरिक ID</span>
          <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: '12px', fontWeight: 700, color: NAVY }}>{citizen.id}</span>
        </div>

        {/* Profile card */}
        <div className="px-5 py-4 border-b" style={{ borderColor: RULE }}>
          <div className="flex items-start gap-4">
            <Avatar name={citizen.name} size={52} />
            <div className="flex-1">
              <p style={{ fontSize: '18px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2',sans-serif" }}>{citizen.name}</p>
              <p style={{ fontSize: '12px', color: MUTED }}>{citizen.nameEn}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded border" style={{ fontSize: '11px', fontWeight: 600, color: catColors[citizen.category] ?? INK, borderColor: RULE }}>
                  {citizen.category}
                </span>
                <span className="px-2 py-0.5 rounded" style={{ fontSize: '11px', fontWeight: 600, ...riskCfg[citizen.riskLevel] }}>
                  {citizen.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { icon: Phone,    label: 'मोबाइल',      value: citizen.mobile },
              { icon: Calendar, label: 'जन्म तिथि',   value: citizen.dob },
              { icon: User,     label: 'लिंग',         value: citizen.gender },
              { icon: FileText, label: 'आधार',         value: citizen.aadhaar },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: SHEET }}>
                    <Icon size={13} style={{ color: NAVY }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: MUTED }}>{f.label}</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: INK }}>{f.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 mt-3">
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: SHEET }}>
              <MapPin size={13} style={{ color: NAVY }} />
            </div>
            <div>
              <p style={{ fontSize: '10px', color: MUTED }}>पता | Address</p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: INK }}>{citizen.address}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x border-b" style={{ borderColor: RULE }}>
          {[
            { label: 'कुल', value: citizen.totalApps, color: NAVY },
            { label: 'स्वीकृत', value: citizen.approved, color: GREEN },
            { label: 'अस्वीकृत', value: citizen.rejected, color: RED },
            { label: 'प्रक्रियाधीन', value: citizen.pending, color: SAFFRON },
          ].map(s => (
            <div key={s.label} className="py-3 text-center">
              <p style={{ fontSize: '20px', fontWeight: 700, color: s.color, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Application history */}
        <div className="flex-1 px-5 py-4">
          <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY, marginBottom: '12px' }}>आवेदन इतिहास | Application History</p>
          <div className="space-y-2.5">
            {apps.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded border" style={{ borderColor: RULE, background: SHEET }}>
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'white', border: `1px solid ${RULE}` }}>
                  <FileText size={13} style={{ color: NAVY }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '12px', fontWeight: 600, color: NAVY }}>{a.service}</p>
                  <p style={{ fontSize: '11px', fontFamily: "'Roboto Mono',monospace", color: MUTED }}>{a.id}</p>
                  <p style={{ fontSize: '10px', color: MUTED }}>{a.date}</p>
                </div>
                <span className="px-2 py-0.5 rounded flex-shrink-0" style={{ fontSize: '10px', fontWeight: 700, ...((statusCfg as any)[a.status] ?? { bg: SHEET, color: MUTED }) }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2 flex-shrink-0">
          <button
            className="flex-1 py-2.5 rounded transition-opacity hover:opacity-80"
            style={{ background: NAVY, color: 'white', fontSize: '13px', fontWeight: 700 }}
          >
            नया आवेदन
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded border transition-colors hover:bg-gray-50"
            style={{ borderColor: RULE, color: INK, fontSize: '13px' }}
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── main ─── */
export function CitizenRecordsPage() {
  const [search, setSearch]             = useState('');
  const [filterService, setFilterService] = useState('सभी सेवाएं');
  const [filterGender, setFilterGender]   = useState('सभी');
  const [filterRisk, setFilterRisk]       = useState('सभी जोखिम');
  const [filterCat, setFilterCat]         = useState('सभी श्रेणी');
  const [sortKey, setSortKey]             = useState<'name' | 'totalApps' | 'riskScore' | 'lastDate'>('name');
  const [sortAsc, setSortAsc]             = useState(true);
  const [selected, setSelected]           = useState<typeof citizens[0] | null>(null);
  const [showFilters, setShowFilters]     = useState(false);

  const anyFilter = filterService !== 'सभी सेवाएं' || filterGender !== 'सभी' || filterRisk !== 'सभी जोखिम' || filterCat !== 'सभी श्रेणी';

  const filtered = citizens
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.mobile.includes(q);
      const matchService = filterService === 'सभी सेवाएं' || c.services.includes(filterService);
      const matchGender  = filterGender === 'सभी' || c.gender === filterGender;
      const matchRisk    = filterRisk === 'सभी जोखिम' || c.riskLevel === filterRisk;
      const matchCat     = filterCat === 'सभी श्रेणी' || c.category === filterCat;
      return matchSearch && matchService && matchGender && matchRisk && matchCat;
    })
    .sort((a, b) => {
      let av: any = a[sortKey], bv: any = b[sortKey];
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? av - bv : bv - av;
    });

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} style={{ color: RULE }} />;
    return sortAsc ? <ChevronUp size={12} style={{ color: NAVY }} /> : <ChevronDown size={12} style={{ color: NAVY }} />;
  }

  const totalApps = citizens.reduce((s, c) => s + c.totalApps, 0);
  const highRisk  = citizens.filter(c => c.riskLevel === 'High').length;

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans','Noto Sans Devanagari',sans-serif", background: SHEET, minHeight: '100%' }}>

      {/* ── HEADER ── */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: '12px', color: MUTED }}>
            <Link to="/app" style={{ color: MUTED }} className="hover:underline">डैशबोर्ड</Link>
            <ChevronRight size={12} />
            <span style={{ color: INK }}>नागरिक रिकॉर्ड</span>
          </div>
          <h1 style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: '24px', fontWeight: 700, color: NAVY }}>
            नागरिक रिकॉर्ड
          </h1>
          <p style={{ fontSize: '13px', color: MUTED }}>Citizen Records — राजनांदगांव CSC | OP-4521</p>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded transition-colors hover:bg-[#2D3F5E]"
          style={{ background: NAVY, color: 'white', fontSize: '12px', fontWeight: 600 }}
        >
          <Download size={13} /> रिकॉर्ड डाउनलोड
        </button>
      </div>

      {/* ── SUMMARY CHIPS ── */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'कुल नागरिक',    labelEn: 'Total Citizens',   value: citizens.length, color: NAVY },
          { label: 'कुल आवेदन',      labelEn: 'Total Applications', value: totalApps,       color: NAVY },
          { label: 'औसत आवेदन',     labelEn: 'Avg per Citizen',  value: (totalApps / citizens.length).toFixed(1), color: NAVY },
          { label: 'उच्च जोखिम',    labelEn: 'High Risk Citizens', value: highRisk,       color: RED  },
          { label: 'इस माह सेवित',   labelEn: 'Served This Month', value: 10,              color: NAVY },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border p-4" style={{ borderColor: RULE }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: INK, marginTop: '3px' }}>{s.label}</p>
            <p style={{ fontSize: '10px', color: MUTED }}>{s.labelEn}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div className="bg-white rounded-lg border p-3.5 mb-4" style={{ borderColor: RULE }}>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="नाम, नागरिक ID, मोबाइल खोजें..."
              className="w-full pl-9 pr-3 py-2 border rounded focus:outline-none transition-colors"
              style={{ borderColor: RULE, fontSize: '13px', color: INK }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border rounded transition-colors hover:bg-gray-50"
            style={{
              borderColor: anyFilter ? NAVY : RULE,
              color: anyFilter ? NAVY : INK,
              fontSize: '12px', fontWeight: anyFilter ? 700 : 400,
            }}
          >
            <Filter size={13} />
            फ़िल्टर
            {anyFilter && <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: '9px', fontWeight: 700 }}>✓</span>}
          </button>

          {(search || anyFilter) && (
            <button
              onClick={() => { setSearch(''); setFilterService('सभी सेवाएं'); setFilterGender('सभी'); setFilterRisk('सभी जोखिम'); setFilterCat('सभी श्रेणी'); }}
              className="flex items-center gap-1.5 px-3 py-2 border rounded transition-colors hover:bg-red-50"
              style={{ borderColor: RULE, color: RED, fontSize: '12px' }}
            >
              <X size={12} /> साफ़ करें
            </button>
          )}

          <p style={{ fontSize: '12px', color: MUTED, marginLeft: 'auto', flexShrink: 0 }}>
            {filtered.length} / {citizens.length} नागरिक
          </p>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t" style={{ borderColor: RULE }}>
            {[
              { label: 'सेवा', value: filterService, onChange: setFilterService, opts: SERVICES_ALL },
              { label: 'लिंग', value: filterGender,  onChange: setFilterGender,  opts: GENDER_ALL   },
              { label: 'जोखिम', value: filterRisk,  onChange: setFilterRisk,    opts: RISK_ALL     },
              { label: 'श्रेणी', value: filterCat,  onChange: setFilterCat,     opts: CATEGORY_ALL },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: INK, display: 'block', marginBottom: '3px' }}>{f.label}</label>
                <select
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="w-full px-2.5 py-2 border rounded focus:outline-none bg-white"
                  style={{ borderColor: RULE, fontSize: '12px', color: INK }}
                >
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: RULE }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: NAVY }}>
                {([
                  { label: '#',            key: null,          w: '44px'  },
                  { label: 'नागरिक',       key: 'name',        w: 'auto'  },
                  { label: 'नागरिक ID',    key: null,          w: '150px' },
                  { label: 'मोबाइल',       key: null,          w: '120px' },
                  { label: 'श्रेणी',       key: null,          w: '90px'  },
                  { label: 'कुल आवेदन',   key: 'totalApps',   w: '100px' },
                  { label: 'अंतिम सेवा',  key: null,          w: '170px' },
                  { label: 'जोखिम स्तर',  key: 'riskScore',   w: '120px' },
                  { label: 'क्रिया',       key: null,          w: '80px'  },
                ] as { label: string; key: string | null; w: string }[]).map(col => (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-left"
                    style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', width: col.w, cursor: col.key ? 'pointer' : 'default', userSelect: 'none' }}
                    onClick={() => col.key && toggleSort(col.key as any)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon col={col.key as any} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center" style={{ fontSize: '13px', color: MUTED }}>
                    कोई रिकॉर्ड नहीं मिला | No records found
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#F5F7FA] transition-colors border-b"
                    style={{ borderColor: RULE, cursor: 'pointer' }}
                    onClick={() => setSelected(c)}
                  >
                    {/* # */}
                    <td className="px-4 py-3" style={{ fontSize: '12px', color: MUTED }}>{i + 1}</td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={30} />
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY }}>{c.name}</p>
                          <p style={{ fontSize: '11px', color: MUTED }}>{c.gender} · {c.dob}</p>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "'Roboto Mono',monospace", fontSize: '11px', color: NAVY, fontWeight: 600 }}>{c.id}</span>
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3" style={{ fontSize: '12px', color: INK, fontFamily: "'Roboto Mono',monospace" }}>
                      {c.mobile}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded border" style={{ fontSize: '11px', fontWeight: 700, color: catColors[c.category] ?? INK, borderColor: RULE }}>
                        {c.category}
                      </span>
                    </td>

                    {/* Total apps */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '14px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2',sans-serif" }}>{c.totalApps}</span>
                        <div className="flex gap-0.5">
                          {c.approved > 0  && <span className="w-1.5 h-4 rounded-sm" style={{ background: GREEN,   opacity: 0.8 }} title={`${c.approved} स्वीकृत`} />}
                          {c.pending > 0   && <span className="w-1.5 h-4 rounded-sm" style={{ background: SAFFRON, opacity: 0.8 }} title={`${c.pending} प्रक्रियाधीन`} />}
                          {c.rejected > 0  && <span className="w-1.5 h-4 rounded-sm" style={{ background: RED,     opacity: 0.8 }} title={`${c.rejected} अस्वीकृत`} />}
                        </div>
                      </div>
                    </td>

                    {/* Last service */}
                    <td className="px-4 py-3">
                      <p style={{ fontSize: '12px', color: INK }}>{c.lastService}</p>
                      <p style={{ fontSize: '11px', color: MUTED, fontFamily: "'Roboto Mono',monospace" }}>{c.lastDate}</p>
                    </td>

                    {/* Risk */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 rounded-full overflow-hidden" style={{ height: '5px', background: RULE }}>
                          <div
                            style={{
                              width: `${c.riskScore}%`, height: '5px',
                              background: riskCfg[c.riskLevel]?.color ?? MUTED,
                              borderRadius: '99px',
                            }}
                          />
                        </div>
                        <span className="px-2 py-0.5 rounded" style={{ fontSize: '10px', fontWeight: 700, ...riskCfg[c.riskLevel] }}>
                          {c.riskLevel}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors hover:bg-[#F5F7FA]"
                        style={{ borderColor: RULE, color: NAVY, fontSize: '11px', fontWeight: 600 }}
                      >
                        <Eye size={12} /> देखें
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: RULE, background: SHEET }}>
          <p style={{ fontSize: '12px', color: MUTED }}>
            {filtered.length} में से {filtered.length} रिकॉर्ड दिखाए गए
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border rounded text-sm transition-colors hover:bg-white" style={{ borderColor: RULE, color: INK, fontSize: '12px' }}>← पिछला</button>
            <span className="px-3 py-1.5 rounded" style={{ background: NAVY, color: 'white', fontSize: '12px' }}>1</span>
            <button className="px-3 py-1.5 border rounded transition-colors hover:bg-white" style={{ borderColor: RULE, color: INK, fontSize: '12px' }}>अगला →</button>
          </div>
        </div>
      </div>

      {/* ── PROFILE DRAWER ── */}
      {selected && <ProfileDrawer citizen={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
