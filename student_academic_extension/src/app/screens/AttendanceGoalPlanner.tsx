import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Target, TrendingUp, ShieldCheck } from 'lucide-react'

export default function AttendanceGoalPlanner() {
  const [target, setTarget] = useState(75)
  const [attended, setAttended] = useState(142)
  const [total, setTotal] = useState(162)
  const [remainingClasses, setRemainingClasses] = useState(20)

  const currentPercentage = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 0
  const safeLeave = Math.max(0, Math.floor((total * (100 - target)) / 100) - (total - attended))

  const calculateRequired = () => {
    if (target <= currentPercentage) {
      setRemainingClasses(0)
      return
    }
    const needed = Math.ceil((target * (total + remainingClasses) - 100 * attended) / (100 - target))
    setRemainingClasses(Math.max(0, needed))
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance Goal Planner</h1>
        <p className="text-muted-foreground text-sm">Plan your attendance to reach your target percentage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            <CardTitle className="text-base">Current Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentPercentage}%</div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={attended}
                onChange={(e) => setAttended(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-border rounded-md text-sm text-center"
                min="0"
              />
              <span className="text-xs text-muted-foreground">/</span>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-border rounded-md text-sm text-center"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Target size={20} className="text-green-500" />
            <CardTitle className="text-base">Target Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-border rounded-md text-sm text-center"
                min="0"
                max="100"
              />
              <span className="text-lg font-medium">%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck size={20} className="text-orange-500" />
            <CardTitle className="text-base">Safe Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeLeave}</div>
            <p className="text-xs text-muted-foreground">Classes you can skip</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required Classes to Reach Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Remaining classes this semester</label>
              <input
                type="number"
                value={remainingClasses}
                onChange={(e) => setRemainingClasses(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                min="0"
              />
            </div>
            <button
              onClick={calculateRequired}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm whitespace-nowrap"
            >
              Calculate
            </button>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              {target <= currentPercentage ? (
                <span className="text-green-600 font-medium">You have already reached your target!</span>
              ) : (
                <>
                  You need to attend <span className="font-bold">{remainingClasses}</span> more classes to reach{' '}
                  <span className="font-bold">{target}%</span> attendance.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { subject: 'Data Structures', attended: 28, total: 30, target: 75 },
              { subject: 'DBMS', attended: 25, total: 28, target: 75 },
              { subject: 'Operating Systems', attended: 20, total: 22, target: 75 },
              { subject: 'Computer Networks', attended: 18, total: 20, target: 75 },
              { subject: 'Software Engineering', attended: 22, total: 24, target: 75 },
            ].map((subj, idx) => {
              const pct = ((subj.attended / subj.total) * 100).toFixed(1)
              const isBelowTarget = Number(pct) < subj.target
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{subj.subject}</p>
                    <p className="text-xs text-muted-foreground">{subj.attended}/{subj.total} classes</p>
                  </div>
                  <span className={`text-sm font-medium ${isBelowTarget ? 'text-red-500' : 'text-green-600'}`}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
