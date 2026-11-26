import { useCallback, useEffect, useState } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TicketList from '../components/TicketList.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'

const pageSize = 10
const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]
const priorities = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const controlClassName =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100'

function MetricCard({ label, value, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex min-w-12 items-center justify-center rounded-xl px-3 py-1.5 text-xl font-bold ${tones[tone]}`}>
        {value ?? '—'}
      </p>
    </article>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [tickets, setTickets] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  })
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [ticketsError, setTicketsError] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [busyTicketId, setBusyTicketId] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

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

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true)
    setTicketsError('')
    const params = {
      page,
      limit: pageSize,
      sortBy,
      sortOrder,
    }
    if (search) params.search = search
    if (status) params.status = status
    if (priority) params.priority = priority

    try {
      const { data } = await api.get('/admin/tickets', { params })
      setTickets(data.tickets)
      setPagination(data.pagination)
    } catch (requestError) {
      setTicketsError(getApiErrorMessage(requestError, 'Could not load admin tickets.'))
    } finally {
      setTicketsLoading(false)
    }
  }, [page, sortBy, sortOrder, search, status, priority])

  useEffect(() => {
    loadStats()
  }, [loadStats, reloadKey])

  useEffect(() => {
    loadTickets()
  }, [loadTickets, reloadKey])

  function applySearch(event) {
    event.preventDefault()
    setSearch(searchDraft.trim())
    setPage(1)
  }

  async function updateTicketField(ticket, field, value) {
    setBusyTicketId(ticket.id)
    try {
      await api.patch(`/admin/tickets/${ticket.id}/${field}`, { [field]: value })
      toast.success(field === 'status' ? 'Ticket status updated.' : 'Ticket priority updated.')
      setReloadKey((current) => current + 1)
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(
          requestError,
          field === 'status'
            ? 'Could not update ticket status.'
            : 'Could not update ticket priority.',
        ),
      )
    } finally {
      setBusyTicketId('')
    }
  }

  const hasFilters = Boolean(search || status || priority)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Administration"
        title="Admin tickets"
        description="Monitor the support workload and manage ticket status and priority."
        action={
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700">
            <ShieldCheck size={15} />
            Admin workspace
          </span>
        }
      />

      <section aria-label="Ticket statistics">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Workspace overview</h2>
            <p className="mt-1 text-xs text-slate-500">Live counts from the ticket system.</p>
          </div>
          {stats && (
            <p className="text-xs text-slate-500">
              {stats.total} total tickets
            </p>
          )}
        </div>
        {statsError ? (
          <ErrorState
            title="Statistics unavailable"
            message={statsError}
            onRetry={loadStats}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statsLoading
                ? Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
                    />
                  ))
                : (
                    <>
                      <MetricCard label="Total tickets" value={stats?.total} />
                      <MetricCard label="Open" value={stats?.open} tone="blue" />
                      <MetricCard
                        label="In progress"
                        value={stats?.in_progress}
                        tone="amber"
                      />
                      <MetricCard
                        label="Resolved"
                        value={stats?.resolved_total ?? stats?.resolved}
                        tone="emerald"
                      />
                    </>
                  )}
            </div>
            {!statsLoading && stats && (
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Priority mix</span>
                <span>Low <strong className="ml-1 text-slate-900">{stats.priority?.low ?? 0}</strong></span>
                <span>Medium <strong className="ml-1 text-slate-900">{stats.priority?.medium ?? 0}</strong></span>
                <span>High <strong className="ml-1 text-slate-900">{stats.priority?.high ?? 0}</strong></span>
                <span>Urgent <strong className="ml-1 text-slate-900">{stats.priority?.urgent ?? 0}</strong></span>
                <span className="ml-auto">Open + in progress <strong className="ml-1 text-slate-900">{stats.open_and_in_progress_total ?? (stats.open ?? 0) + (stats.in_progress ?? 0)}</strong></span>
              </div>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Ticket queue</h2>
          <p className="mt-1 text-xs text-slate-500">
            Search, filter, sort, and update ticket management fields.
          </p>
        </div>

        <form
          onSubmit={applySearch}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(130px,0.8fr))_auto]"
        >
          <label className="relative block sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Search ticket title and description</span>
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              maxLength={100}
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search tickets..."
              className={`${controlClassName} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              className={controlClassName}
            >
              {statuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value)
                setPage(1)
              }}
              className={controlClassName}
            >
              {priorities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort tickets by</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={controlClassName}
            >
              <option value="created_at">Created date</option>
              <option value="updated_at">Updated date</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort direction</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className={controlClassName}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <Search size={15} />
            Search
          </button>
        </form>

        {ticketsError ? (
          <ErrorState
            title="Ticket queue unavailable"
            message={ticketsError}
            onRetry={loadTickets}
          />
        ) : ticketsLoading ? (
          <div className="space-y-3" role="status" aria-label="Loading admin tickets">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No matching tickets' : 'No tickets in the queue'}
            description={
              hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Tickets will appear here when customers submit requests.'
            }
          />
        ) : (
          <>
            <TicketList
              tickets={tickets}
              admin
              busyTicketId={busyTicketId}
              onStatusChange={(ticket, value) =>
                updateTicketField(ticket, 'status', value)
              }
              onPriorityChange={(ticket, value) =>
                updateTicketField(ticket, 'priority', value)
              }
            />
            <footer className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, pagination.total)} of {pagination.total} tickets
              </p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={page <= 1 || ticketsLoading}
                  onClick={() => setPage((current) => current - 1)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="min-w-20 text-center text-xs text-slate-500">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages || ticketsLoading}
                  onClick={() => setPage((current) => current + 1)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  )
}
