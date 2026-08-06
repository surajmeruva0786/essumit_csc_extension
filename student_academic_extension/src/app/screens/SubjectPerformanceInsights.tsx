import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart3, TrendingUp, Award, AlertTriangle } from 'lucide-react'

const subjects = [
  { name: 'Data Structures', highest: 95, lowest: 45, average: 78, current: 88 },
  { name: 'DBMS', highest: 92, lowest: 50, average: 76, current: 82 },
  { name: 'Operating Systems', highest: 88, lowest: 48, average: 74, current: 79 },
  { name: 'Computer Networks', highest: 90, lowest: 42, average: 72, current: 75 },
  { name: 'Software Engineering', highest: 94, lowest: 55, average: 80, current: 86 },
]

export default function SubjectPerformanceInsights() {
  const overallAverage = Math.round(subjects.reduce((acc, s) => acc + s.average, 0) / subjects.length)
  const highestSubject = subjects.reduce((a, b) => (a.highest > b.highest ? a : b))
  const lowestSubject = subjects.reduce((a, b) => (a.lowest < b.lowest ? a : b))

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subject Performance Insights</h1>
        <p className="text-muted-foreground text-sm">Compare your performance across subjects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            <CardTitle className="text-base">Overall Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallAverage}%</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Award size={20} className="text-green-500" />
            <CardTitle className="text-base">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{highestSubject.highest}%</div>
            <p className="text-xs text-muted-foreground">{highestSubject.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            <CardTitle className="text-base">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowestSubject.lowest}%</div>
            <p className="text-xs text-muted-foreground">{lowestSubject.name}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subj, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{subj.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Highest: {subj.highest}%</span>
                    <span>Lowest: {subj.lowest}%</span>
                    <span>Avg: {subj.average}%</span>
                    <span className="font-medium text-foreground">You: {subj.current}%</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${subj.current}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <TrendingUp size={48} className="mr-4" />
            Performance chart will be rendered here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
