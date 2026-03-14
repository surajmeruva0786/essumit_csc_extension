import React from 'react';
import { Link } from 'react-router';
const bannerImg = '/slider8.jpg.jpeg';
import { AshokChakra } from '../components/AshokChakra';

const services = [
  { icon: '/i1.png', emoji: '👶', label: 'जन्म प्रमाण पत्र', labelEn: 'Birth Certificate', days: '7 कार्य दिवस', fee: '₹30' },
  { icon: '/i2.png', emoji: '🕊️', label: 'मृत्यु प्रमाण पत्र', labelEn: 'Death Certificate', days: '7 कार्य दिवस', fee: '₹30' },
  { icon: '/i3.png', emoji: '📄', label: 'आय प्रमाण पत्र', labelEn: 'Income Certificate', days: '10 कार्य दिवस', fee: '₹20' },
  { icon: '/i4.png', emoji: '🏷️', label: 'जाति प्रमाण पत्र', labelEn: 'Caste Certificate', days: '15 कार्य दिवस', fee: '₹20' },
  { icon: '/i5.png', emoji: '🏠', label: 'निवास प्रमाण पत्र', labelEn: 'Residence Certificate', days: '10 कार्य दिवस', fee: '₹20' },
  { icon: '/i6.png', emoji: '💍', label: 'विवाह पंजीकरण', labelEn: 'Marriage Registration', days: '15 कार्य दिवस', fee: '₹100' },
  { icon: '/i7.png', emoji: '👴', label: 'पेंशन योजना', labelEn: 'Pension Schemes', days: '30 कार्य दिवस', fee: '₹0' },
  { icon: null,      emoji: '🎓', label: 'शैक्षिक प्रमाण पत्र', labelEn: 'Educational Certificate', days: '7 कार्य दिवस', fee: '₹50' },
  { icon: '/i8.png', emoji: '🌾', label: 'किसान पंजीकरण', labelEn: 'Farmer Registration', days: '5 कार्य दिवस', fee: '₹0' },
];

const stats = [
  { number: '1,24,832', label: 'कुल आवेदन', labelEn: 'Total Applications' },
  { number: '98,234', label: 'स्वीकृत', labelEn: 'Approved' },
  { number: '1,256', label: 'CSC केंद्र', labelEn: 'CSC Centers' },
  { number: '99.2%', label: 'सफलता दर', labelEn: 'Success Rate' },
];

const updates = [
  { date: '10 मार्च 2026', text: 'राजनांदगांव जिले में नई CSC केंद्र खोलने के लिए आवेदन आमंत्रित', category: 'नोटिस' },
  { date: '05 मार्च 2026', text: 'जाति प्रमाण पत्र हेतु दस्तावेज़ सूची में संशोधन', category: 'अद्यतन' },
  { date: '01 मार्च 2026', text: 'CSC सहायक v2.0 में AI निष्कर्षण सुविधा जोड़ी गई', category: 'नई सुविधा' },
  { date: '25 फरवरी 2026', text: 'पेंशन योजना के लिए ऑनलाइन आवेदन प्रक्रिया सरल की गई', category: 'अद्यतन' },
  { date: '20 फरवरी 2026', text: 'मार्च 2026 से डिजिटल सिग्नेचर अनिवार्य', category: 'सूचना' },
];

const categoryColor: Record<string, string> = {
  'नोटिस': '#D93025',
  'अद्यतन': '#E8A020',
  'नई सुविधा': '#1A7A38',
  'सूचना': '#003380',
};

