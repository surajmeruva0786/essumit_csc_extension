import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  Settings,
  CalendarCheck,
  BookOpen,
  Bell,
  Clock,
  BarChart3,
  Sun,
  Moon,
  GripVertical,
} from 'lucide-react'

const ItemTypes = { WIDGET: 'widget' }

const defaultWidgets = [
  { id: 'attendance', title: 'Attendance Widget', icon: CalendarCheck, active: true },
  { id: 'assignments', title: 'Assignment Widget', icon: BookOpen, active: true },
  { id: 'notices', title: 'Notice Widget', icon: Bell, active: true },
  { id: 'timetable', title: 'Timetable Widget', icon: Clock, active: true },
  { id: 'cgpa', title: 'CGPA Widget', icon: BarChart3, active: false },
]

const attendanceData = [
  { subject: 'Data Structures', attended: 22, total: 24 },
  { subject: 'DBMS', attended: 18, total: 22 },
  { subject: 'Operating Systems', attended: 20, total: 21 },
  { subject: 'Computer Networks', attended: 19, total: 20 },
  { subject: 'Software Engineering', attended: 24, total: 25 },
]

const assignmentData = [
  { title: 'Data Structures Lab', subject: 'DS', due: '2026-07-20', status: 'pending' },
  { title: 'DBMS Assignment 3', subject: 'DBMS', due: '2026-07-22', status: 'pending' },
  { title: 'OS Mini Project', subject: 'OS', due: '2026-07-25', status: 'pending' },
  { title: 'CN Report', subject: 'CN', due: '2026-07-18', status: 'overdue' },
]

const noticeData = [
  { title: 'Mid-term schedule released', time: '2 hours ago', read: false, type: 'notice' },
  { title: 'Assignment due: Data Structures Lab', time: '5 hours ago', read: false, type: 'assignment' },
  { title: 'Attendance alert: DBMS below 75%', time: '1 day ago', read: true, type: 'attendance' },
  { title: 'Result announced: Semester 5', time: '2 days ago', read: true, type: 'result' },
]

const timetableData = [
  { time: '09:00', subject: 'Data Structures', room: 'Room 301', faculty: 'Dr. Smith', type: 'lecture' },
  { time: '10:00', subject: 'DBMS Lab', room: 'Lab 2', faculty: 'Prof. Johnson', type: 'lab' },
  { time: '11:30', subject: 'Operating Systems', room: 'Room 205', faculty: 'Dr. Lee', type: 'lecture' },
  { time: '13:00', subject: 'Computer Networks', room: 'Room 102', faculty: 'Prof. Davis', type: 'lecture' },
  { time: '14:30', subject: 'Software Engineering', room: 'Room 304', faculty: 'Dr. Wilson', type: 'tutorial' },
]

const cgpaData = [
  { sem: 'Sem 1', gpa: 8.5, credits: 24 },
  { sem: 'Sem 2', gpa: 8.8, credits: 24 },
  { sem: 'Sem 3', gpa: 9.0, credits: 26 },
  { sem: 'Sem 4', gpa: 8.9, credits: 26 },
  { sem: 'Sem 5', gpa: 9.2, credits: 24 },
]

