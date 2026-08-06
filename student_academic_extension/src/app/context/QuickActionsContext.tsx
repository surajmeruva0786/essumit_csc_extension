import { createContext, useContext, useState, type ReactNode } from 'react'

interface QuickAction {
  id: string
  label: string
  icon: string
  action: () => void
}

interface QuickActionsContextValue {
  actions: QuickAction[]
  addAction: (action: QuickAction) => void
  removeAction: (id: string) => void
}

const QuickActionsContext = createContext<QuickActionsContextValue | undefined>(undefined)

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<QuickAction[]>([])

  const addAction = (action: QuickAction) => {
    setActions((prev) => [...prev, action])
  }

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <QuickActionsContext.Provider value={{ actions, addAction, removeAction }}>
      {children}
    </QuickActionsContext.Provider>
  )
}

export function useQuickActions(): QuickActionsContextValue {
  const context = useContext(QuickActionsContext)
  if (!context) {
    throw new Error('useQuickActions must be used within a QuickActionsProvider')
  }
  return context
}
