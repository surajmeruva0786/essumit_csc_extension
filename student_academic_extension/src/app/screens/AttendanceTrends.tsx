import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calculator,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AttendanceData,
  calculateClassesNeeded,
  getAttendanceData,
} from '../api/attendanceApi'

const SUBJECT_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
]

const BAR_TARGET_LINE = 75

const ChartTooltip = ({
  active,
  payload,
  label,
  suffix = '%',
}: {
  active?: boolean
  payload?: Array<{ value: number; name?: string; payload?: Record<string, unknown> }>
  label?: string
  suffix?: string
}) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      {label && <p className="font-medium text-card-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {entry.name ? `${entry.name}: ` : ''}
          {entry.value}
          {suffix}
        </p>
      ))}
    </div>
  )
}

const downloadCsv = (data: AttendanceData) => {
  const header = 'Subject,Classes Attended,Total Classes,Attendance %\n'
  const rows = data.subjects
    .map(
      (s) =>
        `${s.subject},${s.attended},${s.total},${s.percentage.toFixed(1)}`,
    )
    .join('\n')
  const summary = `\nOverall Attendance %,${data.summary.overallPercentage}\nTotal Attended,${data.summary.totalAttended}\nTotal Classes,${data.summary.totalClasses}\nTarget %,${data.summary.targetPercentage}`
  const csv = header + rows + summary
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'attendance_report.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function AttendanceTrends() {
  const data = useMemo(() => getAttendanceData(), [])
  const { summary, subjects, weeklyTrend } = data

  const [currentPercentage, setCurrentPercentage] = useState(
    summary.overallPercentage,
  )
  const [totalClasses, setTotalClasses] = useState(summary.totalClasses)
  const [targetPercentage, setTargetPercentage] = useState(
    summary.targetPercentage,
  )

  const calculation = useMemo(
    () =>
      calculateClassesNeeded(currentPercentage, totalClasses, targetPercentage),
    [currentPercentage, totalClasses, targetPercentage],
  )

  const overallStatus =
    summary.overallPercentage >= summary.targetPercentage
      ? 'safe'
      : 'danger'

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Trends</h1>
          <p className="text-muted-foreground text-sm">
            Subject-wise attendance graph, weekly trends, and monthly summary
          </p>
        </div>
        <button
          onClick={() => downloadCsv(data)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            <CardTitle className="text-base">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                overallStatus === 'safe'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {summary.overallPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {summary.targetPercentage}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            <CardTitle className="text-base">Classes Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.totalAttended}
              <span className="text-muted-foreground text-xl">
                /{summary.totalClasses}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarDays size={20} className="text-orange-500" />
            <CardTitle className="text-base">Classes to Reach 75%</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                calculation.alreadyMet
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {calculation.alreadyMet ? '✓' : calculation.classesNeeded}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculation.alreadyMet
                ? 'Target already met'
                : 'more classes needed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjects}
                margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={<ChartTooltip suffix="%" />}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar
                  dataKey="percentage"
                  name="Attendance"
                  radius={[6, 6, 0, 0]}
                >
                  {subjects.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.percentage >= BAR_TARGET_LINE
                          ? SUBJECT_COLORS[index % SUBJECT_COLORS.length]
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Bars in red are below the 75% required target.
          </p>
        </CardContent>
      </Card>

      {/* Weekly trend line chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Trend (Last 8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyTrend}
                margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<ChartTooltip suffix="%" />} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Attendance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Target calculator */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Calculator size={20} className="text-purple-500" />
          <CardTitle>Attendance Target Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Current Attendance %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={currentPercentage}
                onChange={(e) =>
                  setCurrentPercentage(Number(e.target.value) || 0)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Total Classes Held</label>
              <input
                type="number"
                min={1}
                value={totalClasses}
                onChange={(e) => setTotalClasses(Number(e.target.value) || 0)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Target %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={targetPercentage}
                onChange={(e) =>
                  setTargetPercentage(Number(e.target.value) || 0)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <div
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
                  calculation.alreadyMet
                    ? 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {calculation.alreadyMet ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                {calculation.alreadyMet
                  ? 'Target met'
                  : `${calculation.classesNeeded} more`}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {calculation.note}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
