import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Calendar, BookOpen, Filter, Download } from 'lucide-react'
import { useState } from 'react'

const assignments = [
  { id: 1, title: 'Data Structures Lab', subject: 'DS', due: '2026-07-20', status: 'pending' },
  { id: 2, title: 'DBMS Assignment 3', subject: 'DBMS', due: '2026-07-22', status: 'pending' },
  { id: 3, title: 'OS Mini Project', subject: 'OS', due: '2026-07-25', status: 'pending' },
  { id: 4, title: 'CN Report', subject: 'CN', due: '2026-07-18', status: 'overdue' },
]

export default function AssignmentCalendar() {
  const [month, setMonth] = useState(new Date())
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignment Calendar</h1>
          <p className="text-muted-foreground text-sm">Monthly calendar with assignment indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm">
            <Filter size={16} />
            Subjects
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>July 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <Calendar size={48} className="mr-4" />
              Calendar view will be rendered here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${a.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.subject} · Due {a.due}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
