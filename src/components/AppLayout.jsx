import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppHeader from './AppHeader.jsx'
import AppSidebar from './AppSidebar.jsx'

const titles = {
  '/app': 'Dashboard',
  '/app/tickets': 'My tickets',
  '/app/tickets/new': 'Create ticket',
  '/app/admin': 'Admin tickets',
  '/app/users': 'User management',
}

export default function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title =
    (location.pathname === '/app/tickets' && user.role === 'admin'
      ? 'All tickets'
      : titles[location.pathname]) ??
    (location.pathname.startsWith('/app/tickets/') ? 'Ticket details' : 'SupportFlow')

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-h-screen lg:pl-[256px]">
        <AppHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
