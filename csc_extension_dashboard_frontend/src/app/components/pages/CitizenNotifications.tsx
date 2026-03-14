import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Search, Filter, Send } from 'lucide-react';

const notifications = [
  { id: 1, type: 'success', title: 'Application Approved', message: 'Birth Certificate application APP-2026-034521 has been approved by Pune district office.', citizen: 'Rahul Mehta', appId: 'APP-2026-034521', time: '5 min ago', date: '13 Mar 2026', read: false, service: 'Birth Certificate' },
  { id: 2, type: 'warning', title: 'Rejection Risk Detected', message: 'AI Co-Pilot has flagged application APP-2026-034498 for income eligibility issue. Operator advised to review.', citizen: 'Sunita Devi', appId: 'APP-2026-034498', time: '12 min ago', date: '13 Mar 2026', read: false, service: 'Widow Pension' },
  { id: 3, type: 'error', title: 'Application Rejected', message: 'Caste Certificate application APP-2026-034476 rejected due to Aadhaar mismatch. Citizen notified via SMS.', citizen: 'Mohan Lal', appId: 'APP-2026-034476', time: '18 min ago', date: '13 Mar 2026', read: false, service: 'Caste Certificate' },
  { id: 4, type: 'info', title: 'Document Resubmission Requested', message: 'Citizen asked to resubmit income certificate for Old Age Pension application APP-2026-034445.', citizen: 'Radha Bai', appId: 'APP-2026-034445', time: '34 min ago', date: '13 Mar 2026', read: true, service: 'Old Age Pension' },
  { id: 5, type: 'success', title: 'Application Approved', message: 'Residence Certificate application APP-2026-034432 successfully verified and approved.', citizen: 'Amit Tiwari', appId: 'APP-2026-034432', time: '1 hr ago', date: '13 Mar 2026', read: true, service: 'Residence Certificate' },
  { id: 6, type: 'warning', title: 'Missing Document Alert', message: 'AI detected missing ration card for APP-2026-034411. CSC operator notified.', citizen: 'Geeta Kumari', appId: 'APP-2026-034411', time: '2 hr ago', date: '13 Mar 2026', read: true, service: 'Income Certificate' },
  { id: 7, type: 'success', title: 'Application Approved', message: 'Widow Pension application APP-2026-034390 has been approved. Benefit disbursement in 3-5 days.', citizen: 'Savitri Sharma', appId: 'APP-2026-034390', time: '3 hr ago', date: '13 Mar 2026', read: true, service: 'Widow Pension' },
  { id: 8, type: 'error', title: 'Application Rejected', message: 'Old Age Pension application rejected. Applicant age verification failed (DOB mismatch in Aadhaar).', citizen: 'Ramesh Gupta', appId: 'APP-2026-034378', time: '4 hr ago', date: '13 Mar 2026', read: true, service: 'Old Age Pension' },
  { id: 9, type: 'info', title: 'Bulk Processing Completed', message: '42 Caste Certificate applications from Varanasi district processed. 36 approved, 6 flagged for review.', citizen: 'System', appId: 'BATCH-2026-0312', time: '5 hr ago', date: '12 Mar 2026', read: true, service: 'Batch' },
  { id: 10, type: 'info', title: 'System Maintenance Notification', message: 'Scheduled maintenance window: 02:00 AM – 04:00 AM IST. Services will be temporarily unavailable.', citizen: 'System', appId: 'SYS-NOTE', time: '8 hr ago', date: '12 Mar 2026', read: true, service: 'System' },
];

const iconMap: Record<string, any> = {
  success: { Icon: CheckCircle, color: '#138808', bg: '#f0fdf4' },
  warning: { Icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
  error: { Icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
  info: { Icon: Info, color: '#2563eb', bg: '#eff6ff' },
};

export default function CitizenNotifications() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('All');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n =>
    (filter === 'All' || n.type === filter.toLowerCase()) &&
    (readFilter === 'All' || (readFilter === 'Unread' && !n.read) || (readFilter === 'Read' && n.read)) &&
    (search === '' || n.title.toLowerCase().includes(search.toLowerCase()) || n.citizen.toLowerCase().includes(search.toLowerCase()) || n.appId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Citizen Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Application status alerts and system messages</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-white shadow-sm hover:opacity-90 w-fit" style={{ backgroundColor: '#1e3a5f' }}>
          <Send size={15}/> Send Bulk Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Unread', value: unreadCount, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Approved Today', value: 2, color: '#138808', bg: '#f0fdf4' },
          { label: 'Rejected Today', value: 2, color: '#f97316', bg: '#fff7ed' },
          { label: 'Warnings Sent', value: 1243, color: '#d97706', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Success', 'Warning', 'Error', 'Info'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  filter === f
                    ? 'text-white border-transparent'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                style={filter === f ? { backgroundColor: '#1e3a5f' } : {}}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={readFilter}
            onChange={e => setReadFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none"
          >
            <option>All</option>
            <option>Unread</option>
            <option>Read</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.map((notif) => {
          const { Icon, color, bg } = iconMap[notif.type];
          return (
            <div
              key={notif.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-shadow hover:shadow-md flex gap-4 ${
                !notif.read ? 'border-l-4' : 'border border-gray-100'
              }`}
              style={!notif.read ? { borderLeftColor: color, borderTop: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' } : {}}
            >
              <div className="p-2.5 rounded-lg h-fit flex-shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={18} style={{ color }}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#2563eb' }}/>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {notif.citizen !== 'System' && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{notif.citizen}</span>
                  )}
                  <span className="text-xs font-mono text-blue-600">{notif.appId}</span>
                  <span className="text-xs text-gray-400">
                    <span className={`px-2 py-0.5 rounded-full font-medium`} style={{ backgroundColor: bg, color }}>{notif.service}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm border border-gray-100">
            <Bell size={32} className="mx-auto mb-2 opacity-30"/>
            No notifications match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
