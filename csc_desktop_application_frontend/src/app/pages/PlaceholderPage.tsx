import React from 'react';
import { Link, useLocation } from 'react-router';
import { Construction, ArrowLeft } from 'lucide-react';

const pageTitles: Record<string, { hi: string; en: string }> = {
  '/app/analytics': { hi: 'विश्लेषण', en: 'Analytics' },
  '/app/citizens': { hi: 'नागरिक रिकॉर्ड', en: 'Citizen Records' },
  '/app/settings': { hi: 'सेटिंग्स', en: 'Settings' },
  '/app/help': { hi: 'सहायता', en: 'Help & Support' },
};

export function PlaceholderPage() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || { hi: 'पृष्ठ', en: 'Page' };

  return (
    <div
      className="flex-1 flex items-center justify-center p-8"
      style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#FFF0E0' }}
        >
          <Construction size={36} style={{ color: '#E8701A' }} />
        </div>
        <h2
          className="text-[#1C2B4A] mb-2"
          style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '24px', fontWeight: 700 }}
        >
          {title.hi}
        </h2>
        <p className="text-[#7A8BA3] mb-1" style={{ fontSize: '16px' }}>{title.en}</p>
        <p className="text-[#7A8BA3] mb-6" style={{ fontSize: '14px' }}>
          यह पृष्ठ शीघ्र उपलब्ध होगा। This page is coming soon.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
          style={{ background: '#003380', fontSize: '14px', fontWeight: 600 }}
        >
          <ArrowLeft size={16} />
          डैशबोर्ड पर जाएं | Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
