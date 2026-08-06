import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Calendar, BookOpen, AlertTriangle } from 'lucide-react'

interface Event {
  id: string
  title: string
  type: 'exam' | 'assignment' | 'holiday'
  date: string
  color: string
}

const defaultEvents: Event[] = [
  { id: '1', title: 'OS Mid-term Exam', type: 'exam', date: '2026-08-01', color: 'text-red-500' },
  { id: '2', title: 'DBMS Assignment Due', type: 'assignment', date: '2026-07-25', color: 'text-orange-500' },
  { id: '3', title: 'Independence Day Holiday', type: 'holiday', date: '2026-08-15', color: 'text-green-500' },
  { id: '4', title: 'CN Quiz', type: 'exam', date: '2026-07-28', color: 'text-red-500' },
  { id: '5', title: 'Project Submission', type: 'assignment', date: '2026-08-05', color: 'text-orange-500' },
]

function getCountdown(targetDate: string) {
  const diff = new Date(targetDate).getTime() - new Date().getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes }
}

export default function CountdownWidget() {
  const [events] = useState<Event[]>(defaultEvents)

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upcoming Events</h1>
        <p className="text-muted-foreground text-sm">Countdown to exams, assignments, and holidays</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const countdown = getCountdown(event.date)
          const Icon = event.type === 'exam' ? AlertTriangle : event.type === 'assignment' ? BookOpen : Calendar
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-2">
                <Icon size={20} className={event.color} />
                <CardTitle className="text-base">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-muted capitalize ${event.color}`}>
                    {event.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold">{countdown.days}</div>
                    <div className="text-xs text-muted-foreground">days</div>
                  </div>
                  <span className="text-muted-foreground">:</span>
                  <div className="text-center">
                    <div className="text-xl font-bold">{countdown.hours}</div>
                    <div className="text-xs text-muted-foreground">hrs</div>
                  </div>
                  <span className="text-muted-foreground">:</span>
                  <div className="text-center">
                    <div className="text-xl font-bold">{countdown.minutes}</div>
                    <div className="text-xs text-muted-foreground">min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
