import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Settings, CalendarCheck, BookOpen, Bell, Clock, BarChart3 } from 'lucide-react'

const allWidgets = [
  { id: 'attendance', title: 'Attendance Widget', icon: CalendarCheck, active: true },
  { id: 'assignments', title: 'Assignment Widget', icon: BookOpen, active: true },
  { id: 'notices', title: 'Notice Widget', icon: Bell, active: true },
  { id: 'timetable', title: 'Timetable Widget', icon: Clock, active: true },
  { id: 'cgpa', title: 'CGPA Widget', icon: BarChart3, active: false },
]

export default function PersonalizedDashboard() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground text-sm">Drag-and-drop widgets to customize your experience</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Settings size={16} />
          Customize
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allWidgets.filter(w => w.active).map((w) => {
          const Icon = w.icon
          return (
            <Card key={w.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3">
                <Icon size={24} className="text-primary" />
                <CardTitle className="text-base">{w.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Widget content area</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
