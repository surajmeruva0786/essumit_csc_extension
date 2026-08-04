import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type NotificationCategory =
  | 'notice'
  | 'assignment'
  | 'attendance'
  | 'result'
  | 'exam'

export interface NotificationItem {
  id: number
  title: string
  time: string
  read: boolean
  category: NotificationCategory
}

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  notice: 'New notice',
  assignment: 'Assignment alert',
  attendance: 'Attendance alert',
  result: 'Result announcement',
  exam: 'Exam reminder',
}

export const CATEGORY_BADGE_CLASSES: Record<NotificationCategory, string> = {
  notice: 'bg-blue-100 text-blue-700',
  assignment: 'bg-green-100 text-green-700',
  attendance: 'bg-red-100 text-red-700',
  result: 'bg-purple-100 text-purple-700',
  exam: 'bg-orange-100 text-orange-700',
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: 'New Notice: Mid-term examination schedule released', time: '2 hours ago', read: false, category: 'notice' },
  { id: 2, title: 'Assignment due: Data Structures Lab report submission', time: '5 hours ago', read: false, category: 'assignment' },
  { id: 3, title: 'Attendance alert: DBMS attendance dropped below 75%', time: '1 day ago', read: false, category: 'attendance' },
  { id: 4, title: 'Result announced: Semester 5 internal marks published', time: '1 day ago', read: false, category: 'result' },
  { id: 5, title: 'Exam reminder: Operating Systems viva scheduled tomorrow', time: '2 days ago', read: true, category: 'exam' },
  { id: 6, title: 'New Notice: College annual fest registrations open', time: '2 days ago', read: false, category: 'notice' },
  { id: 7, title: 'Assignment alert: Submit Web Tech mini-project by Friday', time: '3 days ago', read: true, category: 'assignment' },
  { id: 8, title: 'Attendance alert: You have missed 4 classes in Algorithms', time: '3 days ago', read: true, category: 'attendance' },
  { id: 9, title: 'Result announcement: CAT-1 results are now available', time: '4 days ago', read: false, category: 'result' },
  { id: 10, title: 'Exam reminder: Mathematics end-semester exam in 5 days', time: '5 days ago', read: true, category: 'exam' },
]

interface NotificationContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS)

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return ctx
}
