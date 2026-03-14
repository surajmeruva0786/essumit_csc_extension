import React from 'react';
import { AshokChakra } from './AshokChakra';

export function GovFooter() {
  return (
    <footer style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      {/* Tricolor strip */}
      <div className="flex h-1">
        <div className="flex-1" style={{ background: '#FF9933' }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: '#138808' }} />
      </div>

      {/* Main footer */}
      <div style={{ background: '#1C2B4A' }} className="pt-8 pb-4">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AshokChakra size={32} color="#FFD700" />
                <h3
                  className="text-white"
                  style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '17px', fontWeight: 700 }}
                >
                  CSC सहायक
                </h3>
              </div>
              <p className="text-gray-400" style={{ fontSize: '13px', lineHeight: '1.7' }}>
                छत्तीसगढ़ के ग्रामीण क्षेत्रों में CSC ऑपरेटरों के लिए AI-संचालित नागरिक सेवा प्रबंधन प्रणाली।
              </p>
              <p className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
                AI-powered citizen service management for CSC operators in rural Chhattisgarh.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4
                className="text-yellow-400 mb-3 pb-2 border-b border-white/10"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                त्वरित लिंक | Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { hi: 'मुख्य पृष्ठ', en: 'Home' },
                  { hi: 'नया आवेदन', en: 'New Application' },
                  { hi: 'आवेदन इतिहास', en: 'Application History' },
                  { hi: 'डैशबोर्ड', en: 'Dashboard' },
                  { hi: 'सहायता केंद्र', en: 'Help Center' },
                ].map((link) => (
                  <li key={link.en}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-orange-400 transition-colors"
                      style={{ fontSize: '13px' }}
                    >
                      ▶ {link.hi} / {link.en}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services */}
            <div>
              <h4
                className="text-yellow-400 mb-3 pb-2 border-b border-white/10"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                सेवाएं | Services
              </h4>
              <ul className="space-y-2">
                {[
                  'जन्म प्रमाण पत्र',
                  'मृत्यु प्रमाण पत्र',
                  'आय प्रमाण पत्र',
                  'जाति प्रमाण पत्र',
                  'निवास प्रमाण पत्र',
                  'विवाह पंजीकरण',
                ].map((service) => (
                  <li key={service}>
                    <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors" style={{ fontSize: '13px' }}>
                      ▶ {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4
                className="text-yellow-400 mb-3 pb-2 border-b border-white/10"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                संपर्क | Contact
              </h4>
              <div className="space-y-2 text-gray-400" style={{ fontSize: '13px' }}>
                <div>
                  <p className="text-white font-medium">CHIPS Chhattisgarh</p>
                  <p>छत्तीसगढ़ इन्फोटेक प्रमोशन सोसाइटी</p>
                </div>
                <div className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Block 2, Ground Floor, Indravati Bhavan,<br />Naya Raipur, CG - 492002</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>0771-4013851</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>chipscg@cgstate.gov.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <span>www.cgstate.gov.in</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <p className="text-gray-500" style={{ fontSize: '12px' }}>
              © 2026 CHIPS Chhattisgarh | छत्तीसगढ़ इन्फोटेक प्रमोशन सोसाइटी | सर्वाधिकार सुरक्षित
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-gray-300" style={{ fontSize: '12px' }}>गोपनीयता नीति</a>
              <a href="#" className="text-gray-500 hover:text-gray-300" style={{ fontSize: '12px' }}>उपयोग की शर्तें</a>
              <a href="#" className="text-gray-500 hover:text-gray-300" style={{ fontSize: '12px' }}>अस्वीकरण</a>
              <span className="text-gray-600" style={{ fontSize: '12px' }}>|</span>
              <span className="text-gray-500" style={{ fontSize: '12px' }}>
                अंतिम अद्यतन: 14 मार्च 2026 | Last Updated: 14 March 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}