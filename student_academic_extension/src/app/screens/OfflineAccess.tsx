import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { WifiOff, RefreshCw, Clock, CalendarCheck, Bell, BookOpen } from 'lucide-react'

interface CachedData {
  attendance: { total: number; present: number; percentage: number } | null
  timetable: { subject: string; time: string; room: string }[] | null
  notices: { title: string; date: string }[] | null
  lastSync: string | null
}

const defaultCache: CachedData = {
  attendance: { total: 162, present: 142, percentage: 87.5 },
  timetable: [
    { subject: 'Data Structures', time: '09:00', room: 'Room 301' },
    { subject: 'DBMS Lab', time: '10:00', room: 'Lab 2' },
    { subject: 'Operating Systems', time: '11:30', room: 'Room 205' },
  ],
  notices: [
    { title: 'Mid-term schedule released', date: '2026-07-20' },
    { title: 'Assignment deadline extended', date: '2026-07-18' },
    { title: 'Holiday on Aug 15', date: '2026-08-10' },
  ],
  lastSync: new Date().toISOString(),
}

export default function OfflineAccess() {
  const [cache, setCache] = useState<CachedData>(defaultCache)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    setCache({
      ...defaultCache,
      lastSync: new Date().toISOString(),
    })
  }

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return 'Never'
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offline Access</h1>
          <p className="text-muted-foreground text-sm">Recently viewed academic data available offline</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <WifiOff size={14} />
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={14} />
        Last synced: {formatSyncTime(cache.lastSync)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarCheck size={20} className="text-blue-500" />
            <CardTitle className="text-base">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {cache.attendance ? (
              <>
                <div className="text-3xl font-bold">{cache.attendance.percentage}%</div>
                <p className="text-xs text-muted-foreground">{cache.attendance.present}/{cache.attendance.total} classes</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No cached attendance</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen size={20} className="text-green-500" />
            <CardTitle className="text-base">Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            {cache.timetable && cache.timetable.length > 0 ? (
              <div className="space-y-2">
                {cache.timetable.slice(0, 3).map((cls, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">{cls.subject}</span>
                    <span className="text-muted-foreground">{cls.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No cached timetable</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell size={20} className="text-red-500" />
            <CardTitle className="text-base">Notices</CardTitle>
          </CardHeader>
          <CardContent>
            {cache.notices && cache.notices.length > 0 ? (
              <div className="space-y-2">
                {cache.notices.slice(0, 3).map((notice, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium truncate">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">{notice.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No cached notices</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
