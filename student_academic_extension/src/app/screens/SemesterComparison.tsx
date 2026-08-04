import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { GitCompare, Download } from 'lucide-react'

export default function SemesterComparison() {
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [showSubjectTable, setShowSubjectTable] = useState(false)

  const toggleSemester = (id: number) => {
    setSelectedSemesters((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const selectedData = useMemo(
    () => MOCK_DATA.filter((s) => selectedSemesters.includes(s.id)),
    [selectedSemesters]
  )

  const chartData = useMemo(
    () =>
      selectedData.map((sem) => ({
        name: sem.name,
        GPA: sem.gpa,
        Attendance: sem.attendance,
      })),
    [selectedData]
  )

  const trendData = useMemo(
    () =>
      selectedData
        .sort((a, b) => a.id - b.id)
        .map((sem) => ({
          name: sem.name,
          GPA: sem.gpa,
          Attendance: sem.attendance,
        })),
    [selectedData]
  )

  const handleExport = () => {
    const rows = ['Semester,GPA,Attendance,Subject,Marks,Grade']
    selectedData.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        rows.push(`${sem.name},${sem.gpa},${sem.attendance},"${sub.name}",${sub.marks},${sub.grade}`)
      })
    })
    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'semester-comparison.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Semester Performance Comparison</h1>
          <p className="text-muted-foreground text-sm">Compare GPA, attendance, and subject-wise marks across semesters</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Semesters to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MOCK_DATA.map((sem) => {
              const isSelected = selectedSemesters.includes(sem.id)
              return (
                <button
                  key={sem.id}
                  onClick={() => toggleSemester(sem.id)}
                  className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-muted'
                  }`}
                >
                  {sem.name}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>GPA Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="GPA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Attendance" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="GPA" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="Attendance" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <button
              onClick={() => setShowSubjectTable(!showSubjectTable)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              {showSubjectTable ? 'Hide' : 'Show'} Subject-wise Table
              <ChevronDown
                size={16}
                className={`transition-transform ${showSubjectTable ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {showSubjectTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 font-medium">Subject</th>
                    {selectedData
                      .sort((a, b) => a.id - b.id)
                      .map((sem) => (
                        <th key={sem.id} className="p-3 font-medium">
                          {sem.name}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_SUBJECTS.map((subject) => (
                    <tr key={subject} className="border-b border-border">
                      <td className="p-3 font-medium">{subject}</td>
                      {selectedData
                        .sort((a, b) => a.id - b.id)
                        .map((sem) => {
                          const record = sem.subjects.find((s) => s.name === subject)
                          return (
                            <td key={sem.id} className="p-3">
                              {record ? (
                                <div>
                                  <div className="font-semibold">{record.marks}%</div>
                                  <div className="text-xs text-muted-foreground">{record.grade}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          )
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
