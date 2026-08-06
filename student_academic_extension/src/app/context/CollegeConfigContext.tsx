import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  CollegeConfig,
  defaultColleges,
  type FeatureFlags,
} from '../config/collegeConfig'

interface CollegeConfigContextValue {
  colleges: CollegeConfig[]
  activeCollegeId: string | null
  activeCollege: CollegeConfig | null
  setActiveCollegeId: (id: string) => void
  updateCollege: (id: string, updates: Partial<Omit<CollegeConfig, 'id'>>) => void
  addCollege: (config: Omit<CollegeConfig, 'id'>) => CollegeConfig
  deleteCollege: (id: string) => void
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean
}

const CollegeConfigContext = createContext<CollegeConfigContextValue | undefined>(undefined)

const STORAGE_KEY = 'college_configs'
const ACTIVE_ID_KEY = 'active_college_id'

const chromeStorage = (globalThis as any).chrome?.storage?.local

async function loadColleges(): Promise<CollegeConfig[]> {
  try {
    if (typeof chromeStorage !== 'undefined') {
      const result = await chromeStorage.get(STORAGE_KEY)
      const stored = result[STORAGE_KEY]
      if (Array.isArray(stored) && stored.length > 0) {
        return stored as CollegeConfig[]
      }
    }
  } catch {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch {
        // ignore
      }
    }
  }
  return [...defaultColleges]
}

async function saveColleges(colleges: CollegeConfig[]): Promise<void> {
  try {
    if (typeof chromeStorage !== 'undefined') {
      await chromeStorage.set({ [STORAGE_KEY]: colleges })
      return
    }
  } catch {
    // fallback
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colleges))
}

async function loadActiveId(): Promise<string | null> {
  try {
    if (typeof chromeStorage !== 'undefined') {
      const result = await chromeStorage.get(ACTIVE_ID_KEY)
      return result[ACTIVE_ID_KEY] || defaultColleges[0]?.id || null
    }
  } catch {
    // fallback
  }
  const stored = localStorage.getItem(ACTIVE_ID_KEY)
  return stored || defaultColleges[0]?.id || null
}

async function saveActiveId(id: string): Promise<void> {
  try {
    if (typeof chromeStorage !== 'undefined') {
      await chromeStorage.set({ [ACTIVE_ID_KEY]: id })
      return
    }
  } catch {
    // fallback
  }
  localStorage.setItem(ACTIVE_ID_KEY, id)
}

export function CollegeConfigProvider({ children }: { children: ReactNode }) {
  const [colleges, setColleges] = useState<CollegeConfig[]>(defaultColleges)
  const [activeCollegeId, setActiveCollegeIdState] = useState<string | null>(defaultColleges[0]?.id || null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function init() {
      const [loadedColleges, loadedActiveId] = await Promise.all([
        loadColleges(),
        loadActiveId(),
      ])
      setColleges(loadedColleges)
      setActiveCollegeIdState(loadedActiveId || loadedColleges[0]?.id || null)
      setIsReady(true)
    }
    init()
  }, [])

  const activeCollege = colleges.find((c) => c.id === activeCollegeId) || null

  const setActiveCollegeId = async (id: string) => {
    setActiveCollegeIdState(id)
    await saveActiveId(id)
  }

  const updateCollege = async (id: string, updates: Partial<Omit<CollegeConfig, 'id'>>) => {
    setColleges((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      saveColleges(next)
      return next
    })
  }

  const addCollege = (input: Omit<CollegeConfig, 'id'>): CollegeConfig => {
    const newCollege: CollegeConfig = {
      ...input,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    }
    setColleges((prev) => {
      const next = [...prev, newCollege]
      saveColleges(next)
      return next
    })
    return newCollege
  }

  const deleteCollege = async (id: string) => {
    setColleges((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveColleges(next)
      return next
    })
    if (activeCollegeId === id) {
      const remaining = colleges.filter((c) => c.id !== id)
      const newActive = remaining[0]?.id || null
      setActiveCollegeIdState(newActive)
      if (newActive) await saveActiveId(newActive)
    }
  }

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    if (!activeCollege) return false
    return activeCollege.featureFlags[feature]
  }

  if (!isReady) {
    return null
  }

  return (
    <CollegeConfigContext.Provider
      value={{
        colleges,
        activeCollegeId,
        activeCollege,
        setActiveCollegeId,
        updateCollege,
        addCollege,
        deleteCollege,
        isFeatureEnabled,
      }}
    >
      {children}
    </CollegeConfigContext.Provider>
  )
}

export function useCollegeConfig(): CollegeConfigContextValue {
  const context = useContext(CollegeConfigContext)
  if (!context) {
    throw new Error('useCollegeConfig must be used within a CollegeConfigProvider')
  }
  return context
}
