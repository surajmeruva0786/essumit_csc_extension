import React, { useState } from 'react';
import { Link } from 'react-router';
import { Search, Clock, IndianRupee, FileText, ChevronRight, ArrowRight } from 'lucide-react';
import birthCertIcon from 'figma:asset/54e1443fe5df891a15413b1e4aebff6d95eb3718.png';
import deathCertIcon from 'figma:asset/8a9e6b29ede8826a773fb0dcb8e6617fa6302457.png';
import marriageIcon from 'figma:asset/d0b779d5d6795ed76654bb091d1f6d9cca41fc8c.png';
import residenceIcon from 'figma:asset/a44e4ce4c6fe33679a557ce2f665dd9bed65c373.png';
import farmerIcon from 'figma:asset/be2ab8d5eb8679c506a9c0dc9c2cfb72cb32949e.png';
import pensionIcon from 'figma:asset/3d7d71e3c8d6321c827a3e90a846fe61ddcd1802.png';
import incomeIcon from 'figma:asset/d822c91fd76f62163d7c031b8d1d1fb2f4af683a.png';
import casteIcon from 'figma:asset/56f9c4775c575ee990502a6775ddb39c1d3cc8de.png';

const iconMap: Record<string, string> = {
  birth: birthCertIcon,
  death: deathCertIcon,
  marriage: marriageIcon,
  residence: residenceIcon,
  farmer: farmerIcon,
  pension: pensionIcon,
  income: incomeIcon,
  caste: casteIcon,
};

const services = [
  {
    id: 'birth',
    label: 'जन्म प्रमाण पत्र',
    labelEn: 'Birth Certificate',
    category: 'प्रमाण पत्र',
    categoryEn: 'Certificate',
    days: '7 कार्य दिवस',
    fee: '₹30',
    docs: 3,
    color: '#1A7A38',
    desc: 'नवजात शिशु के जन्म का आधिकारिक पंजीकरण एवं प्रमाण पत्र।',
    descEn: 'Official registration and certificate of newborn birth.',
    docList: ['माता-पिता का आधार कार्ड', 'अस्पताल का जन्म प्रमाण', 'राशन कार्ड'],
  },
  {
    id: 'death',
    label: 'मृत्यु प्रमाण पत्र',
    labelEn: 'Death Certificate',
    category: 'प्रमाण पत्र',
    categoryEn: 'Certificate',
    days: '7 कार्य दिवस',
    fee: '₹30',
    docs: 4,
    color: '#3D4F6B',
    desc: 'मृत्यु का आधिकारिक पंजीकरण एवं प्रमाण पत्र।',
    descEn: 'Official registration and certificate of death.',
    docList: ['मृतक का आधार कार्ड', 'अस्पताल का मृत्यु प्रमाण', 'परिवार का राशन कार्ड', 'आवेदक का पहचान पत्र'],
  },
  {
    id: 'income',
    label: 'आय प्रमाण पत्र',
    labelEn: 'Income Certificate',
    category: 'प्रमाण पत्र',
    categoryEn: 'Certificate',
    days: '10 कार्य दिवस',
    fee: '₹20',
    docs: 5,
    color: '#E8701A',
    desc: 'वार्षिक पारिवारिक आय का सरकारी प्रमाण पत्र।',
    descEn: 'Government certificate of annual family income.',
    docList: ['आधार कार्ड', 'राशन कार्ड', 'वेतन पर्ची / आय स्रोत प्रमाण', 'निवास प्रमाण', 'स्व-घोषणा पत्र'],
  },
  {
    id: 'caste',
    label: 'जाति प्रमाण पत्र',
    labelEn: 'Caste Certificate',
    category: 'प्रमाण पत्र',
    categoryEn: 'Certificate',
    days: '15 कार्य दिवस',
    fee: '₹20',
    docs: 6,
    color: '#7A3FC0',
    desc: 'SC/ST/OBC जाति का आधिकारिक सरकारी प्रमाण पत्र।',
    descEn: 'Official government certificate of SC/ST/OBC caste.',
    docList: ['आधार कार्ड', 'राशन कार्ड', 'निवास प्रमाण', 'पूर्व जाति प्रमाण (यदि उपलब्ध)', 'स्व-घोषणा', 'परिवार का जाति प्रमाण'],
  },
  {
    id: 'residence',
    label: 'निवास प्रमाण पत्र',
    labelEn: 'Residence Certificate',
    category: 'प्रमाण पत्र',
    categoryEn: 'Certificate',
    days: '10 कार्य दिवस',
    fee: '₹20',
    docs: 4,
    color: '#003380',
    desc: 'छत्तीसगढ़ राज्य में स्थायी निवास का प्रमाण पत्र।',
    descEn: 'Certificate of permanent residence in Chhattisgarh.',
    docList: ['आधार कार्ड', 'राशन कार्ड', 'बिजली / पानी बिल', 'मकान दस्तावेज़'],
  },
  {
    id: 'marriage',
    label: 'विवाह पंजीकरण',
    labelEn: 'Marriage Registration',
    category: 'पंजीकरण',
    categoryEn: 'Registration',
    days: '15 कार्य दिवस',
    fee: '₹100',
    docs: 7,
    color: '#C0392B',
    desc: 'हिंदू विवाह अधिनियम के अंतर्गत विवाह का पंजीकरण।',
    descEn: 'Marriage registration under Hindu Marriage Act.',
    docList: ['वर का आधार कार्ड', 'वधू का आधार कार्ड', 'विवाह का फोटो', 'गवाहों के आधार कार्ड (2)', 'आयु प्रमाण', 'निवास प्रमाण', 'विवाह कार्ड'],
  },
  {
    id: 'farmer',
    label: 'किसान पंजीकरण',
    labelEn: 'Farmer Registration',
    category: 'पंजीकरण',
    categoryEn: 'Registration',
    days: '5 कार्य दिवस',
    fee: '₹0',
    docs: 8,
    color: '#1A7A38',
    desc: 'कृषि योजनाओं हेतु किसान का आधिकारिक पंजीकरण।',
    descEn: 'Official farmer registration for agricultural schemes.',
    docList: ['आधार कार्ड', 'खसरा / बी-1 प्रति', 'बैंक पासबुक', 'मोबाइल नंबर', 'निवास प्रमाण', 'जाति प्रमाण (यदि लागू)', 'राशन कार्ड', 'पासपोर्ट फोटो'],
  },
  {
    id: 'pension',
    label: 'पेंशन योजना',
    labelEn: 'Pension Schemes',
    category: 'योजना',
    categoryEn: 'Scheme',
    days: '30 कार्य दिवस',
    fee: '₹0',
    docs: 9,
    color: '#7A5C00',
    desc: 'वृद्धावस्था / विधवा / विकलांग पेंशन योजना हेतु आवेदन।',
    descEn: 'Application for old age / widow / disability pension scheme.',
    docList: ['आधार कार्ड', 'आयु प्रमाण', 'बैंक पासबुक', 'निवास प्रमाण', 'आय प्रमाण पत्र', 'जाति प्रमाण पत्र', 'विकलांगता प्रमाण (यदि लागू)', 'पासपोर्ट फोटो', 'BPL कार्ड'],
  },
];

