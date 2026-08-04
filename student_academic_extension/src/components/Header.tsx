import { Link, useLocation } from 'react-router'
import { Home, CalendarCheck, Bell, BookOpen, BarChart3, Clock, GitCompare, Settings } from 'lucide-react'
import { useNotifications } from '../app/context/NotificationContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/assignments', label: 'Assignments', icon: BookOpen },
  { path: '/dashboard', label: 'My Dashboard', icon: Settings },
  { path: '/cgpa', label: 'CGPA', icon: BarChart3 },
  { path: '/timetable', label: 'Timetable', icon: Clock },
  { path: '/comparison', label: 'Comparison', icon: GitCompare },
]

export default function Header() {
  const location = useLocation()
  const { unreadCount } = useNotifications()
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="font-bold text-lg">Academic Portal</div>
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                <span className="relative flex items-center">
                  <Icon size={16} />
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] leading-none rounded-full bg-red-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
