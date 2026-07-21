import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export type AppTheme = 'classico' | 'blossom'

const LOCAL_KEY = 'grao_theme_pref'

function applyThemeToDocument(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}

interface ThemeContextValue {
  theme: AppTheme
  hasChosenTheme: boolean
  loading: boolean
  setTheme: (theme: AppTheme) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<AppTheme>('classico')
  const [hasChosenTheme, setHasChosenTheme] = useState(false)
  const [loading, setLoading] = useState(true)

  // Aplica um valor salvo localmente na hora (evita flash do tema errado
  // enquanto a confirmação do banco não chega).
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_KEY) as AppTheme | null
    if (cached === 'classico' || cached === 'blossom') {
      setThemeState(cached)
      applyThemeToDocument(cached)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }: { data: any[] | null }) => {
        if (cancelled) return
        const row = data?.[0]
        if (row?.theme === 'classico' || row?.theme === 'blossom') {
          setThemeState(row.theme)
          applyThemeToDocument(row.theme)
          localStorage.setItem(LOCAL_KEY, row.theme)
          setHasChosenTheme(true)
        } else {
          setHasChosenTheme(false)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  async function setTheme(next: AppTheme) {
    setThemeState(next)
    applyThemeToDocument(next)
    localStorage.setItem(LOCAL_KEY, next)
    setHasChosenTheme(true)
    if (!user) return
    await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, theme: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  }

  return (
    <ThemeContext.Provider value={{ theme, hasChosenTheme, loading, setTheme }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  return ctx
}
