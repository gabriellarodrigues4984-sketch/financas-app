import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { AppShell } from './components/layout/AppShell'
import { ConnectGoogleScreen } from './components/auth/ConnectGoogleScreen'
import { Dashboard } from './pages/Dashboard'
import { Monthly } from './pages/Monthly'
import { Cards } from './pages/Cards'
import { CardDetail } from './pages/CardDetail'
import { Goals } from './pages/Goals'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <ConnectGoogleScreen />

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
      <Gate />
    </AuthProvider>
  )
}
