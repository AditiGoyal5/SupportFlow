import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  ShieldCheck,
  Ticket,
} from 'lucide-react'
import ErrorState from '../components/ErrorState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TicketQueryBar from '../components/TicketQueryBar.jsx'
import TicketResults from '../components/TicketResults.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Card } from '../components/ui/card.jsx'
import { Skeleton } from '../components/ui/skeleton.jsx'
import useTicketQuery from '../hooks/useTicketQuery.js'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import { cn } from '../lib/utils.js'

function MetricCard({ label, value, icon: Icon, iconTone, active, onClick }) {
  return (
    <Card
      className={cn(
        'border-border p-4 transition-colors sm:p-5',
        active ? 'border-primary/50 ring-1 ring-primary/30' : 'hover:border-indigo-200',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full cursor-pointer text-left"
        aria-label={`${label}: ${value ?? 0}. Filter ticket queue.`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className={cn('grid h-8 w-8 place-items-center rounded-lg', iconTone)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value ?? '—'}</p>
      </button>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

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

  const query = useTicketQuery({ admin: true, onMutated: loadStats })

  useEffect(() => {
    loadStats()
  }, [loadStats, query.reload])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Admin Ticket Queue"
        description="Monitor support workload, triage incoming issues, and update status or priority inline."
        action={
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Admin workspace
            </Badge>
          </div>
        }
      />

      <section aria-label="Ticket statistics">
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
              active={!query.status}
              onClick={() => query.setFilter('status', '')}
            />
            <MetricCard
              label="Open"
              value={stats?.openTickets ?? stats?.open}
              icon={Clock3}
              iconTone="bg-blue-50 text-blue-600"
              active={query.status === 'open'}
              onClick={() => query.setFilter('status', 'open')}
            />
            <MetricCard
              label="In progress"
              value={stats?.inProgressTickets ?? stats?.in_progress}
              icon={CircleDot}
              iconTone="bg-amber-50 text-amber-600"
              active={query.status === 'in_progress'}
              onClick={() => query.setFilter('status', 'in_progress')}
            />
            <MetricCard
              label="Resolved"
              value={stats?.resolvedTickets ?? stats?.resolved}
              icon={CheckCircle2}
              iconTone="bg-emerald-50 text-emerald-600"
              active={query.status === 'resolved'}
              onClick={() => query.setFilter('status', 'resolved')}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <TicketQueryBar query={query} />

        <TicketResults
          query={query}
          admin
          emptyTitle="No tickets in the queue"
          emptyDescription="Tickets will appear here when customers submit requests."
        />
      </section>
    </div>
  )
}