export function PortalHome() {
  return (
    <div style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>

      {/* HERO BANNER */}
      <div className="w-full" style={{ maxHeight: '260px', overflow: 'hidden' }}>
        <img
          src={bannerImg}
          alt="लोक सेवा केंद्र - CSC Sahayak Banner"
          className="w-full object-cover object-center"
          style={{ width: '100%', display: 'block' }}
        />
      </div>

      {/* Stats Bar */}
      <div style={{ background: 'linear-gradient(135deg, #FF9933, #E8701A)' }} className="py-5">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-4 divide-x divide-white/30">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white px-4">
                <p
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  {stat.number}
                </p>
                <p style={{ fontSize: '15px', fontWeight: 600 }}>{stat.label}</p>
                <p style={{ fontSize: '13px', opacity: 0.85 }}>{stat.labelEn}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-7">
        <div className="grid grid-cols-3 gap-7">

          {/* Services Grid (2/3 width) */}
          <div className="col-span-2">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-9 rounded" style={{ background: '#E8701A' }} />
                <div>
                  <h2
                    className="text-[#1C2B4A]"
                    style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '22px', fontWeight: 700 }}
                  >
                    नागरिक सेवाएं
                  </h2>
                  <p className="text-[#7A8BA3]" style={{ fontSize: '14px' }}>Available Citizen Services</p>
                </div>
              </div>
              <Link
                to="/services"
                className="text-white px-5 py-2.5 rounded transition-all hover:opacity-90"
                style={{ background: '#003380', fontSize: '14px' }}
              >
                सभी सेवाएं देखें →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {services.map((svc) => (
                <Link
                  to="/services"
                  key={svc.label}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-all group cursor-pointer block"
                  style={{ borderColor: '#D8DDE8' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: '#FFF0E0', fontSize: '26px' }}
                    >
                      {svc.icon ? (
                        <img src={svc.icon} alt={svc.labelEn} className="w-8 h-8 object-contain" />
                      ) : (
                        svc.emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[#1C2B4A]"
                        style={{
                          fontFamily: "'Noto Sans Devanagari', sans-serif",
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        {svc.label}
                      </p>
                      <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>{svc.labelEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: '#EEF1F7' }}>
                    <span className="text-[#7A8BA3]" style={{ fontSize: '11px' }}>⏱ {svc.days}</span>
                    <span
                      className="px-2 py-0.5 rounded text-white"
                      style={{ background: '#1A7A38', fontSize: '11px', fontWeight: 600 }}
                    >
                      {svc.fee}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Announcements & Links */}
          <div className="col-span-1 space-y-5">
            {/* News & Updates */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: '#003380' }}
              >
                <span className="text-yellow-400 text-lg"></span>
                <h3 className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>
                  नवीनतम सूचनाएं | Updates
                </h3>
              </div>
              <div className="divide-y" style={{ borderColor: '#EEF1F7' }}>
                {updates.map((update, i) => (
                  <div key={i} className="p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-white px-2 py-0.5 rounded"
                        style={{ background: categoryColor[update.category] || '#7A8BA3', fontSize: '11px' }}
                      >
                        {update.category}
                      </span>
                      <span className="text-[#7A8BA3]" style={{ fontSize: '11px' }}>{update.date}</span>
                    </div>
                    <p className="text-[#3D4F6B]" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                      {update.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-gray-50 border-t" style={{ borderColor: '#EEF1F7' }}>
                <a href="#" className="text-[#003380] hover:underline" style={{ fontSize: '13px' }}>सभी सूचनाएं देखें → View All</a>
              </div>
            </div>

            {/* Important Links */}
            <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#D8DDE8' }}>
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: '#1A7A38' }}
              >
                <span className="text-yellow-400 text-lg"></span>
                <h3 className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>
                  महत्वपूर्ण लिंक | Important Links
                </h3>
              </div>
              <div className="p-3 space-y-2.5">
                {[
                  'cgstate.gov.in',
                  'edistrict.cgstate.gov.in',
                  'chips.gov.in',
                  'digitalseva.csc.gov.in',
                  'digilocker.gov.in',
                  'uidai.gov.in',
                  'india.gov.in',
                ].map((link) => (
                  <a
                    key={link}
                    href={`https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#003380] hover:text-[#E8701A] transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    <span className="text-[#E8701A]">▶</span>
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Helpdesk */}
            <div
              className="rounded-lg p-5"
              style={{ background: 'linear-gradient(135deg, #1C2B4A, #2D3F5E)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AshokChakra size={30} color="#FFD700" />
                <h3 className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>
                  सहायता केंद्र
                </h3>
              </div>
              <p className="text-gray-400 mb-3" style={{ fontSize: '13px' }}>
                किसी भी समस्या के लिए हमारी हेल्पडेस्क से संपर्क करें।
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white" style={{ fontSize: '15px' }}>
                  <span>📞</span>
                  <span className="font-semibold">1800-233-0006</span>
                </div>
                <p className="text-gray-500" style={{ fontSize: '12px' }}>टोल फ्री | सोम-शनि | 9AM-6PM</p>
              </div>
              <Link
                to="/login"
                className="mt-4 w-full text-center block py-2.5 rounded text-white transition-all hover:opacity-90"
                style={{ background: '#E8701A', fontSize: '14px', fontWeight: 600 }}
              >
                ऑपरेट पोर्टल →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}