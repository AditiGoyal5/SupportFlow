import { useCallback, useEffect, useState } from 'react'
import { Search, TicketPlus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import EditTicketDialog from '../components/EditTicketDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TicketList from '../components/TicketList.jsx'
import { useAuth } from '../context/AuthContext.jsx'
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

export default function TicketWorkspacePage() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search')?.trim() ?? ''
  const [searchDraft, setSearchDraft] = useState(search)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [tickets, setTickets] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyTicketId, setBusyTicketId] = useState('')
  const [editingTicket, setEditingTicket] = useState(null)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = { page, limit: pageSize }
    if (status) params.status = status
    if (priority) params.priority = priority
    if (category.trim()) params.category = category.trim()
    if (search) params.search = search

    try {
      const { data } = await api.get(isAdmin ? '/admin/tickets' : '/tickets', {
        params,
      })
      setTickets(data.tickets)
      setPagination(data.pagination)
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          isAdmin ? 'Could not load the ticket queue.' : 'Could not load your tickets.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [isAdmin, page, status, priority, category, search])

  useEffect(() => {
    loadTickets()
  }, [loadTickets, reloadKey])

  function applySearch(event) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchDraft.trim()) next.set('search', searchDraft.trim())
    else next.delete('search')
    setPage(1)
    setSearchParams(next)
  }

  async function deleteTicket(ticket) {
    if (!window.confirm(`Delete "${ticket.title}"? This cannot be undone.`)) return

    setBusyTicketId(ticket.id)
    try {
      await api.delete(`/tickets/${ticket.id}`)
      toast.success('Ticket deleted.')
      if (tickets.length === 1 && page > 1) setPage((current) => current - 1)
      else setReloadKey((current) => current + 1)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Could not delete this ticket.'))
    } finally {
      setBusyTicketId('')
    }
  }

  async function updateManagedField(ticket, field, value) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isAdmin ? 'Team operations' : 'Requests'}
        title={isAdmin ? 'Ticket queue' : 'My tickets'}
        description={
          isAdmin
            ? 'Review incoming requests and keep the support queue moving.'
            : 'Review and manage the support requests you have submitted.'
        }
        action={
          <Link
            to="/app/tickets/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <TicketPlus size={16} />
            Create ticket
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5">
        <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,0.8fr))_auto]">
          <label className="relative block sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Search tickets</span>
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
              placeholder="Search title or description..."
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
            <span className="sr-only">Filter by category</span>
            <input
              type="text"
              maxLength={50}
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setPage(1)
              }}
              placeholder="Category"
              className={controlClassName}
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <Search size={15} />
            Search
          </button>
        </form>
      </section>

      {error ? (
        <ErrorState title="Tickets could not be loaded" message={error} onRetry={loadTickets} />
      ) : loading ? (
        <div className="space-y-3" role="status" aria-label="Loading tickets">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title={search || status || priority || category ? 'No matching tickets' : 'No tickets yet'}
          description={
            search || status || priority || category
              ? 'Try changing your search or filters.'
              : 'Create a support ticket to get help from the team.'
          }
          action={
            !search && !status && !priority && !category ? (
              <Link
                to="/app/tickets/new"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <TicketPlus size={14} />
                Create ticket
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <TicketList
            tickets={tickets}
            admin={isAdmin}
            busyTicketId={busyTicketId}
            onEdit={setEditingTicket}
            onDelete={deleteTicket}
            onStatusChange={(ticket, value) =>
              updateManagedField(ticket, 'status', value)
            }
            onPriorityChange={(ticket, value) =>
              updateManagedField(ticket, 'priority', value)
            }
          />

          <footer className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {pagination.total === 0 ? 0 : (page - 1) * pageSize + 1}
              {'–'}
              {Math.min(page * pageSize, pagination.total)} of {pagination.total} tickets
            </p>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                disabled={page <= 1 || loading}
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
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </>
      )}

      {editingTicket && (
        <EditTicketDialog
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSaved={() => {
            setEditingTicket(null)
            setReloadKey((current) => current + 1)
          }}
        />
      )}
    </div>
  )
}
