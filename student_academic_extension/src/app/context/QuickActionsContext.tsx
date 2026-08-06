import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface QuickAction {
  id: string
  label: string
  icon: string
  url: string
  shortcut: string
}

interface QuickActionsContextType {
  actions: QuickAction[]
  addAction: (action: Omit<QuickAction, 'id'>) => void
  removeAction: (id: string) => void
  reorderActions: (fromIndex: number, toIndex: number) => void
}

const QuickActionsContext = createContext<QuickActionsContextType | undefined>(undefined)

const STORAGE_KEY = 'quick-actions'

const DEFAULT_ACTIONS: QuickAction[] = [
  { id: '1', label: 'Open Attendance', icon: 'CalendarCheck', url: '/attendance', shortcut: 'Alt+1' },
  { id: '2', label: 'Open Results', icon: 'BarChart3', url: '/comparison', shortcut: 'Alt+2' },
  { id: '3', label: 'Open Timetable', icon: 'Clock', url: '/timetable', shortcut: 'Alt+3' },
  { id: '4', label: 'Open Notices', icon: 'Bell', url: '/notifications', shortcut: 'Alt+4' },
]

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<QuickAction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return DEFAULT_ACTIONS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
  }, [actions])

  const addAction = (action: Omit<QuickAction, 'id'>) => {
    setActions(prev => [...prev, { ...action, id: crypto.randomUUID() }])
  }

  const removeAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id))
  }

  const reorderActions = (fromIndex: number, toIndex: number) => {
    setActions(prev => {
      const result = [...prev]
      const [removed] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, removed)
      return result
    })
  }

  return (
    <QuickActionsContext.Provider value={{ actions, addAction, removeAction, reorderActions }}>
      {children}
    </QuickActionsContext.Provider>
  )
}

export function useQuickActions() {
  const context = useContext(QuickActionsContext)
  if (!context) throw new Error('useQuickActions must be used within QuickActionsProvider')
  return context
}
