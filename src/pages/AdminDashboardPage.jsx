import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  ShieldCheck,
  Ticket,
} from 'lucide-react'
import ErrorState from '../components/ErrorState.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Card } from '../components/ui/card.jsx'
import { Skeleton } from '../components/ui/skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import { cn } from '../lib/utils.js'

function MetricCard({ label, value, icon: Icon, iconTone, to }) {
  return (
    <Card
      className="border-border p-4 transition-colors hover:border-indigo-200 sm:p-5"
    >
      <Link
        to={to}
        className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${label}: ${value ?? 0}. View tickets.`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className={cn('grid h-8 w-8 place-items-center rounded-lg', iconTone)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value ?? '—'}</p>
      </Link>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const firstName = user.name.trim().split(/\s+/)[0] || 'there'

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const { data } = await api.get('/admin/dashboard/stats')
      setStats(data.stats)
    } catch (requestError) {
      setStatsError(getApiErrorMessage(requestError, 'Could not load dashboard statistics.'))
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[26px] bg-[#172344] px-6 py-7 text-white shadow-lg shadow-slate-200/70 sm:px-9 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-32 size-80 rounded-full bg-indigo-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-130px] right-[22%] size-64 rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 hover:bg-white/10">
            <span
              aria-hidden="true"
              className="inline-block size-1.5 rounded-full bg-emerald-400"
            />
            ADMIN WORKSPACE
          </Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] sm:text-[38px]">
            Good to see you, {firstName}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
            Your team workspace is ready. Review ticket volume and keep every request moving.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-7 hidden translate-y-1/4 sm:block lg:right-16"
        >
          <div className="grid size-40 place-items-center rounded-full border border-white/10 bg-white/[0.04]">
            <div className="grid size-28 place-items-center rounded-full border border-white/10 bg-white/[0.05]">
              <div className="grid size-[68px] place-items-center rounded-[22px] bg-white/10 text-indigo-100">
                <ShieldCheck size={31} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Ticket statistics" className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
            Ticket statistics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a status to view matching tickets.
          </p>
        </div>
        {statsError ? (
          <ErrorState title="Statistics unavailable" message={statsError} onRetry={loadStats} />
        ) : statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Card key={index} className="space-y-3 p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-14" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total tickets"
              value={stats?.totalTickets ?? stats?.total}
              icon={Ticket}
              iconTone="bg-indigo-50 text-indigo-600"
              to="/app/tickets"
            />
            <MetricCard
              label="Open"
              value={stats?.openTickets ?? stats?.open}
              icon={Clock3}
              iconTone="bg-blue-50 text-blue-600"
              to="/app/tickets?status=open"
            />
            <MetricCard
              label="In progress"
              value={stats?.inProgressTickets ?? stats?.in_progress}
              icon={CircleDot}
              iconTone="bg-amber-50 text-amber-600"
              to="/app/tickets?status=in_progress"
            />
            <MetricCard
              label="Resolved"
              value={stats?.resolvedTickets ?? stats?.resolved}
              icon={CheckCircle2}
              iconTone="bg-emerald-50 text-emerald-600"
              to="/app/tickets?status=resolved"
            />
          </div>
        )}
      </section>
    </div>
  )
}
