import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// App layout
import AppLayout from '@/components/layout/AppLayout'

// App pages
import DashboardPage from '@/pages/DashboardPage'
import EntreprisePage from '@/pages/EntreprisePage'
import PlanComptablePage from '@/pages/PlanComptablePage'
import JournalPage from '@/pages/JournalPage'
import GrandLivrePage from '@/pages/GrandLivrePage'
import BalancePage from '@/pages/BalancePage'
import CompteResultatPage from '@/pages/CompteResultatPage'
import BilanPage from '@/pages/BilanPage'
import AnalysePage from '@/pages/AnalysePage'
import ParametresPage from '@/pages/ParametresPage'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Public route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const authStatus = useStore((s) => s.authStatus)
  const authError = useStore((s) => s.authError)
  const initializeAuth = useStore((s) => s.initializeAuth)

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Vérification de votre session…
      </div>
    )
  }

  if (authStatus === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-destructive">{authError ?? 'Impossible de vérifier votre session.'}</p>
        <button className="text-primary underline" onClick={() => void initializeAuth()}>
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected app routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="entreprise" element={<EntreprisePage />} />
          <Route path="plan-comptable" element={<PlanComptablePage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="grand-livre" element={<GrandLivrePage />} />
          <Route path="balance" element={<BalancePage />} />
          <Route path="compte-de-resultat" element={<CompteResultatPage />} />
          <Route path="bilan" element={<BilanPage />} />
          <Route path="analyse" element={<AnalysePage />} />
          <Route path="parametres" element={<ParametresPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
