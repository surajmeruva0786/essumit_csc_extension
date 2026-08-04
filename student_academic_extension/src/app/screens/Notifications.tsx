import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { CheckCircle2, Circle, Bell, Filter } from 'lucide-react'
import {
  useNotifications,
  CATEGORY_LABELS,
  CATEGORY_BADGE_CLASSES,
  type NotificationCategory,
} from '../context/NotificationContext'

type FilterValue = NotificationCategory | 'all'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'notice', label: CATEGORY_LABELS.notice },
  { value: 'assignment', label: CATEGORY_LABELS.assignment },
  { value: 'attendance', label: CATEGORY_LABELS.attendance },
  { value: 'result', label: CATEGORY_LABELS.result },
  { value: 'exam', label: CATEGORY_LABELS.exam },
]

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<FilterValue>('all')

  const visible = filter === 'all' ? notifications : notifications.filter((n) => n.category === filter)

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={22} />
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">Academic updates and alerts</p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
              filter === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-accent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No notifications in this category.
            </CardContent>
          </Card>
        ) : (
          visible.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`${n.read ? 'opacity-75' : 'border-l-4 border-l-primary cursor-pointer'}`}
            >
              <CardContent className="flex items-start gap-3 py-4">
                <div className={`mt-0.5 ${n.read ? 'text-muted-foreground' : 'text-primary'}`}>
                  {n.read ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    CATEGORY_BADGE_CLASSES[n.category]
                  }`}
                >
                  {CATEGORY_LABELS[n.category]}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
