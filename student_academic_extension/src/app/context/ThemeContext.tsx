import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'academic-portal-theme'

function getScheduledTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const hour = new Date().getHours()
  return hour >= 19 || hour < 7 ? 'dark' : 'light'
}

function computeEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getScheduledTheme()
  }
  return theme
}

function applyThemeClass(effectiveTheme: 'light' | 'dark') {
  const root = document.documentElement
  if (effectiveTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    } catch {
      // ignore
    }
    return 'system'
  })

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    computeEffectiveTheme(theme)
  )

  const isInitialized = useRef(false)

  useEffect(() => {
    const computed = computeEffectiveTheme(theme)
    setEffectiveTheme(computed)
    applyThemeClass(computed)
    isInitialized.current = true

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return

    const interval = setInterval(() => {
      const computed = computeEffectiveTheme(theme)
      setEffectiveTheme(computed)
      applyThemeClass(computed)
    }, 60000)

    return () => clearInterval(interval)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
