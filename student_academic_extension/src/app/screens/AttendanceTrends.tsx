import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart3, TrendingUp, Download } from 'lucide-react'

export default function AttendanceTrends() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Trends</h1>
          <p className="text-muted-foreground text-sm">Subject-wise attendance graph, weekly trends, and monthly summary</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Download size={16} />
          Export Report
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            <CardTitle className="text-base">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">Target: 75%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            <CardTitle className="text-base">Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+2.3%</div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            <CardTitle className="text-base">Classes Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142/162</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart component will be rendered here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
