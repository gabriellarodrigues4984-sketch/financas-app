import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AppShell } from './components/layout/AppShell'
import { ConnectGoogleScreen } from './components/auth/ConnectGoogleScreen'
import { ConfigMissingScreen } from './components/auth/ConfigMissingScreen'
import { ThemePickerScreen } from './components/auth/ThemePickerScreen'
import { isSupabaseConfigured, isLocalPreview } from './lib/supabase'
import { Dashboard } from './pages/Dashboard'
import { Monthly } from './pages/Monthly'
import { Cards } from './pages/Cards'
import { CardDetail } from './pages/CardDetail'
import { Goals } from './pages/Goals'

function Gate() {
  const { user, loading } = useAuth()
  const { hasChosenTheme, loading: themeLoading } = useTheme()

  if (!isLocalPreview && !isSupabaseConfigured) {
    return <ConfigMissingScreen />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <ConnectGoogleScreen />

  if (!themeLoading && !hasChosenTheme) return <ThemePickerScreen />

  return (
    <DataProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mensal" element={<Monthly />} />
          <Route path="/cartoes" element={<Cards />} />
          <Route path="/cartoes/:cardId" element={<CardDetail />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </DataProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Gate />
      </ThemeProvider>
    </AuthProvider>
  )
}
