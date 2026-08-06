import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Pin, GripVertical, Trash2, Plus } from 'lucide-react'

interface PinnedItem {
  id: string
  label: string
  path: string
  icon: string
}

const defaultPinned: PinnedItem[] = [
  { id: '1', label: 'Dashboard', path: '/', icon: 'Home' },
  { id: '2', label: 'Attendance', path: '/attendance', icon: 'CalendarCheck' },
  { id: '3', label: 'Notifications', path: '/notifications', icon: 'Bell' },
  { id: '4', label: 'Assignments', path: '/assignments', icon: 'BookOpen' },
]

const availableSections = [
  { id: '5', label: 'CGPA Tracker', path: '/cgpa', icon: 'BarChart3' },
  { id: '6', label: 'Timetable', path: '/timetable', icon: 'Clock' },
  { id: '7', label: 'Comparison', path: '/comparison', icon: 'GitCompare' },
  { id: '8', label: 'Downloads', path: '/downloads', icon: 'Download' },
]

export default function PriorityPinning() {
  const [pinned, setPinned] = useState<PinnedItem[]>(defaultPinned)

  const togglePin = (item: PinnedItem) => {
    if (pinned.find((p) => p.id === item.id)) {
      setPinned((prev) => prev.filter((p) => p.id !== item.id))
    } else {
      setPinned((prev) => [...prev, item])
    }
  }

  const removePin = (id: string) => {
    setPinned((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Priority Pinning</h1>
        <p className="text-muted-foreground text-sm">Pin your frequently accessed sections for quick access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pinned Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pinned.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pinned sections yet</p>
            ) : (
              pinned.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:shadow-sm transition-shadow"
                >
                  <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                  <Pin size={16} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.path}</p>
                  </div>
                  <button
                    onClick={() => removePin(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableSections.map((section) => {
              const isPinned = pinned.find((p) => p.id === section.id)
              return (
                <div
                  key={section.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isPinned ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className="text-xs text-muted-foreground">{section.path}</p>
                  </div>
                  <button
                    onClick={() => togglePin(section)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
                      isPinned
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {isPinned ? (
                      <>
                        <Trash2 size={14} />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Pin
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
