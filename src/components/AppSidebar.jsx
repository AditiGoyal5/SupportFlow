import { LayoutDashboard, Plus, ShieldCheck, Ticket } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'

export default function AppSidebar({ user, open, onClose }) {
  const navigation = [
    { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
    {
      label: 'My Tickets',
      to: '/app/tickets',
      icon: Ticket,
      end: true,
    },
    { label: 'Create Ticket', to: '/app/tickets/new', icon: Plus },
    ...(user.role === 'admin'
      ? [{ label: 'Admin Tickets', to: '/app/admin', icon: ShieldCheck }]
      : []),
  ]

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2 pb-8 pt-1">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
          Workspace
        </p>
        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <p className="text-xs font-semibold text-indigo-900">Support, made simple</p>
          <p className="mt-1.5 text-xs leading-5 text-indigo-800/75">
            Keep your requests and team updates together in one workspace.
          </p>
        </div>
      </aside>
    </>
  )
}
