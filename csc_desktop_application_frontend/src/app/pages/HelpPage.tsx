import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronRight, ChevronDown, Phone, Mail, MessageSquare,
  BookOpen, Video, Download, Search, HelpCircle, CheckCircle,
  FileText, Upload, Cpu, Shield, Users, Send, ExternalLink,
  Headphones, AlertCircle, PlayCircle, Eye,
} from 'lucide-react';

/* ─── palette ─────────────────────────────────────────
   Navy  #1C2B4A   (headings, buttons, icon fill)
   Ink   #3D4F6B   (body text)
   Muted #6B7A93   (captions, placeholders)
   Rule  #DDE1EA   (borders, dividers)
   Sheet #F5F7FA   (subtle backgrounds)
   Accent #E8701A  (left accent bar only – used nowhere else as fill)
──────────────────────────────────────────────────────── */

const NAVY   = '#1C2B4A';
const INK    = '#3D4F6B';
const MUTED  = '#6B7A93';
const RULE   = '#DDE1EA';
const SHEET  = '#F5F7FA';
const ACCENT = '#E8701A';

/* ──────── FAQ DATA ──────── */
const faqCategories = [
  { id: 'general',     label: 'सामान्य',     labelEn: 'General',     icon: HelpCircle },
  { id: 'application', label: 'आवेदन',       labelEn: 'Application', icon: FileText },
  { id: 'documents',   label: 'दस्तावेज़',   labelEn: 'Documents',   icon: Upload },
  { id: 'ai',          label: 'AI सेवाएं',   labelEn: 'AI Tools',    icon: Cpu },
  { id: 'technical',   label: 'तकनीकी',      labelEn: 'Technical',   icon: Shield },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  general: [
    { q: 'CSC सहायक पोर्टल क्या है? | What is CSC Sahayak Portal?',
      a: 'CSC सहायक एक AI-संचालित नागरिक सेवा प्रबंधन प्रणाली है जो छत्तीसगढ़ सरकार के ई-जिला पोर्टल से जुड़ी है। CSC ऑपरेटर इसके माध्यम से नागरिकों के लिए विभिन्न सरकारी प्रमाण पत्र एवं सेवाओं के लिए आवेदन कर सकते हैं।' },
    { q: 'पोर्टल का उपयोग कौन कर सकता है? | Who can use this portal?',
      a: 'यह पोर्टल केवल पंजीकृत CSC (Common Service Centre) ऑपरेटरों के लिए है। नागरिक सीधे किसी भी नज़दीकी CSC केंद्र पर जाकर सेवाएं प्राप्त कर सकते हैं।' },
    { q: 'पोर्टल पर कौन-कौन सी सेवाएं उपलब्ध हैं? | What services are available?',
      a: 'जन्म प्रमाण पत्र, मृत्यु प्रमाण पत्र, आय प्रमाण पत्र, जाति प्रमाण पत्र, निवास प्रमाण पत्र, विवाह पंजीकरण, किसान पंजीकरण, पेंशन योजना आवेदन आदि सेवाएं उपलब्ध हैं।' },
    { q: 'पोर्टल का उपयोग निःशुल्क है? | Is the portal free to use?',
      a: 'पोर्टल का उपयोग निःशुल्क है। हालांकि, प्रत्येक सेवा के लिए सरकार द्वारा निर्धारित सेवा शुल्क लागू होता है जो नागरिक से लिया जाता है।' },
  ],
  application: [
    { q: 'नया आवेदन कैसे शुरू करें? | How to start a new application?',
      a: '1. साइडबार में "नया आवेदन" पर क्लिक करें।\n2. नागरिक का नाम, मोबाइल नंबर और पता भरें।\n3. वांछित सेवा चुनें।\n4. "दस्तावेज़ अपलोड करें" बटन पर क्लिक करें और प्रक्रिया जारी रखें।' },
    { q: 'आवेदन की स्थिति कैसे जानें? | How to check application status?',
      a: '"आवेदन इतिहास" पेज पर जाएं। वहां सभी आवेदनों की वर्तमान स्थिति, तारीख और विवरण देख सकते हैं।' },
    { q: 'आवेदन अस्वीकृत होने पर क्या करें? | What to do if application is rejected?',
      a: 'अस्वीकृति का कारण ध्यान से पढ़ें। आवश्यक दस्तावेज़ सुधारकर या जोड़कर पुनः आवेदन करें।' },
    { q: 'एक बार में कितने आवेदन किए जा सकते हैं? | How many applications at once?',
      a: 'एक ऑपरेटर एक साथ कई आवेदन कर सकता है। प्रत्येक आवेदन अलग-अलग नागरिक के लिए होना चाहिए।' },
  ],
  documents: [
    { q: 'कौन से दस्तावेज़ फॉर्मेट स्वीकार किए जाते हैं? | Accepted formats?',
      a: 'PDF, JPG, JPEG, PNG फॉर्मेट स्वीकार किए जाते हैं। प्रत्येक दस्तावेज़ का अधिकतम आकार 5 MB है।' },
    { q: 'AI दस्तावेज़ निष्कर्षण कैसे काम करता है? | How does AI extraction work?',
      a: 'AI प्रणाली अपलोड किए गए दस्तावेज़ों को स्कैन करके नाम, जन्म तिथि, पता आदि जानकारी स्वतः निकालती है।' },
    { q: 'दस्तावेज़ अपलोड में विफलता हो तो क्या करें? | Upload failure?',
      a: '1. इंटरनेट कनेक्शन जांचें।\n2. फ़ाइल 5 MB से कम है यह सुनिश्चित करें।\n3. ब्राउज़र रिफ्रेश करके पुनः प्रयास करें।' },
    { q: 'आधार कार्ड अनिवार्य है? | Is Aadhaar mandatory?',
      a: 'अधिकांश सेवाओं के लिए आधार कार्ड अनिवार्य है। कुछ सेवाओं में वैकल्पिक पहचान पत्र भी स्वीकार किए जाते हैं।' },
  ],
  ai: [
    { q: 'AI जोखिम सत्यापन क्या है? | What is AI Risk Validation?',
      a: 'AI जोखिम सत्यापन एक स्वचालित प्रणाली है जो आवेदन में संभावित त्रुटियों और जोखिम स्तर की पहचान करती है।' },
    { q: 'AI निष्कर्षण की सटीकता कितनी है? | AI extraction accuracy?',
      a: 'AI निष्कर्षण की औसत सटीकता 94.7% है। ऑपरेटर को सभी निकाली गई जानकारी की समीक्षा करनी चाहिए।' },
    { q: 'AI सहायक चैटबॉट क्या करता है? | What does the AI chatbot do?',
      a: 'AI सहायक आवेदन प्रक्रिया में मार्गदर्शन, दस्तावेज़ों की सूची और सामान्य प्रश्नों के उत्तर प्रदान करता है।' },
  ],
  technical: [
    { q: 'पासवर्ड भूल जाने पर क्या करें? | Forgot password?',
      a: 'लॉगिन पेज पर "पासवर्ड भूल गए?" पर क्लिक करें। पंजीकृत मोबाइल पर OTP भेजा जाएगा।' },
    { q: 'कौन सा ब्राउज़र सबसे अच्छा है? | Best browser?',
      a: 'Google Chrome (v90+), Mozilla Firefox (v88+), Microsoft Edge (v90+) अनुशंसित हैं।' },
    { q: 'पोर्टल धीमा चल रहा है? | Portal is slow?',
      a: '1. ब्राउज़र कैश साफ़ करें।\n2. इंटरनेट स्पीड जांचें (न्यूनतम 2 Mbps)।\n3. अन्य टैब बंद करें।' },
    { q: 'सत्र समाप्त (Session Expired) हो जाए? | Session expires?',
      a: 'सत्र 30 मिनट की निष्क्रियता के बाद समाप्त हो जाता है। पुनः लॉगिन करें।' },
  ],
};

