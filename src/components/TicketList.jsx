import { CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PriorityBadge from './PriorityBadge.jsx'
import StatusBadge from './StatusBadge.jsx'

const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed']
const ticketPriorities = ['low', 'medium', 'high', 'urgent']

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function TicketRow({
  ticket,
  admin,
  busy,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 transition hover:border-slate-300 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/app/tickets/${ticket.id}`}
              className="max-w-full truncate text-sm font-semibold text-slate-900 hover:text-indigo-700 focus:outline-none focus:underline"
            >
              {ticket.title}
            </Link>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
            {ticket.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="font-medium capitalize text-slate-600">
              {ticket.category || 'General'}
            </span>
            <PriorityBadge priority={ticket.priority} />
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-slate-400" />
              Updated {formatDate(ticket.updated_at)}
            </span>
          </div>
          {admin && (
            <p className="mt-3 text-xs text-slate-500">
              Requester:{' '}
              <span className="font-medium text-slate-700">
                {ticket.creator_name || ticket.creator_email || 'Unknown'}
              </span>
              {ticket.creator_name && ticket.creator_email && (
                <span className="ml-1.5 break-all text-slate-400">
                  {ticket.creator_email}
                </span>
              )}
            </p>
          )}
        </div>

        {admin ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[300px] lg:shrink-0">
            <label className="text-[11px] font-semibold text-slate-500">
              Status
              <select
                aria-label={`Status for ${ticket.title}`}
                value={ticket.status}
                disabled={busy}
                onChange={(event) => onStatusChange(ticket, event.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium capitalize text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
              >
                {ticketStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-slate-500">
              Priority
              <select
                aria-label={`Priority for ${ticket.title}`}
                value={ticket.priority}
                disabled={busy}
                onChange={(event) => onPriorityChange(ticket, event.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium capitalize text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
              >
                {ticketPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
            {ticket.status === 'open' && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onEdit(ticket)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(ticket)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default function TicketList({
  tickets,
  admin = false,
  busyTicketId = '',
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
}) {
  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketRow
          key={ticket.id}
          ticket={ticket}
          admin={admin}
          busy={busyTicketId === ticket.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  )
}
