import { ArrowUpRight, ListTodo } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function TicketWorkspacePage() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          {isAdmin ? 'Team operations' : 'Your requests'}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
          {isAdmin ? 'Ticket queue' : 'My tickets'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {isAdmin
            ? 'This area is ready for the admin ticket list, filters, and status controls.'
            : 'This area is ready for your ticket list, request details, and updates.'}
        </p>
      </div>
      <div className="grid min-h-[360px] place-items-center rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm shadow-slate-200/40">
        <div className="max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ListTodo size={25} strokeWidth={1.8} />
          </span>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">Ticket tools are up next</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            You’re signed in and authorized. Ticket browsing and management will be connected to the existing API in the next frontend phase.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
            Connected account <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </div>
  )
}
