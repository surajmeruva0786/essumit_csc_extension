import { Link, useLocation } from 'react-router'
import { Home, CalendarCheck, Bell, BookOpen, BarChart3, Clock, GitCompare, Settings, Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '../app/context/ThemeContext'
import { useEffect, useRef, useState } from 'react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/assignments', label: 'Assignments', icon: BookOpen },
  { path: '/dashboard', label: 'My Dashboard', icon: Settings },
  { path: '/cgpa', label: 'CGPA', icon: BarChart3 },
  { path: '/timetable', label: 'Timetable', icon: Clock },
  { path: '/comparison', label: 'Comparison', icon: GitCompare },
  { path: '/session-recovery', label: 'Recovery', icon: RefreshCw },
]

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export default function Header() {
  const location = useLocation()
  const { theme, setTheme, effectiveTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const ThemeIcon = effectiveTheme === 'dark' ? Moon : Sun

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
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              <ThemeIcon size={18} />
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                  Theme
                </div>
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  const previewTheme = option.value === 'system' ? effectiveTheme : option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-border flex items-center justify-center"
                        style={{
                          backgroundColor: previewTheme === 'dark' ? '#0a0a0a' : '#ffffff',
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            className={previewTheme === 'dark' ? 'text-white' : 'text-black'}
                          />
                        )}
                      </div>
                      <Icon size={16} />
                      <span className="flex-1 text-left">{option.label}</span>
                      {isSelected && (
                        <span className="text-xs text-muted-foreground">
                          {previewTheme === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
