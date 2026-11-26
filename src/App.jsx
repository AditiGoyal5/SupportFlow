import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext.jsx'
import AppLayout from './components/AppLayout.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import CreateTicketPage from './pages/CreateTicketPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TicketDetailsPage from './pages/TicketDetailsPage.jsx'
import TicketWorkspacePage from './pages/TicketWorkspacePage.jsx'
import UserManagementPage from './pages/UserManagementPage.jsx'

function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen label="Checking your session" />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnly() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen label="Checking your session" />
  return user ? <Navigate to="/app" replace /> : <Outlet />
}

function RequireRole({ role }) {
  const { user } = useAuth()
  return user?.role === role ? <Outlet /> : <Navigate to="/app" replace />
}

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen label="Loading SupportFlow" />
  return <Navigate to={user ? '/app' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            color: '#172033',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route element={<RequireRole role="user" />}>
              <Route path="tickets/new" element={<CreateTicketPage />} />
            </Route>
            <Route path="tickets/:id" element={<TicketDetailsPage />} />
            <Route path="tickets" element={<TicketWorkspacePage />} />
            <Route element={<RequireRole role="admin" />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagementPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
