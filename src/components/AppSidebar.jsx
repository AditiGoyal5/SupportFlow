import { LayoutDashboard, Plus, Ticket, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'
import { Button } from './ui/button.jsx'
import { Separator } from './ui/separator.jsx'
import { cn } from '../lib/utils.js'

export default function AppSidebar({ user, open, onClose }) {
  const navigation = [
    { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
    {
      label: user.role === 'admin' ? 'All Tickets' : 'My Tickets',
      to: '/app/tickets',
      icon: Ticket,
      end: true,
    },
    ...(user.role !== 'admin'
      ? [{ label: 'Create Ticket', to: '/app/tickets/new', icon: Plus }]
      : []),
    ...(user.role === 'admin'
      ? [
          { label: 'User Management', to: '/app/users', icon: Users },
        ]
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
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-border bg-card px-3.5 py-4 transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2 pb-4 pt-1">
          <Brand />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="mb-4" />

        <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
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
                cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={cn(
                      isActive
                        ? 'text-indigo-600'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