function AttendanceWidget() {
  const overall = (
    attendanceData.reduce((acc, s) => acc + (s.attended / s.total), 0) / attendanceData.length * 100
  ).toFixed(1)
  const totalAttended = attendanceData.reduce((acc, s) => acc + s.attended, 0)
  const totalClasses = attendanceData.reduce((acc, s) => acc + s.total, 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{overall}%</p>
          <p className="text-xs text-muted-foreground">Overall Attendance</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">
            {totalAttended}/{totalClasses}
          </p>
          <p className="text-xs text-muted-foreground">Classes Attended</p>
        </div>
      </div>
      <div className="space-y-2">
        {attendanceData.slice(0, 3).map((s) => {
          const pct = ((s.attended / s.total) * 100).toFixed(0)
          return (
            <div key={s.subject} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.subject}</span>
              <span className="font-medium">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AssignmentWidget() {
  return (
    <div className="space-y-3">
      {assignmentData.slice(0, 3).map((a) => (
        <div
          key={a.title}
          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              a.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{a.title}</p>
            <p className="text-xs text-muted-foreground">
              {a.subject} · Due {a.due}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function NoticeWidget() {
  return (
    <div className="space-y-3">
      {noticeData.slice(0, 3).map((n) => (
        <div
          key={n.title}
          className={`flex items-start gap-3 p-2 rounded-lg ${
            n.read ? 'opacity-75' : 'border-l-4 border-l-primary bg-muted/30'
          }`}
        >
          <Bell
            size={16}
            className={`mt-0.5 ${n.read ? 'text-muted-foreground' : 'text-primary'}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{n.title}</p>
            <p className="text-xs text-muted-foreground">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TimetableWidget() {
  return (
    <div className="space-y-3">
      {timetableData.slice(0, 3).map((cls) => (
        <div key={cls.time} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
          <div className="text-xs font-mono text-muted-foreground w-12 shrink-0">
            {cls.time}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{cls.subject}</p>
            <p className="text-xs text-muted-foreground truncate">
              {cls.room} · {cls.faculty}
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize shrink-0">
            {cls.type}
          </span>
        </div>
      ))}
    </div>
  )
}

function CgpaWidget() {
  const cgpa = (
    cgpaData.reduce((acc, s) => acc + s.gpa, 0) / cgpaData.length
  ).toFixed(2)
  const totalCredits = cgpaData.reduce((acc, s) => acc + s.credits, 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{cgpa}</p>
          <p className="text-xs text-muted-foreground">Current CGPA</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{totalCredits}</p>
          <p className="text-xs text-muted-foreground">Total Credits</p>
        </div>
      </div>
      <div className="space-y-2">
        {cgpaData.slice(0, 3).map((s) => (
          <div key={s.sem} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{s.sem}</span>
            <span className="font-medium">{s.gpa}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface WidgetItem {
  id: string
  title: string
  icon: React.ElementType
  active: boolean
}

function DraggableWidget({
  widget,
  index,
  moveWidget,
}: {
  widget: WidgetItem
  index: number
  moveWidget: (from: number, to: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WIDGET,
    item: { id: widget.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: ItemTypes.WIDGET,
    hover: (item: { id: string; index: number }) => {
      if (item.index === index) return
      moveWidget(item.index, index)
      item.index = index
    },
  })

  drag(drop(ref))

  const Icon = widget.icon

  const renderContent = () => {
    switch (widget.id) {
      case 'attendance':
        return <AttendanceWidget />
      case 'assignments':
        return <AssignmentWidget />
      case 'notices':
        return <NoticeWidget />
      case 'timetable':
        return <TimetableWidget />
      case 'cgpa':
        return <CgpaWidget />
      default:
        return null
    }
  }

  return (
    <Card
      ref={ref}
      className={`hover:shadow-md transition-shadow cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-3">
        <GripVertical size={16} className="text-muted-foreground" />
        <Icon size={24} className="text-primary" />
        <CardTitle className="text-base">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}

export default function PersonalizedDashboard() {
  const [widgets, setWidgets] = useState<WidgetItem[]>(() => {
    try {
      const saved = localStorage.getItem('dashboard-widgets')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return defaultWidgets
  })

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('dashboard-theme')
      if (saved === 'dark' || saved === 'light') return saved
    } catch {
      // ignore
    }
    return 'light'
  })

  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets))
  }, [widgets])

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const moveWidget = (from: number, to: number) => {
    setWidgets((prev) => {
      const next = [...prev]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return next
    })
  }

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    )
  }

  const activeWidgets = widgets.filter((w) => w.active)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Drag-and-drop widgets to customize your experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTheme((t) => (t === 'light' ? 'dark' : 'light'))
              }
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              <Settings size={16} />
              Customize
            </button>
          </div>
        </div>

        {showSidebar && (
          <Card>
            <CardHeader>
              <CardTitle>Widget Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <w.icon size={18} className="text-primary" />
                    <span className="text-sm font-medium">{w.title}</span>
                  </div>
                  <button
                    onClick={() => toggleWidget(w.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      w.active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {w.active ? 'Hide' : 'Show'}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWidgets.map((widget, index) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              index={index}
              moveWidget={moveWidget}
            />
          ))}
        </div>

        {activeWidgets.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No widgets enabled</p>
              <p className="text-sm">
                Enable widgets from the Customize panel above to personalize your
                dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DndProvider>
  )
}
