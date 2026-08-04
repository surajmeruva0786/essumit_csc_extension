import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { GitCompare, Download } from 'lucide-react'

const semesters = [
  { name: 'Semester 1', gpa: 8.5, attendance: 92, subjects: 6 },
  { name: 'Semester 2', gpa: 8.8, attendance: 94, subjects: 6 },
  { name: 'Semester 3', gpa: 9.0, attendance: 88, subjects: 7 },
  { name: 'Semester 4', gpa: 8.9, attendance: 85, subjects: 7 },
  { name: 'Semester 5', gpa: 9.2, attendance: 90, subjects: 6 },
]

export default function SemesterComparison() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Semester Performance Comparison</h1>
          <p className="text-muted-foreground text-sm">Compare GPA, attendance, and subjects across semesters</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Download size={16} />
          Export Report
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>GPA Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <GitCompare size={48} className="mr-4" />
              GPA chart will be rendered here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <GitCompare size={48} className="mr-4" />
              Attendance chart will be rendered here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <GitCompare size={48} className="mr-4" />
              Subject chart will be rendered here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
