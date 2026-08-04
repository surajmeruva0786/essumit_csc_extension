import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Clock, MapPin, User, Bell, BellOff, Calendar } from 'lucide-react'

type ClassType = 'lecture' | 'lab' | 'tutorial'

interface ClassSlot {
  id: string
  startTime: string
  endTime: string
  subject: string
  room: string
  faculty: string
  type: ClassType
  day?: string
}

interface DaySchedule {
  day: string
  shortDay: string
  classes: ClassSlot[]
}

const WEEKLY_TIMETABLE: DaySchedule[] = [
  {
    day: 'Monday',
    shortDay: 'Mon',
    classes: [
      { id: 'm1', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', room: 'Room 301', faculty: 'Dr. Smith', type: 'lecture' },
      { id: 'm2', startTime: '10:00', endTime: '12:00', subject: 'DBMS Lab', room: 'Lab 2', faculty: 'Prof. Johnson', type: 'lab' },
      { id: 'm3', startTime: '14:00', endTime: '15:00', subject: 'Operating Systems', room: 'Room 205', faculty: 'Dr. Lee', type: 'lecture' },
      { id: 'm4', startTime: '16:00', endTime: '17:00', subject: 'Soft Skills', room: 'Room 104', faculty: 'Ms. Garcia', type: 'tutorial' },
    ]
  },
  {
    day: 'Tuesday',
    shortDay: 'Tue',
    classes: [
      { id: 't1', startTime: '09:00', endTime: '10:30', subject: 'Computer Networks', room: 'Room 102', faculty: 'Prof. Davis', type: 'lecture' },
      { id: 't2', startTime: '11:00', endTime: '12:00', subject: 'Software Engineering', room: 'Room 304', faculty: 'Dr. Wilson', type: 'lecture' },
      { id: 't3', startTime: '14:00', endTime: '15:00', subject: 'Mathematics', room: 'Room 201', faculty: 'Dr. Brown', type: 'lecture' },
    ]
  },
  {
    day: 'Wednesday',
    shortDay: 'Wed',
    classes: [
      { id: 'w1', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', room: 'Room 301', faculty: 'Dr. Smith', type: 'lecture' },
      { id: 'w2', startTime: '10:00', endTime: '12:00', subject: 'DBMS Lab', room: 'Lab 2', faculty: 'Prof. Johnson', type: 'lab' },
    ]
  },
  {
    day: 'Thursday',
    shortDay: 'Thu',
    classes: [
      { id: 'th1', startTime: '09:00', endTime: '10:30', subject: 'Operating Systems', room: 'Room 205', faculty: 'Dr. Lee', type: 'lecture' },
      { id: 'th2', startTime: '11:00', endTime: '12:00', subject: 'Computer Networks', room: 'Room 102', faculty: 'Prof. Davis', type: 'lecture' },
      { id: 'th3', startTime: '14:00', endTime: '15:00', subject: 'Software Engineering', room: 'Room 304', faculty: 'Dr. Wilson', type: 'tutorial' },
    ]
  },
  {
    day: 'Friday',
    shortDay: 'Fri',
    classes: [
      { id: 'f1', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', room: 'Room 301', faculty: 'Dr. Smith', type: 'lecture' },
      { id: 'f2', startTime: '10:30', endTime: '11:30', subject: 'Mathematics', room: 'Room 201', faculty: 'Dr. Brown', type: 'lecture' },
      { id: 'f3', startTime: '13:00', endTime: '14:00', subject: 'Computer Networks', room: 'Room 102', faculty: 'Prof. Davis', type: 'lecture' },
      { id: 'f4', startTime: '14:30', endTime: '16:00', subject: 'Software Engineering', room: 'Room 304', faculty: 'Dr. Wilson', type: 'tutorial' },
      { id: 'f5', startTime: '17:00', endTime: '18:00', subject: 'Project Work', room: 'Lab 5', faculty: 'Dr. Smith', type: 'lab' },
    ]
  },
  {
    day: 'Saturday',
    shortDay: 'Sat',
    classes: [
      { id: 's1', startTime: '09:00', endTime: '12:00', subject: 'Lab Workshop', room: 'Lab 1', faculty: 'Prof. Johnson', type: 'lab' },
    ]
  },
  {
    day: 'Sunday',
    shortDay: 'Sun',
    classes: []
  }
]

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export default function Timetable() {
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today')
  const [remindersEnabled, setRemindersEnabled] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
  const todaySchedule = WEEKLY_TIMETABLE.find(d => d.day === today)?.classes || []
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

  const activeClass = useMemo(() => {
    return todaySchedule.find(cls => {
      const start = timeToMinutes(cls.startTime)
      const end = timeToMinutes(cls.endTime)
      return currentMinutes >= start && currentMinutes < end
    })
  }, [todaySchedule, currentMinutes])

  const nextClass = useMemo(() => {
    return todaySchedule.find(cls => timeToMinutes(cls.startTime) > currentMinutes)
  }, [todaySchedule, currentMinutes])

  const nextClassWeek = useMemo(() => {
    if (nextClass) return { ...nextClass, day: today }
    const todayIndex = DAYS_ORDER.indexOf(today)
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7
      const daySchedule = WEEKLY_TIMETABLE.find(d => d.day === DAYS_ORDER[nextDayIndex])
      if (daySchedule && daySchedule.classes.length > 0) {
        return { ...daySchedule.classes[0], day: DAYS_ORDER[nextDayIndex] }
      }
    }
    return null
  }, [nextClass, today])

  const targetClass = nextClass || nextClassWeek

  useEffect(() => {
    const chromeAny = (window as any).chrome
    if (!chromeAny?.alarms) return

    const clearReminder = async () => {
      try {
        await chromeAny.alarms.clear('nextClassReminder')
      } catch {
        // ignore
      }
    }

    if (remindersEnabled && targetClass) {
      const classStart = timeToMinutes(targetClass.startTime)
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      let delayMinutes = classStart - nowMinutes - 10

      if (delayMinutes < 1) delayMinutes = 1
      if (delayMinutes > 1440) delayMinutes = 60

      clearReminder().then(() => {
        chromeAny.alarms.create('nextClassReminder', { delayInMinutes: delayMinutes })
      })
    } else {
      clearReminder()
    }
  }, [remindersEnabled, targetClass])

  const getTypeColor = (type: ClassType) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'lab':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'tutorial':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const currentTimeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Class Timetable</h1>
          <p className="text-muted-foreground text-sm">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            <span className="mx-2">•</span>
            <span className="font-mono">{currentTimeStr}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('today')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'today'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {remindersEnabled ? (
              <Bell size={18} className="text-primary" />
            ) : (
              <BellOff size={18} className="text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Class Reminders</p>
              <p className="text-xs text-muted-foreground">
                Get notified 10 minutes before your next class
              </p>
            </div>
          </div>
          <button
            onClick={() => setRemindersEnabled(!remindersEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              remindersEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                remindersEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </CardContent>
      </Card>

      {viewMode === 'today' && (
        <div className="space-y-3">
          {activeClass && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Currently active: <span className="font-medium text-foreground">{activeClass.subject}</span>
            </div>
          )}

          {todaySchedule.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            todaySchedule.map((cls) => {
              const isNext = targetClass && cls.id === targetClass.id && !activeClass
              const isActive = activeClass && cls.id === activeClass.id

              return (
                <Card
                  key={cls.id}
                  className={`transition-all ${
                    isNext
                      ? 'border-primary border-2 bg-primary/5 shadow-md'
                      : isActive
                        ? 'border-green-500 border-2 bg-green-50 dark:bg-green-950/20'
                        : 'hover:shadow-md'
                  }`}
                >
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="text-sm font-mono text-muted-foreground">
                        {formatTime(cls.startTime)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        to {formatTime(cls.endTime)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{cls.subject}</p>
                        {isNext && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium uppercase tracking-wide shrink-0">
                            Next
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium uppercase tracking-wide shrink-0">
                            Now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {cls.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {cls.faculty}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(cls.type)} capitalize shrink-0`}>
                      {cls.type}
                    </span>
                  </CardContent>
                </Card>
              )
            })
          )}

          {!nextClass && targetClass && !activeClass && (
            <Card className="border-dashed">
              <CardContent className="py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                Next class: <span className="font-medium text-foreground">{targetClass.day}</span> at {formatTime(targetClass.startTime)} — {targetClass.subject}
              </CardContent>
            </Card>
          )}

          {!nextClass && !activeClass && todaySchedule.length > 0 && !targetClass && (
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No more classes today</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WEEKLY_TIMETABLE.map((day) => {
            const isToday = day.day === today
            return (
              <Card key={day.day} className={isToday ? 'border-primary border-2' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{day.day}</CardTitle>
                    {isToday && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium uppercase tracking-wide">
                        Today
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.classes.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No classes</p>
                  ) : (
                    day.classes.map((cls) => {
                      const isNext = targetClass && cls.id === targetClass.id && isToday
                      const isActive = isToday && activeClass && cls.id === activeClass.id

                      return (
                        <div
                          key={cls.id}
                          className={`p-3 rounded-lg border ${
                            isActive
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                              : isNext
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{cls.subject}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin size={12} />
                                {cls.room}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <User size={12} />
                                {cls.faculty}
                              </p>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeColor(cls.type)} capitalize shrink-0`}>
                              {cls.type}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