const categories = ['सभी | All', 'प्रमाण पत्र', 'पंजीकरण', 'योजना'];

export function ServicesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('सभी | All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = services.filter((s) => {
    const matchSearch =
      s.label.includes(search) ||
      s.labelEn.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.includes(search);
    const matchCat =
      activeCategory === 'सभी | All' || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Page Hero */}
      <div
        className="py-10 px-4"
        style={{ background: 'linear-gradient(135deg, #1C2B4A 0%, #003380 100%)' }}
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-gray-400 mb-4" style={{ fontSize: '13px' }}>
            <Link to="/" className="hover:text-white transition-colors">मुख्य पृष्ठ</Link>
            <ChevronRight size={13} />
            <span className="text-white">सभी सेवाएं</span>
          </div>

          <h1
            className="text-white mb-2"
            style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '28px', fontWeight: 700 }}
          >
            नागरिक सेवाएं | Citizen Services
          </h1>
          <p className="text-gray-300 mb-6" style={{ fontSize: '15px' }}>
            छत्तीसगढ़ ई-जिला पोर्टल पर उपलब्ध सभी सरकारी सेवाएं
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: '#7A8BA3' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="सेवा खोजें... Search services..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white focus:outline-none"
              style={{ fontSize: '15px', color: '#1C2B4A' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full border transition-all"
              style={{
                background: activeCategory === cat ? '#003380' : 'white',
                color: activeCategory === cat ? 'white' : '#3D4F6B',
                borderColor: activeCategory === cat ? '#003380' : '#D8DDE8',
                fontSize: '13px',
                fontWeight: activeCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-[#7A8BA3]" style={{ fontSize: '13px' }}>
            {filtered.length} सेवाएं उपलब्ध | services available
          </span>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {filtered.map((svc) => {
            const isExpanded = expandedId === svc.id;
            const icon = iconMap[svc.id];
            return (
              <div
                key={svc.id}
                className="bg-white rounded-xl border overflow-hidden transition-all"
                style={{
                  borderColor: isExpanded ? svc.color : '#D8DDE8',
                  boxShadow: isExpanded ? `0 4px 20px ${svc.color}22` : 'none',
                }}
              >
                {/* Card Header */}
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : svc.id)}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${svc.color}18` }}
                  >
                    {icon ? (
                      <img src={icon} alt={svc.labelEn} className="w-9 h-9 object-contain" />
                    ) : (
                      <FileText size={28} style={{ color: svc.color }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-white"
                        style={{ background: svc.color, fontSize: '11px', fontWeight: 600 }}
                      >
                        {svc.category}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded border"
                        style={{ borderColor: '#D8DDE8', color: '#7A8BA3', fontSize: '11px' }}
                      >
                        {svc.docs} दस्तावेज़
                      </span>
                    </div>
                    <h3
                      className="text-[#1C2B4A]"
                      style={{
                        fontFamily: "'Noto Sans Devanagari', sans-serif",
                        fontSize: '16px',
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      {svc.label}
                    </h3>
                    <p className="text-[#7A8BA3]" style={{ fontSize: '13px' }}>
                      {svc.labelEn}
                    </p>
                    <p className="text-[#3D4F6B] mt-1" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                      {svc.desc}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Clock size={13} style={{ color: '#7A8BA3' }} />
                      <span className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>
                        {svc.days}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <IndianRupee size={13} style={{ color: svc.color }} />
                      <span style={{ fontSize: '15px', fontWeight: 700, color: svc.color }}>
                        {svc.fee.replace('₹', '')}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="mt-2 ml-auto transition-transform"
                      style={{
                        color: '#7A8BA3',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    />
                  </div>
                </div>

                {/* Expanded: Documents Required */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5 border-t"
                    style={{ borderColor: '#EEF1F7' }}
                  >
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      {/* Documents list */}
                      <div>
                        <p
                          className="text-[#1C2B4A] mb-3"
                          style={{ fontSize: '14px', fontWeight: 700 }}
                        >
                          आवश्यक दस्तावेज़ | Required Documents
                        </p>
                        <ul className="space-y-2">
                          {svc.docList.map((doc, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                                style={{ background: svc.color, fontSize: '10px', fontWeight: 700 }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-[#3D4F6B]" style={{ fontSize: '13px' }}>
                                {doc}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Service Details */}
                      <div>
                        <p
                          className="text-[#1C2B4A] mb-3"
                          style={{ fontSize: '14px', fontWeight: 700 }}
                        >
                          सेवा विवरण | Service Details
                        </p>
                        <div className="space-y-3">
                          <div
                            className="p-3 rounded-lg"
                            style={{ background: '#F5F7FA' }}
                          >
                            <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>
                              श्रेणी | Category
                            </p>
                            <p
                              className="text-[#1C2B4A]"
                              style={{ fontSize: '13px', fontWeight: 600 }}
                            >
                              {svc.category} ({svc.categoryEn})
                            </p>
                          </div>
                          <div
                            className="p-3 rounded-lg"
                            style={{ background: '#F5F7FA' }}
                          >
                            <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>
                              प्रसंस्करण समय | Processing Time
                            </p>
                            <p
                              className="text-[#1C2B4A]"
                              style={{ fontSize: '13px', fontWeight: 600 }}
                            >
                              {svc.days}
                            </p>
                          </div>
                          <div
                            className="p-3 rounded-lg"
                            style={{ background: '#F5F7FA' }}
                          >
                            <p className="text-[#7A8BA3]" style={{ fontSize: '12px' }}>
                              शुल्क | Fee
                            </p>
                            <p
                              style={{ fontSize: '15px', fontWeight: 700, color: svc.color }}
                            >
                              {svc.fee === '₹0' ? 'निःशुल्क (Free)' : svc.fee}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/login"
                          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-all hover:opacity-90"
                          style={{ background: svc.color, fontSize: '14px', fontWeight: 700 }}
                        >
                          आवेदन करें | Apply Now
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#7A8BA3]" style={{ fontSize: '16px' }}>
              कोई सेवा नहीं मिली। No services found.
            </p>
          </div>
        )}

        {/* CTA Banner */}
        <div
          className="mt-8 rounded-xl p-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FF9933, #E8701A)' }}
        >
          <div>
            <h3
              className="text-white mb-1"
              style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '20px', fontWeight: 700 }}
            >
              CSC ऑपरेटर हैं? | Are you a CSC Operator?
            </h3>
            <p className="text-white/85" style={{ fontSize: '14px' }}>
              लॉगिन करें और नागरिकों के लिए आवेदन प्रक्रिया शुरू करें।
            </p>
          </div>
          <Link
            to="/login"
            className="px-6 py-3 bg-white rounded-xl hover:opacity-90 transition-opacity"
            style={{ color: '#E8701A', fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            ऑपरेटर लॉगिन →
          </Link>
        </div>
      </div>
    </div>
  );
}
