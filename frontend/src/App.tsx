import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ToastContainer from './components/ToastContainer'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminUsersPage from './pages/AdminUsersPage'
import TokensPage from './pages/TokensPage'
import EventsPage from './pages/EventsPage'
import InventoryPage from './pages/InventoryPage'
import { useToast } from './hooks/useToast'
import './App.css'
import AdminRoute from './components/AdminRoute'

function App() {
  const { toasts, hideToast } = useToast();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastContainer toasts={toasts} onClose={hideToast} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tokens"
            element={
              <ProtectedRoute>
                <TokensPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <InventoryPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
