export interface SubjectAttendance {
  subject: string
  attended: number
  total: number
  percentage: number
}

export interface WeeklyTrend {
  week: string
  percentage: number
}

export interface AttendanceSummary {
  overallPercentage: number
  totalAttended: number
  totalClasses: number
  targetPercentage: number
}

export interface AttendanceData {
  summary: AttendanceSummary
  subjects: SubjectAttendance[]
  weeklyTrend: WeeklyTrend[]
}

export const getAttendanceData = (): AttendanceData => {
  const subjects: SubjectAttendance[] = [
    { subject: 'Mathematics', attended: 38, total: 42, percentage: 90.5 },
    { subject: 'Physics', attended: 31, total: 40, percentage: 77.5 },
    { subject: 'Chemistry', attended: 28, total: 38, percentage: 73.7 },
    { subject: 'Computer Science', attended: 44, total: 46, percentage: 95.7 },
    { subject: 'Electronics', attended: 25, total: 36, percentage: 69.4 },
    { subject: 'English', attended: 33, total: 34, percentage: 97.1 },
  ]

  const weeklyTrend: WeeklyTrend[] = [
    { week: 'W1', percentage: 78.2 },
    { week: 'W2', percentage: 80.1 },
    { week: 'W3', percentage: 82.4 },
    { week: 'W4', percentage: 81.0 },
    { week: 'W5', percentage: 84.6 },
    { week: 'W6', percentage: 86.2 },
    { week: 'W7', percentage: 85.3 },
    { week: 'W8', percentage: 87.5 },
  ]

  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0)
  const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0)
  const overallPercentage = Number(((totalAttended / totalClasses) * 100).toFixed(1))

  return {
    summary: {
      overallPercentage,
      totalAttended,
      totalClasses,
      targetPercentage: 75,
    },
    subjects,
    weeklyTrend,
  }
}

export const calculateClassesNeeded = (
  currentPercentage: number,
  totalClasses: number,
  targetPercentage: number,
): { classesNeeded: number; alreadyMet: boolean; note: string } => {
  if (currentPercentage >= targetPercentage) {
    return {
      classesNeeded: 0,
      alreadyMet: true,
      note: 'You have already met the target attendance.',
    }
  }

  const attended = (currentPercentage / 100) * totalClasses
  const neededAttended = (targetPercentage / 100) * totalClasses
  const classesNeeded = Math.ceil(neededAttended - attended)

  return {
    classesNeeded,
    alreadyMet: false,
    note: `Attend ${classesNeeded} more class${classesNeeded === 1 ? '' : 'es'} (without any further absences) to reach ${targetPercentage}%.`,
  }
}
