import { Card, CardHeader, CardTitle } from '../components/ui/card'
import { Link } from 'react-router'
import { CalendarCheck, Bell, BookOpen, Settings, BarChart3, Clock, GitCompare, TrendingUp } from 'lucide-react'

const widgets = [
  { title: 'Attendance Trends', desc: 'Track your attendance over time', icon: CalendarCheck, to: '/attendance', color: 'text-blue-500' },
  { title: 'Notifications', desc: 'Academic updates and alerts', icon: Bell, to: '/notifications', color: 'text-red-500' },
  { title: 'Assignments', desc: 'Upcoming deadlines and calendar', icon: BookOpen, to: '/assignments', color: 'text-green-500' },
  { title: 'My Dashboard', desc: 'Personalized widgets layout', icon: Settings, to: '/dashboard', color: 'text-purple-500' },
  { title: 'CGPA Tracker', desc: 'Monitor semester performance', icon: BarChart3, to: '/cgpa', color: 'text-orange-500' },
  { title: 'Timetable', desc: 'Daily class schedule', icon: Clock, to: '/timetable', color: 'text-teal-500' },
  { title: 'Comparison', desc: 'Semester-wise analysis', icon: GitCompare, to: '/comparison', color: 'text-pink-500' },
  { title: 'Performance Insights', desc: 'Subject-wise analytics and charts', icon: TrendingUp, to: '/insights', color: 'text-cyan-500' },
]

export default function Dashboard() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Student</h1>
        <p className="text-muted-foreground text-sm">Here's your academic overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => {
          const Icon = w.icon
          return (
            <Link key={w.to} to={w.to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${w.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{w.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{w.desc}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
