import { useCollegeConfig } from '../../context/CollegeConfigContext'

export type FeatureKey = 'attendance' | 'assignments' | 'notifications' | 'timetable' | 'cgpa' | 'exportPdf'

const featureLabels: Record<FeatureKey, string> = {
  attendance: 'Attendance',
  assignments: 'Assignments',
  notifications: 'Notifications',
  timetable: 'Timetable',
  cgpa: 'CGPA',
  exportPdf: 'Export PDF',
}

export default function FeatureToggles({ collegeId }: { collegeId: string }) {
  const { updateCollege, colleges } = useCollegeConfig()
  const college = colleges.find((c) => c.id === collegeId)

  if (!college) return null

  const handleToggle = (feature: FeatureKey) => {
    updateCollege(collegeId, {
      featureFlags: {
        ...college.featureFlags,
        [feature]: !college.featureFlags[feature],
      },
    })
  }

  return (
    <div className="space-y-3">
      {(Object.keys(featureLabels) as FeatureKey[]).map((feature) => (
        <div key={feature} className="flex items-center justify-between">
          <span className="text-sm font-medium">{featureLabels[feature]}</span>
          <button
            role="switch"
            aria-checked={college.featureFlags[feature]}
            onClick={() => handleToggle(feature)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              college.featureFlags[feature] ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                college.featureFlags[feature] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}
