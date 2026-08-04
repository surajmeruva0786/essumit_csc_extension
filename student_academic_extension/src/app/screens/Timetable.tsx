import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Clock, MapPin, User } from 'lucide-react'

const todaySchedule = [
  { time: '09:00', subject: 'Data Structures', room: 'Room 301', faculty: 'Dr. Smith', type: 'lecture' },
  { time: '10:00', subject: 'DBMS Lab', room: 'Lab 2', faculty: 'Prof. Johnson', type: 'lab' },
  { time: '11:30', subject: 'Operating Systems', room: 'Room 205', faculty: 'Dr. Lee', type: 'lecture' },
  { time: '13:00', subject: 'Computer Networks', room: 'Room 102', faculty: 'Prof. Davis', type: 'lecture' },
  { time: '14:30', subject: 'Software Engineering', room: 'Room 304', faculty: 'Dr. Wilson', type: 'tutorial' },
]

export default function Timetable() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today's Timetable</h1>
          <p className="text-muted-foreground text-sm">Friday, July 17, 2026</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          Weekly View
        </button>
      </div>
      <div className="space-y-3">
        {todaySchedule.map((cls, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="text-sm font-mono text-muted-foreground w-16">{cls.time}</div>
              <div className="flex-1">
                <p className="font-medium">{cls.subject}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {cls.room}</span>
                  <span className="flex items-center gap-1"><User size={12} /> {cls.faculty}</span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{cls.type}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
