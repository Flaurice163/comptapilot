import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

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
