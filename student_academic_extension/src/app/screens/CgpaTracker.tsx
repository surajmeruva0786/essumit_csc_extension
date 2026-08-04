import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart3, Target, Download, TrendingUp, GraduationCap } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  BarChart,
  Legend,
} from 'recharts'

type Semester = {
  sem: string
  gpa: number
  credits: number
}

const semesters: Semester[] = [
  { sem: 'Sem 1', gpa: 8.5, credits: 24 },
  { sem: 'Sem 2', gpa: 8.8, credits: 24 },
  { sem: 'Sem 3', gpa: 9.0, credits: 26 },
  { sem: 'Sem 4', gpa: 8.9, credits: 26 },
  { sem: 'Sem 5', gpa: 9.2, credits: 24 },
  { sem: 'Sem 6', gpa: 9.1, credits: 22 },
]

export default function CgpaTracker() {
  const totalCredits = useMemo(
    () => semesters.reduce((acc, s) => acc + s.credits, 0),
    []
  )

  const currentCgpa = useMemo(() => {
    const weighted = semesters.reduce((acc, s) => acc + s.gpa * s.credits, 0)
    return weighted / totalCredits
  }, [totalCredits])

  const cgpaPoints = useMemo(() => {
    let earned = 0
    let creditsSoFar = 0
    return semesters.map((s) => {
      earned += s.gpa * s.credits
      creditsSoFar += s.credits
      return {
        sem: s.sem,
        gpa: s.gpa,
        cgpa: Number((earned / creditsSoFar).toFixed(2)),
      }
    })
  }, [])

  const [targetCgpa, setTargetCgpa] = useState('9.5')
  const [remainingSems, setRemainingSems] = useState('2')
  const avgCreditsPerSem = useMemo(
    () => Math.round(totalCredits / semesters.length),
    [totalCredits]
  )

  const requiredGpa = useMemo(() => {
    const target = parseFloat(targetCgpa)
    const remaining = parseInt(remainingSems, 10)
    if (!target || !remaining || remaining <= 0) return null
    const totalCreditsAtTarget = (semesters.length + remaining) * avgCreditsPerSem
    const requiredPoints = target * totalCreditsAtTarget - currentCgpa * totalCredits
    const remainingCredits = remaining * avgCreditsPerSem
    const gpa = requiredPoints / remainingCredits
    return Number(gpa.toFixed(2))
  }, [targetCgpa, remainingSems, avgCreditsPerSem, currentCgpa, totalCredits])

  const handleExport = () => {
    const header = 'Semester,GPA,Credits,WeightedPoints\n'
    const rows = semesters
      .map((s) => `${s.sem},${s.gpa},${s.credits},${(s.gpa * s.credits).toFixed(2)}`)
      .join('\n')
    const footer = `\nCurrent CGPA,${currentCgpa.toFixed(2)},,\nTotal Credits,,${totalCredits},`
    const csv = header + rows + footer
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cgpa-report.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CGPA Progress Tracker</h1>
          <p className="text-muted-foreground text-sm">Semester-wise GPA, CGPA trend, and target calculator</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <GraduationCap size={20} className="text-blue-500" />
            <CardTitle className="text-base">Current CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentCgpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Weighted over {totalCredits} credits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Target size={20} className="text-green-500" />
            <CardTitle className="text-base">Target CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{targetCgpa || '0.0'}</div>
            <p className="text-xs text-muted-foreground">Set your goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            <CardTitle className="text-base">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Credits earned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CGPA Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaPoints} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
                <YAxis domain={[7, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cgpa"
                  name="CGPA"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance (GPA per Semester)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cgpaPoints} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
                <YAxis domain={[7, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="gpa" name="GPA" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp size={20} className="text-purple-500" />
          <CardTitle>Target GPA Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Target CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Remaining Semesters</label>
              <input
                type="number"
                step="1"
                min="1"
                value={remainingSems}
                onChange={(e) => setRemainingSems(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Required GPA / semester</p>
              <div className="text-2xl font-bold">
                {requiredGpa !== null ? requiredGpa.toFixed(2) : '—'}
                {requiredGpa !== null && requiredGpa > 10 && (
                  <span className="ml-2 text-xs font-normal text-red-500">Above 10.0 — not possible</span>
                )}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Assumes ~{avgCreditsPerSem} credits per remaining semester. Current CGPA is{' '}
            {currentCgpa.toFixed(2)} over {totalCredits} credits.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Semester-wise GPA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Semester</th>
                  <th className="py-2 pr-4 font-medium">GPA</th>
                  <th className="py-2 pr-4 font-medium">Credits</th>
                  <th className="py-2 pr-4 font-medium">Weighted Points</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((s) => (
                  <tr key={s.sem} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium">{s.sem}</td>
                    <td className="py-2 pr-4">{s.gpa.toFixed(1)}</td>
                    <td className="py-2 pr-4">{s.credits}</td>
                    <td className="py-2 pr-4">{(s.gpa * s.credits).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 pr-4">{totalCredits}</td>
                  <td className="py-2 pr-4">
                    {semesters.reduce((acc, s) => acc + s.gpa * s.credits, 0).toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-md bg-muted p-3 text-sm">
            <span className="font-medium">Credit Summary:</span> You have earned{' '}
            <span className="font-bold">{totalCredits}</span> credits across{' '}
            {semesters.length} semesters, yielding a current CGPA of{' '}
            <span className="font-bold">{currentCgpa.toFixed(2)}</span> / 10.0.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