const guides = [
  { icon: FileText, title: 'नया आवेदन गाइड',          titleEn: 'New Application Guide',      pages: '12 पृष्ठ' },
  { icon: Upload,   title: 'दस्तावेज़ अपलोड गाइड',    titleEn: 'Document Upload Guide',      pages: '8 पृष्ठ'  },
  { icon: Cpu,      title: 'AI निष्कर्षण मैनुअल',     titleEn: 'AI Extraction Manual',       pages: '15 पृष्ठ' },
  { icon: Shield,   title: 'जोखिम सत्यापन गाइड',      titleEn: 'Risk Validation Guide',      pages: '10 पृष्ठ' },
  { icon: Users,    title: 'ऑपरेटर प्रशिक्षण सामग्री', titleEn: 'Operator Training Material', pages: '25 पृष्ठ' },
  { icon: BookOpen, title: 'सेवा शुल्क अनुसूची',       titleEn: 'Service Fee Schedule',       pages: '4 पृष्ठ'  },
];

const videoTutorials = [
  { title: 'CSC सहायक परिचय',        titleEn: 'Introduction to CSC Sahayak',   duration: '5:32', views: '12,450' },
  { title: 'जन्म प्रमाण पत्र आवेदन', titleEn: 'Birth Certificate Application', duration: '8:15', views: '9,870'  },
  { title: 'AI दस्तावेज़ निष्कर्षण', titleEn: 'AI Document Extraction',        duration: '6:45', views: '8,230'  },
  { title: 'आय प्रमाण पत्र प्रक्रिया', titleEn: 'Income Certificate Process',  duration: '7:20', views: '6,540'  },
];

