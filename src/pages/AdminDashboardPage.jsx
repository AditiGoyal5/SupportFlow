import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Administration</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
          Admin dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Team-level tools and ticket insights for {user.name}.
        </p>
      </div>
      <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <ShieldCheck size={23} />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">Admin access verified</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          This route is restricted to accounts with the admin role. Dashboard statistics and queue controls will be connected to the admin APIs next.
        </p>
        <Link
          to="/app/tickets"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} /> Go to ticket queue
        </Link>
      </section>
    </div>
  )
}
