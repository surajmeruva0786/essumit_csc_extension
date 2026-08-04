import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart3, Target, Download } from 'lucide-react'

const semesters = [
  { sem: 'Sem 1', gpa: 8.5, credits: 24 },
  { sem: 'Sem 2', gpa: 8.8, credits: 24 },
  { sem: 'Sem 3', gpa: 9.0, credits: 26 },
  { sem: 'Sem 4', gpa: 8.9, credits: 26 },
  { sem: 'Sem 5', gpa: 9.2, credits: 24 },
]

export default function CgpaTracker() {
  const cgpa = (semesters.reduce((acc, s) => acc + s.gpa, 0) / semesters.length).toFixed(2)
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CGPA Progress Tracker</h1>
          <p className="text-muted-foreground text-sm">Semester-wise GPA, CGPA trend, and target calculator</p>
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
            <CardTitle className="text-base">Current CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cgpa}</div>
            <p className="text-xs text-muted-foreground">Out of 10.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Target size={20} className="text-green-500" />
            <CardTitle className="text-base">Target CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9.5</div>
            <p className="text-xs text-muted-foreground">Set your goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            <CardTitle className="text-base">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>CGPA Trend</CardTitle>
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
