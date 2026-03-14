import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FilePlus,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Cpu,
  FileCheck,
  Users,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

const menuItems = [
  {
    group: 'मुख्य | Main',
    items: [
      { icon: LayoutDashboard, label: 'डैशबोर्ड', labelEn: 'Dashboard', path: '/app' },
      { icon: FilePlus, label: 'नया आवेदन', labelEn: 'New Application', path: '/app/new' },
      { icon: Clock, label: 'आवेदन इतिहास', labelEn: 'History', path: '/app/history' },
    ],
  },
  {
    group: 'AI सेवाएं | AI Tools',
    items: [
      { icon: Cpu, label: 'AI निष्कर्षण', labelEn: 'AI Extraction', path: '/app/extraction' },
      { icon: FileCheck, label: 'डेटा समीक्षा', labelEn: 'Data Review', path: '/app/review' },
      { icon: AlertTriangle, label: 'जोखिम सत्यापन', labelEn: 'Risk Validation', path: '/app/validation' },
    ],
  },
  {
    group: 'रिपोर्ट | Reports',
    items: [
      { icon: BarChart3, label: 'विश्लेषण', labelEn: 'Analytics', path: '/app/analytics' },
      { icon: Users, label: 'नागरिक रिकॉर्ड', labelEn: 'Citizen Records', path: '/app/citizens' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col border-r transition-all duration-300"
      style={{
        width: collapsed ? '72px' : '280px',
        background: '#1C2B4A',
        borderColor: '#2D3F5E',
        minHeight: 'calc(100vh - 72px)',
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      }}
    >
      {/* Operator Info */}
      {!collapsed && (
        <div
          className="p-4 border-b"
          style={{ background: '#142038', borderColor: '#2D3F5E' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: '#2D3F5E', fontSize: '15px', border: '1px solid #3D5070' }}
            >
              रा
            </div>
            <div>
              <p className="text-white font-semibold" style={{ fontSize: '14px' }}>राजेश कुमार साहू</p>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>Rajnandgaon CSC • OP-4521</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400" style={{ fontSize: '12px' }}>सक्रिय | Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((group) => (
          <div key={group.group} className="mb-4">
            {!collapsed && (
              <p
                className="text-gray-500 px-2 mb-1 uppercase"
                style={{ fontSize: '11px', letterSpacing: '0.08em' }}
              >
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (!location.pathname.includes('/app/') && item.path === '/app' && location.pathname === '/app');
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all group"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #E8701A, #C45E10)'
                          : 'transparent',
                        color: isActive ? 'white' : '#A8B8D0',
                      }}
                      title={collapsed ? `${item.label} | ${item.labelEn}` : ''}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400 }} className="truncate">
                              {item.label}
                            </p>
                            <p className="opacity-60 truncate" style={{ fontSize: '12px' }}>{item.labelEn}</p>
                          </div>
                          {isActive && <ChevronRight size={15} className="opacity-60" />}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t" style={{ borderColor: '#2D3F5E' }}>
        {!collapsed && (
          <Link
            to="/app/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all mb-1"
          >
            <Settings size={20} />
            <div>
              <p style={{ fontSize: '14px' }}>सेटिंग्स</p>
              <p className="opacity-60" style={{ fontSize: '12px' }}>Settings</p>
            </div>
          </Link>
        )}
        {!collapsed && (
          <Link
            to="/app/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all mb-1"
          >
            <HelpCircle size={20} />
            <div>
              <p style={{ fontSize: '14px' }}>सहायता</p>
              <p className="opacity-60" style={{ fontSize: '12px' }}>Help & Support</p>
            </div>
          </Link>
        )}
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut size={20} />
          {!collapsed && (
            <div>
              <p style={{ fontSize: '14px' }}>लॉगआउट</p>
              <p className="opacity-60" style={{ fontSize: '12px' }}>Logout</p>
            </div>
          )}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center w-5 h-10 rounded-r"
        style={{ background: '#2D3F5E', color: '#A8B8D0', alignSelf: 'center', flexShrink: 0, marginRight: '-5px' }}
      >
        <ChevronRight size={13} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }} />
      </button>
    </aside>
  );
}