const contactOptions = [
  { icon: Phone,          label: 'टोल-फ्री हेल्पलाइन', labelEn: 'Toll-Free Helpline', value: '1800-233-0006',         sub: 'सोम–शनि  |  9 AM – 6 PM'   },
  { icon: Phone,          label: 'राज्य हेल्पडेस्क',    labelEn: 'State Helpdesk',     value: '0771-2234567',          sub: 'सोम–शुक्र  |  10 AM – 5 PM' },
  { icon: Mail,           label: 'ईमेल सहायता',         labelEn: 'Email Support',      value: 'helpdesk@cgstate.gov.in', sub: '24 घंटे में उत्तर'          },
  { icon: MessageSquare,  label: 'ऑनलाइन टिकट',         labelEn: 'Online Ticket',      value: 'tickets.cgstate.gov.in', sub: 'ट्रैकिंग सहित'              },
];

/* ──────────────────── SMALL REUSABLES ──────────────────── */

function SectionHeader({ accent, title, sub }: { accent?: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: RULE }}>
      <div className="w-1 h-6 rounded-sm flex-shrink-0" style={{ background: accent ?? ACCENT }} />
      <div>
        <p style={{ fontSize: '15px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2', sans-serif" }}>{title}</p>
        <p style={{ fontSize: '12px', color: MUTED }}>{sub}</p>
      </div>
    </div>
  );
}

/* ──────────────────── MAIN COMPONENT ──────────────────── */

