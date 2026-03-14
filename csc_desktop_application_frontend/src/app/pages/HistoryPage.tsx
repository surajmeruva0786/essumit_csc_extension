import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Filter, Download, Eye, RefreshCw } from 'lucide-react';

interface ApplicationData {
  id: string;
  name: string;
  service: string;
  date: string;
  status: string;
  risk: string;
  riskScore: number;
  fields_json?: any;
}

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

const services = ['सभी सेवाएं', 'जन्म प्रमाण पत्र', 'मृत्यु प्रमाण पत्र', 'आय प्रमाण पत्र', 'जाति प्रमाण पत्र', 'निवास प्रमाण पत्र', 'विवाह पंजीकरण', 'पेंशन योजना'];
const statuses = ['सभी स्थिति', 'स्वीकृत', 'प्रक्रियाधीन', 'अस्वीकृत'];

export function HistoryPage() {
  const [allApplications, setAllApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('सभी सेवाएं');
  const [selectedStatus, setSelectedStatus] = useState('सभी स्थिति');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:5000/api/desktop/applications');
      if (res.ok) {
        const data = await res.json();
        setAllApplications(data);
      }
    } catch (e) {
      console.error('Failed to fetch applications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (appId: string) => {
    try {
      setSyncingId(appId);
      const res = await fetch('http://127.0.0.1:5000/api/sync/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId })
      });
      if (res.ok) {
        // Find mapped URL if possible, otherwise default state portal
        window.open('https://edistrict.cgstate.gov.in/PACE/login.do', '_blank');
      } else {
        alert('Failed to stage sync. Ensure local server is running.');
      }
    } catch (e) {
      console.error('Sync failed', e);
      alert('Network error during sync.');
    } finally {
      setSyncingId(null);
    }
  };

  const filtered = allApplications.filter((app: ApplicationData) => {
    const matchSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase());
    const matchService = selectedService === 'सभी सेवाएं' || app.service === selectedService;
    const matchStatus = selectedStatus === 'सभी स्थिति' || app.status === selectedStatus;
    
    // Simple date filter logic
    if (dateFrom && new Date(app.date.split('/').reverse().join('-')) < new Date(dateFrom)) return false;
    if (dateTo && new Date(app.date.split('/').reverse().join('-')) > new Date(dateTo)) return false;

    return matchSearch && matchService && matchStatus;
  });

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-[#7A8BA3] mb-1" style={{ fontSize: '13px' }}>
            <span>डैशबोर्ड</span> <ChevronRight size={13} /> <span className="text-[#3D4F6B]">आवेदन इतिहास</span>
          </div>
          <h1 className="text-[#1C2B4A]" style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '26px', fontWeight: 700 }}>
            आवेदन इतिहास | Application History
          </h1>
          <p className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>
            राजनांदगांव CSC — OP-4521 | {allApplications.length} कुल आवेदन
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded transition-colors hover:bg-[#2D3F5E]"
          style={{ background: '#1C2B4A', color: 'white', fontSize: '13px', fontWeight: 600, border: '1px solid #2D3F5E' }}
        >
          <Download size={15} />
          Excel डाउनलोड | Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'कुल', value: allApplications.length, color: '#003380', bg: '#EEF4FF' },
          {
            label: 'स्वीकृत',
            value: allApplications.filter((a: ApplicationData) => a.status === 'स्वीकृत').length,
            color: '#1A7A38',
            bg: '#E6F5EC',
          },
          {
            label: 'प्रक्रियाधीन',
            value: allApplications.filter((a: ApplicationData) => a.status === 'प्रक्रियाधीन').length,
            color: '#E8701A',
            bg: '#FFF0E0',
          },
          {
            label: 'अस्वीकृत',
            value: allApplications.filter((a: ApplicationData) => a.status === 'अस्वीकृत').length,
            color: '#D93025',
            bg: '#FEECEC',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-5 text-center" style={{ borderColor: '#D8DDE8' }}>
            <p
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontSize: '34px',
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
            <p className="text-[#3D4F6B] mt-1" style={{ fontSize: '14px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-4 flex items-center gap-4 flex-wrap" style={{ borderColor: '#D8DDE8' }}>
        <div className="flex items-center gap-2 text-[#7A8BA3]">
          <Filter size={17} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>फ़िल्टर | Filters</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8BA3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम या संदर्भ ID खोजें..."
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none"
            style={{ borderColor: '#D8DDE8', fontSize: '14px' }}
          />
        </div>

        {/* Service filter */}
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="px-3 py-2.5 border rounded-lg focus:outline-none"
          style={{ borderColor: '#D8DDE8', fontSize: '14px', color: '#3D4F6B', minWidth: '170px' }}
        >
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2.5 border rounded-lg focus:outline-none"
          style={{ borderColor: '#D8DDE8', fontSize: '14px', color: '#3D4F6B', minWidth: '150px' }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2.5 border rounded-lg focus:outline-none"
          style={{ borderColor: '#D8DDE8', fontSize: '14px', color: '#3D4F6B' }}
        />
        <span className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>से</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2.5 border rounded-lg focus:outline-none"
          style={{ borderColor: '#D8DDE8', fontSize: '14px', color: '#3D4F6B' }}
        />

        {(search || selectedService !== 'सभी सेवाएं' || selectedStatus !== 'सभी स्थिति') && (
          <button
            onClick={() => { setSearch(''); setSelectedService('सभी सेवाएं'); setSelectedStatus('सभी स्थिति'); }}
            className="px-3 py-2.5 text-[#D93025] border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            style={{ fontSize: '13px' }}
          >
            फ़िल्टर हटाएं
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8F9FC' }}>
                {['#', 'संदर्भ ID', 'नागरिक नाम', 'सेवा', 'तिथि', 'स्थिति', 'AI जोखिम स्कोर', 'क्रिया'].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#7A8BA3]" style={{ fontSize: '14px' }}>
                    कोई परिणाम नहीं मिला | No results found
                  </td>
                </tr>
              ) : (
                filtered.map((app: ApplicationData, i: number) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: '1px solid #EEF1F7' }}
                  >
                    <td className="px-4 py-3.5 text-[#7A8BA3]" style={{ fontSize: '13px' }}>{i + 1}</td>
                    <td className="px-4 py-3.5">
                      <span
                        style={{
                          fontFamily: "'Roboto Mono', monospace",
                          fontSize: '12px',
                          color: '#003380',
                          fontWeight: 600,
                        }}
                      >
                        {app.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#1C2B4A]" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '14px', fontWeight: 600 }}>
                        {app.name}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-[#3D4F6B]" style={{ fontSize: '13px' }}>{app.service}</td>
                    <td className="px-4 py-3.5 text-[#7A8BA3]" style={{ fontSize: '13px', fontFamily: "'Roboto Mono', monospace" }}>
                      {app.date}
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
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${app.riskScore}%`,
                              background: riskConfig[app.risk]?.color,
                            }}
                          />
                        </div>
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            background: riskConfig[app.risk]?.bg,
                            color: riskConfig[app.risk]?.color,
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          {app.riskScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all hover:bg-blue-50"
                          style={{ borderColor: '#003380', color: '#003380', fontSize: '12px' }}
                        >
                          <Eye size={13} />
                          देखें
                        </button>
                        <button
                          onClick={() => handleSync(app.id)}
                          disabled={syncingId === app.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{ 
                            background: syncingId === app.id ? '#ccc' : '#E8701A', 
                            color: 'white', 
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: syncingId === app.id ? 'wait' : 'pointer'
                          }}
                        >
                          <RefreshCw size={12} className={syncingId === app.id ? "animate-spin" : ""} />
                          {syncingId === app.id ? 'सिंक हो रहा है...' : 'सिंक (Sync)'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div
          className="px-5 py-3.5 flex items-center justify-between border-t"
          style={{ borderColor: '#EEF1F7', background: '#F8F9FC' }}
        >
          <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
            {filtered.length} में से {filtered.length} परिणाम दिखाए गए
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded border text-[#7A8BA3] hover:bg-gray-100 transition-colors"
              style={{ fontSize: '13px', borderColor: '#D8DDE8' }}
            >
              ← पिछला
            </button>
            <span
              className="px-3 py-2 rounded text-white"
              style={{ background: '#003380', fontSize: '13px' }}
            >
              1
            </span>
            <button
              className="px-3 py-2 rounded border text-[#7A8BA3] hover:bg-gray-100 transition-colors"
              style={{ fontSize: '13px', borderColor: '#D8DDE8' }}
            >
              अगला →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}