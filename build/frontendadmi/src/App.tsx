import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'

// Lazy loading de páginas
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'))
const BuildsPage = React.lazy(() => import('./pages/builds/BuildsPage'))
const ProgressPage = React.lazy(() => import('./pages/progress/ProgressPage'))
const QueuePage = React.lazy(() => import('./pages/queue/QueuePage'))
const NotificationsPage = React.lazy(() => import('./pages/notifications/NotificationsPage'))
const SystemPage = React.lazy(() => import('./pages/system/SystemPage'))
const UsersPage = React.lazy(() => import('./pages/users/UsersPage'))
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-secondary-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />

        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="builds" element={<BuildsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="system" element={<SystemPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App 