export function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openFaq, setOpenFaq]               = useState<number | null>(null);
  const [search, setSearch]                 = useState('');
  const [ticketName, setTicketName]         = useState('');
  const [ticketSubject, setTicketSubject]   = useState('');
  const [ticketMessage, setTicketMessage]   = useState('');
  const [ticketSent, setTicketSent]         = useState(false);
  const [ticketId]                          = useState(() => `TKT-2026-${Math.floor(Math.random() * 90000) + 10000}`);

  const activeFaqs   = faqs[activeCategory] ?? [];
  const filteredFaqs = search.trim()
    ? Object.values(faqs).flat().filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase()))
    : activeFaqs;

  const card = "bg-white rounded-lg border overflow-hidden";
  const inputCls = "w-full px-3 py-2 rounded border bg-white focus:outline-none focus:border-[#1C2B4A] transition-colors";
  const inputStyle = { borderColor: RULE, fontSize: '13px', color: INK };

  return (
    <div className="p-6" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif", background: SHEET, minHeight: '100%' }}>

      {/* ── PAGE HEADER ── */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: '12px', color: MUTED }}>
          <Link to="/app" className="hover:underline" style={{ color: MUTED }}>डैशबोर्ड</Link>
          <ChevronRight size={12} />
          <span style={{ color: INK }}>सहायता केंद्र</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '24px', fontWeight: 700, color: NAVY }}>
              सहायता केंद्र
            </h1>
            <p style={{ fontSize: '13px', color: MUTED }}>Help &amp; Support — मार्गदर्शन, FAQ, वीडियो ट्यूटोरियल और संपर्क सहायता</p>
          </div>

          {/* Stat chips */}
          <div className="flex items-center gap-3">
            {[
              { val: '94.7%', label: 'समाधान दर' },
              { val: '< 4 hrs', label: 'Avg. Response' },
              { val: '24 / 7', label: 'ऑनलाइन सहायता' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg border px-4 py-2.5 text-center" style={{ borderColor: RULE }}>
                <p style={{ fontSize: '17px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2', sans-serif" }}>{s.val}</p>
                <p style={{ fontSize: '11px', color: MUTED }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTACT ROW ── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {contactOptions.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`${card} p-4`} style={{ borderColor: RULE }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: SHEET }}>
                  <Icon size={16} style={{ color: NAVY }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: NAVY }}>{c.label}</p>
                  <p style={{ fontSize: '11px', color: MUTED }}>{c.labelEn}</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY, fontFamily: "'Roboto Mono', monospace" }}>
                {c.value}
              </p>
              <p style={{ fontSize: '11px', color: MUTED, marginTop: '2px' }}>{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-5">

          {/* FAQ */}
          <div className={card} style={{ borderColor: RULE }}>

            {/* FAQ header row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: RULE, background: NAVY }}>
              <HelpCircle size={17} style={{ color: '#FFD700', flexShrink: 0 }} />
              <div className="flex-1">
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', fontFamily: "'Baloo 2', sans-serif" }}>
                  अक्सर पूछे जाने वाले प्रश्न
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Frequently Asked Questions</p>
              </div>
              {/* Search */}
              <div className="relative" style={{ width: '220px' }}>
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.45)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setOpenFaq(null); }}
                  placeholder="FAQ खोजें..."
                  className="w-full pl-8 pr-3 py-1.5 rounded focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
              </div>
            </div>

            {/* Category tabs */}
            {!search.trim() && (
              <div className="flex overflow-x-auto border-b" style={{ borderColor: RULE }}>
                {faqCategories.map(cat => {
                  const Icon = cat.icon;
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setOpenFaq(null); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap border-b-2 transition-all"
                      style={{
                        borderBottomColor: active ? NAVY : 'transparent',
                        color: active ? NAVY : MUTED,
                        fontSize: '12px',
                        fontWeight: active ? 700 : 400,
                        background: 'transparent',
                      }}
                    >
                      <Icon size={13} />
                      {cat.label}
                      <span style={{ fontSize: '10px', color: active ? MUTED : 'transparent' }}>{cat.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* FAQ items */}
            <div>
              {filteredFaqs.length === 0 ? (
                <div className="py-10 text-center" style={{ color: MUTED, fontSize: '13px' }}>
                  कोई परिणाम नहीं मिला। No results found.
                </div>
              ) : (
                filteredFaqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="border-b last:border-0" style={{ borderColor: RULE }}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#F5F7FA]"
                      >
                        <span
                          className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: isOpen ? NAVY : SHEET, fontSize: '10px', fontWeight: 700, color: isOpen ? 'white' : MUTED }}
                        >
                          {i + 1}
                        </span>
                        <p className="flex-1" style={{ fontSize: '13px', fontWeight: isOpen ? 700 : 500, color: isOpen ? NAVY : INK, lineHeight: 1.55 }}>
                          {faq.q}
                        </p>
                        <ChevronDown
                          size={15}
                          className="flex-shrink-0 mt-0.5 transition-transform"
                          style={{ color: MUTED, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4" style={{ paddingLeft: '52px', background: '#FAFBFC' }}>
                          <div className="rounded border-l-2 pl-4 py-3" style={{ borderColor: NAVY, background: 'white' }}>
                            <p style={{ fontSize: '13px', color: INK, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{faq.a}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-2.5">
                            <span style={{ fontSize: '11px', color: MUTED }}>क्या यह उत्तर सहायक था?</span>
                            <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-100 transition-colors" style={{ fontSize: '11px', color: '#2D7A2D' }}>
                              <CheckCircle size={11} /> हाँ
                            </button>
                            <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-100 transition-colors" style={{ fontSize: '11px', color: '#B91C1C' }}>
                              <AlertCircle size={11} /> नहीं
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* VIDEO TUTORIALS */}
          <div className={card} style={{ borderColor: RULE }}>
            <SectionHeader title="वीडियो ट्यूटोरियल | Video Tutorials" sub="Step-by-step video guides" />
            <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: RULE }}>
              {videoTutorials.map((v, i) => (
                <div key={i} className="p-4 hover:bg-[#F5F7FA] cursor-pointer transition-colors group">
                  <div className="flex items-start gap-3">
                    {/* Monochrome play icon box */}
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ background: SHEET, borderColor: RULE }}
                    >
                      <PlayCircle size={22} style={{ color: NAVY }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY, lineHeight: 1.35 }}>{v.title}</p>
                      <p style={{ fontSize: '11px', color: MUTED }}>{v.titleEn}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border"
                          style={{ fontSize: '11px', color: NAVY, borderColor: RULE }}
                        >
                          ▶ {v.duration}
                        </span>
                        <span className="inline-flex items-center gap-1" style={{ fontSize: '11px', color: MUTED }}>
                          <Eye size={11} /> {v.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* USER MANUALS */}
          <div className={card} style={{ borderColor: RULE }}>
            <SectionHeader title="उपयोगकर्ता पुस्तिकाएं | User Manuals" sub="Downloadable PDF guides" accent={NAVY} />
            <div>
              {guides.map((g, i) => {
                const Icon = g.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-3 border-b last:border-0 hover:bg-[#F5F7FA] transition-colors cursor-pointer"
                    style={{ borderColor: RULE }}
                  >
                    {/* Neutral icon */}
                    <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: SHEET, border: `1px solid ${RULE}` }}>
                      <Icon size={16} style={{ color: NAVY }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 600, color: NAVY }}>{g.title}</p>
                      <p style={{ fontSize: '11px', color: MUTED }}>{g.titleEn} &nbsp;·&nbsp; {g.pages}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* PDF badge – outlined, no fill */}
                      <span
                        className="px-2 py-0.5 rounded border"
                        style={{ fontSize: '10px', fontWeight: 700, color: INK, borderColor: RULE, letterSpacing: '0.05em' }}
                      >
                        PDF
                      </span>
                      {/* Single navy download button */}
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-opacity hover:opacity-80"
                        style={{ background: NAVY, color: 'white', fontSize: '12px', fontWeight: 600 }}
                      >
                        <Download size={12} />
                        डाउनलोड
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="space-y-4">

          {/* SUPPORT TICKET */}
          <div className={card} style={{ borderColor: RULE }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: RULE, background: NAVY }}>
              <Headphones size={16} style={{ color: '#FFD700' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>सहायता टिकट</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Submit Support Ticket</p>
              </div>
            </div>

            {ticketSent ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: SHEET }}>
                  <CheckCircle size={24} style={{ color: '#2D7A2D' }} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: NAVY }}>टिकट जमा हो गया!</p>
                <p style={{ fontSize: '12px', color: MUTED, marginTop: '4px' }}>
                  संख्या: <span style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, color: NAVY }}>{ticketId}</span>
                </p>
                <p style={{ fontSize: '12px', color: MUTED, marginTop: '2px' }}>4 घंटे में उत्तर मिलेगा।</p>
                <button
                  onClick={() => { setTicketSent(false); setTicketName(''); setTicketSubject(''); setTicketMessage(''); }}
                  className="mt-4 px-4 py-1.5 rounded transition-opacity hover:opacity-80"
                  style={{ background: NAVY, color: 'white', fontSize: '12px' }}
                >
                  नया टिकट बनाएं
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {[
                  { label: 'नाम', placeholder: 'आपका पूरा नाम', type: 'input', key: 'name' },
                ].map(() => (
                  <div key="name">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: INK, display: 'block', marginBottom: '4px' }}>
                      नाम <span style={{ color: '#B91C1C' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={ticketName}
                      onChange={e => setTicketName(e.target.value)}
                      placeholder="आपका पूरा नाम"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: INK, display: 'block', marginBottom: '4px' }}>
                    विषय <span style={{ color: '#B91C1C' }}>*</span>
                  </label>
                  <select
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">— विषय चुनें —</option>
                    <option value="login">लॉगिन समस्या</option>
                    <option value="upload">दस्तावेज़ अपलोड</option>
                    <option value="application">आवेदन समस्या</option>
                    <option value="ai">AI निष्कर्षण</option>
                    <option value="other">अन्य समस्या</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: INK, display: 'block', marginBottom: '4px' }}>
                    समस्या विवरण <span style={{ color: '#B91C1C' }}>*</span>
                  </label>
                  <textarea
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    placeholder="समस्या का विवरण लिखें..."
                    rows={4}
                    className={inputCls + ' resize-none'}
                    style={inputStyle}
                  />
                </div>

                <button
                  onClick={() => { if (ticketName && ticketSubject && ticketMessage) setTicketSent(true); }}
                  disabled={!ticketName || !ticketSubject || !ticketMessage}
                  className="w-full py-2.5 rounded flex items-center justify-center gap-2 transition-opacity"
                  style={{
                    background: ticketName && ticketSubject && ticketMessage ? NAVY : RULE,
                    color: ticketName && ticketSubject && ticketMessage ? 'white' : MUTED,
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  <Send size={13} />
                  टिकट जमा करें &nbsp;|&nbsp; Submit
                </button>
              </div>
            )}
          </div>

          {/* SYSTEM STATUS */}
          <div className={card} style={{ borderColor: RULE }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: RULE }}>
              <div className="w-1 h-5 rounded-sm" style={{ background: ACCENT }} />
              <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY }}>सिस्टम स्थिति | System Status</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {[
                { name: 'ई-जिला पोर्टल',   nameEn: 'e-District Portal',    ok: true  },
                { name: 'AI निष्कर्षण',     nameEn: 'AI Extraction Engine', ok: true  },
                { name: 'दस्तावेज़ सर्वर',  nameEn: 'Document Server',      ok: true  },
                { name: 'SMS गेटवे',        nameEn: 'SMS Gateway',          ok: true  },
                { name: 'DigiLocker API',   nameEn: 'DigiLocker API',        ok: false },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: NAVY }}>{s.name}</p>
                    <p style={{ fontSize: '11px', color: MUTED }}>{s.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.ok ? '#2D7A2D' : '#B45309' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: s.ok ? '#2D7A2D' : '#B45309' }}>
                      {s.ok ? 'चालू' : 'धीमा'}
                    </span>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '10px', color: MUTED, paddingTop: '6px', borderTop: `1px solid ${RULE}` }}>
                अंतिम अपडेट: आज 14:32 IST
              </p>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className={card} style={{ borderColor: RULE }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: RULE }}>
              <div className="w-1 h-5 rounded-sm" style={{ background: NAVY }} />
              <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY }}>त्वरित लिंक | Quick Links</p>
            </div>
            <div className="px-3 py-2 space-y-0.5">
              {[
                { label: 'CSC ऑपरेटर प्रशिक्षण',  url: 'https://digitalseva.csc.gov.in', ext: true },
                { label: 'ई-जिला पोर्टल CG',        url: 'https://edistrict.cgstate.gov.in', ext: true },
                { label: 'DigiLocker',               url: 'https://digilocker.gov.in', ext: true },
                { label: 'UIDAI (आधार)',             url: 'https://uidai.gov.in', ext: true },
                { label: 'NIC हेल्पडेस्क',          url: 'https://nicsi.gov.in', ext: true },
                { label: 'सेवाएं देखें',             url: '/services', ext: false },
              ].map((lnk, i) => (
                lnk.ext ? (
                  <a
                    key={i}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#F5F7FA] transition-colors group"
                  >
                    <span style={{ fontSize: '12px', color: INK }} className="group-hover:text-[#1C2B4A]">{lnk.label}</span>
                    <ExternalLink size={11} style={{ color: MUTED }} />
                  </a>
                ) : (
                  <Link
                    key={i}
                    to={lnk.url}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#F5F7FA] transition-colors group"
                  >
                    <span style={{ fontSize: '12px', color: INK }}>{lnk.label}</span>
                    <ChevronRight size={11} style={{ color: MUTED }} />
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* HELPDESK RATING */}
          <div className={card} style={{ borderColor: RULE }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: RULE }}>
              <div className="w-1 h-5 rounded-sm" style={{ background: NAVY }} />
              <p style={{ fontSize: '13px', fontWeight: 700, color: NAVY }}>हेल्पडेस्क रेटिंग</p>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-4 mb-3">
                <p style={{ fontSize: '38px', fontWeight: 700, color: NAVY, fontFamily: "'Baloo 2', sans-serif", lineHeight: 1 }}>4.8</p>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: '16px', color: s <= 5 ? '#B45309' : RULE }}>
                        {s <= 4 ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: MUTED }}>2,340 समीक्षाएं</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[{ s: 5, p: 78 }, { s: 4, p: 14 }, { s: 3, p: 5 }, { s: 2, p: 2 }, { s: 1, p: 1 }].map(r => (
                  <div key={r.s} className="flex items-center gap-2">
                    <span style={{ fontSize: '11px', color: MUTED, width: '10px', textAlign: 'right' }}>{r.s}</span>
                    <span style={{ fontSize: '11px', color: MUTED }}>★</span>
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: '5px', background: RULE }}>
                      <div style={{ width: `${r.p}%`, height: '5px', background: NAVY, borderRadius: '99px' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: MUTED, width: '28px' }}>{r.p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
