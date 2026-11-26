import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppHeader from './AppHeader.jsx'
import AppSidebar from './AppSidebar.jsx'

const titles = {
  '/app': 'Overview',
  '/app/tickets': 'Ticket workspace',
  '/app/admin': 'Admin dashboard',
}

export default function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = titles[location.pathname] ?? 'SupportFlow'

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AppSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-h-screen lg:pl-[264px]">
        <AppHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
