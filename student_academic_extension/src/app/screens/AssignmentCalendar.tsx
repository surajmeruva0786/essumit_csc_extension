import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Download, Bell, BellOff } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'

const SUBJECTS = ['All', 'DS', 'DBMS', 'OS', 'CN', 'SE', 'AI', 'ML']

const mockAssignments = [
  { id: 1, title: 'Data Structures Assignment', subject: 'DS', due: '2026-07-05', status: 'completed' },
  { id: 2, title: 'DBMS Quiz', subject: 'DBMS', due: '2026-07-10', status: 'completed' },
  { id: 3, title: 'OS Lab Report', subject: 'OS', due: '2026-07-12', status: 'overdue' },
  { id: 4, title: 'CN Assignment', subject: 'CN', due: '2026-07-18', status: 'upcoming' },
  { id: 5, title: 'Data Structures Lab', subject: 'DS', due: '2026-07-20', status: 'upcoming' },
  { id: 6, title: 'DBMS Assignment 3', subject: 'DBMS', due: '2026-07-22', status: 'upcoming' },
  { id: 7, title: 'OS Mini Project', subject: 'OS', due: '2026-07-25', status: 'upcoming' },
  { id: 8, title: 'CN Report', subject: 'CN', due: '2026-07-30', status: 'upcoming' },
]

type Status = 'completed' | 'upcoming' | 'overdue'

function getStatus(dueDate: string, status: string): Status {
  if (status === 'completed') return 'completed'
  const today = new Date('2026-07-17')
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  if (due < today) return 'overdue'
  return 'upcoming'
}

function getStatusColor(status: Status) {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
        badge: 'bg-green-100 text-green-700',
      }
    case 'overdue':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
        badge: 'bg-red-100 text-red-700',
      }
    case 'upcoming':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
        badge: 'bg-yellow-100 text-yellow-700',
      }
  }
}

function generateICS(assignments: typeof mockAssignments) {
  const now = new Date().toISOString()
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Student Academic Portal//Assignment Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n'
  assignments.forEach((a) => {
    const due = a.due.replace(/-/g, '')
    ics += 'BEGIN:VEVENT\r\n'
    ics += `UID:assignment-${a.id}@academic-portal\r\n`
    ics += `DTSTART;VALUE=DATE:${due}\r\n`
    ics += `DTEND;VALUE=DATE:${due}\r\n`
    ics += `SUMMARY:${a.title}\r\n`
    ics += `DESCRIPTION:Subject: ${a.subject}\\nStatus: ${a.status}\r\n`
    ics += `DTSTAMP:${now.replace(/[-:]/g, '').split('.')[0]}Z\r\n`
    ics += 'END:VEVENT\r\n'
  })
  ics += 'END:VCALENDAR'
  return ics
}

export default function AssignmentCalendar() {
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 6, 1))

  const filteredAssignments = useMemo(() => {
    if (subjectFilter === 'All') return mockAssignments
    return mockAssignments.filter((a) => a.subject === subjectFilter)
  }, [subjectFilter])

  const overdueDates = useMemo(
    () => filteredAssignments.filter((a) => getStatus(a.due, a.status) === 'overdue').map((a) => new Date(a.due)),
    [filteredAssignments]
  )
  const upcomingDates = useMemo(
    () => filteredAssignments.filter((a) => getStatus(a.due, a.status) === 'upcoming').map((a) => new Date(a.due)),
    [filteredAssignments]
  )
  const completedDates = useMemo(
    () => filteredAssignments.filter((a) => getStatus(a.due, a.status) === 'completed').map((a) => new Date(a.due)),
    [filteredAssignments]
  )

  const upcomingAssignments = useMemo(() => {
    return filteredAssignments
      .filter((a) => getStatus(a.due, a.status) !== 'completed')
      .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
  }, [filteredAssignments])

  const handleExport = () => {
    const ics = generateICS(filteredAssignments)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'assignments.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getAssignmentByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return filteredAssignments.find((a) => a.due === dateStr)
  }

  const modifiers = {
    overdue: overdueDates,
    upcoming: upcomingDates,
    completed: completedDates,
  }

  const modifiersClassNames = {
    overdue: 'bg-red-100 text-red-700 rounded-full',
    upcoming: 'bg-yellow-100 text-yellow-700 rounded-full',
    completed: 'bg-green-100 text-green-700 rounded-full',
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignment Calendar</h1>
          <p className="text-muted-foreground text-sm">Monthly calendar with assignment indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm bg-background"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setRemindersEnabled(!remindersEnabled)}
            className={`flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm ${
              remindersEnabled ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            {remindersEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            {remindersEnabled ? 'Reminders On' : 'Reminders Off'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{format(selectedMonth, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <DayPicker
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-between pt-1 relative items-center',
                caption_label: 'text-base font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head: 'flex',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-sm',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative',
                day: 'h-9 w-9 p-0 font-normal rounded-full hover:bg-accent inline-flex items-center justify-center relative',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full',
                day_today: 'border border-primary',
                day_outside: 'text-muted-foreground opacity-50',
              }}
              components={{
                DayContent: ({ date }) => {
                  const assignment = getAssignmentByDate(date)
                  return (
                    <div className="flex flex-col items-center justify-center">
                      <span>{date.getDate()}</span>
                      {assignment && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full" />
                      )}
                    </div>
                  )
                },
              }}
            />
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Upcoming</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span>Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAssignments.map((a) => {
              const status = getStatus(a.due, a.status)
              const colors = getStatusColor(status)
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                >
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${colors.text}`}>{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.subject} · Due {a.due}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${colors.badge}`}>
                    {status}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
