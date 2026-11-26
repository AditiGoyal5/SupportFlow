import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Clock3,
  MessageCircle,
  Send,
  Tag,
  UserRound,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getRequestError(error, resource) {
  if (error.response?.status === 403) {
    return {
      title: 'Access denied',
      message: `You do not have permission to view this ${resource}.`,
    }
  }

  if (error.response?.status === 404) {
    return {
      title: resource === 'ticket' ? 'Ticket not found' : `${resource} unavailable`,
      message:
        'This ticket may have been removed or you may not have permission to access it.',
    }
  }

  return {
    title: `Could not load ${resource}`,
    message: getApiErrorMessage(error, `We could not load this ${resource}.`),
  }
}

function getActivityDescription(activity) {
  const actor = activity.actor_name || 'A former member'
  const metadata = activity.metadata ?? {}

  switch (activity.event_type) {
    case 'ticket.created':
      return `${actor} created this ticket`
    case 'ticket.updated': {
      if (metadata.oldPriority && metadata.newPriority) {
        return `${actor} changed priority from ${metadata.oldPriority} to ${metadata.newPriority}`
      }

      const fields = Array.isArray(metadata.changedFields)
        ? metadata.changedFields.join(', ')
        : ''
      return fields
        ? `${actor} updated ${fields}`
        : `${actor} updated this ticket`
    }
    case 'ticket.status_changed':
      return `${actor} changed status from ${metadata.oldStatus ?? 'unknown'} to ${metadata.newStatus ?? 'unknown'}`
    case 'ticket.resolved':
      return `${actor} marked this ticket as resolved`
    case 'comment.added':
      return `${actor} added a comment`
    default:
      return `${actor} updated this ticket`
  }
}

function TicketLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6">
      <div className="h-4 w-56 rounded bg-slate-200" />
      <div className="h-24 rounded-2xl bg-white ring-1 ring-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-72 rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-80 rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      </div>
      <span className="sr-only">Loading ticket details</span>
    </div>
  )
}

function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-3">
          <span className="size-9 shrink-0 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-1/4 rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PanelHeading({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
      <h2 className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
        <Icon size={17} className="text-indigo-600" />
        {title}
      </h2>
      {count !== undefined && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {count}
        </span>
      )}
    </div>
  )
}

export default function TicketDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [ticketLoading, setTicketLoading] = useState(true)
  const [ticketError, setTicketError] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState(null)
  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [ticketRetry, setTicketRetry] = useState(0)
  const [commentsRetry, setCommentsRetry] = useState(0)
  const [activityRetry, setActivityRetry] = useState(0)

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    setCommentsError(null)
    try {
      const { data } = await api.get(`/tickets/${id}/comments`)
      const orderedComments = Array.isArray(data.comments) ? data.comments : []
      orderedComments.sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
      )
      setComments(orderedComments)
      return true
    } catch (error) {
      setCommentsError(getRequestError(error, 'comments'))
      return false
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  const loadActivity = useCallback(async () => {
    setActivityLoading(true)
    setActivityError(null)
    try {
      const { data } = await api.get(`/tickets/${id}/activity`)
      const orderedActivity = Array.isArray(data.activities) ? data.activities : []
      orderedActivity.sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
      )
      setActivity(orderedActivity)
    } catch (error) {
      setActivityError(getRequestError(error, 'activity'))
    } finally {
      setActivityLoading(false)
    }
  }, [id])

  useEffect(() => {
    let active = true
    setTicket(null)
    setTicketLoading(true)
    setTicketError(null)
    setComments([])
    setActivity([])

    api
      .get(`/tickets/${id}`)
      .then(({ data }) => {
        if (!active) return
        setTicket(data.ticket)
        loadComments()
        loadActivity()
      })
      .catch((error) => {
        if (active) setTicketError(getRequestError(error, 'ticket'))
      })
      .finally(() => {
        if (active) setTicketLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, ticketRetry, loadComments, loadActivity])

  useEffect(() => {
    if (ticket && commentsRetry > 0) loadComments()
  }, [ticket, commentsRetry, loadComments])

  useEffect(() => {
    if (ticket && activityRetry > 0) loadActivity()
  }, [ticket, activityRetry, loadActivity])

  async function handleCommentSubmit(event) {
    event.preventDefault()
    const content = commentText.trim()

    if (!content) {
      setCommentError('Write a comment before submitting.')
      return
    }

    setSubmittingComment(true)
    setCommentError('')
    try {
      await api.post(`/tickets/${id}/comments`, { content })
      setCommentText('')
      toast.success('Your comment was added.')
      const refreshed = await loadComments()
      if (!refreshed) {
        toast.error('The comment was added, but the comment list could not be refreshed.')
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not add your comment.')
      setCommentError(message)
      toast.error(message)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (ticketLoading) return <TicketLoadingSkeleton />

  if (ticketError) {
    const isNotFound = ticketError.title === 'Ticket not found'
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <Link
          to="/app/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to My Tickets
        </Link>
        <ErrorState
          title={ticketError.title}
          message={ticketError.message}
          onRetry={isNotFound ? undefined : () => setTicketRetry((value) => value + 1)}
        />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <Link
          to="/app/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to My Tickets
        </Link>
        <EmptyState
          title="Ticket not found"
          description="This ticket may have been removed or you may not have access to it."
        />
      </div>
    )
  }

  const creatorName =
    ticket.creator_name ??
    (ticket.user_id === user?.id ? user.name : 'Ticket creator')
  const creatorDetail =
    ticket.creator_email ??
    (ticket.user_id === user?.id ? user.email : ticket.user_id)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs">
          <Link to="/app" className="text-slate-500 transition hover:text-indigo-600">
            Dashboard
          </Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link
            to="/app/tickets"
            className="text-slate-500 transition hover:text-indigo-600"
          >
            My Tickets
          </Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span aria-current="page" className="truncate font-medium text-slate-700">
            Ticket details
          </span>
        </nav>
        <Link
          to="/app/tickets"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          <ArrowLeft size={15} />
          Back to My Tickets
        </Link>
      </div>

      <PageHeader
        eyebrow={`Ticket ID · ${ticket.id}`}
        title={ticket.title}
        description="Review the request, follow updates, and reply to the support team."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        }
      />

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays size={15} className="text-slate-400" />
        Created {formatDate(ticket.created_at)}
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-slate-900">Ticket description</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                <Tag size={13} className="text-slate-400" />
                {ticket.category || 'General'}
              </span>
            </div>
            <div className="whitespace-pre-wrap px-5 py-5 text-sm leading-7 text-slate-700 sm:px-6">
              {ticket.description}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 sm:px-6">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} className="text-slate-400" />
                Created {formatDate(ticket.created_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} className="text-slate-400" />
                Last updated {formatDate(ticket.updated_at)}
              </span>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <PanelHeading icon={MessageCircle} title="Comments" count={comments.length} />
            <div className="space-y-5 px-5 py-5 sm:px-6">
              {commentsLoading ? (
                <ListSkeleton />
              ) : commentsError ? (
                <ErrorState
                  title={commentsError.title}
                  message={commentsError.message}
                  onRetry={() => setCommentsRetry((value) => value + 1)}
                />
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                  <MessageCircle size={20} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">No comments yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a reply below to continue the conversation.
                  </p>
                </div>
              ) : (
                <ol className="space-y-5">
                  {comments.map((comment) => {
                    const author = comment.author_name || 'Former member'
                    return (
                      <li key={comment.id} className="flex gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                          {initials(author) || <UserRound size={15} />}
                        </span>
                        <article className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h3 className="text-xs font-semibold text-slate-800">{author}</h3>
                            <time
                              dateTime={comment.created_at}
                              className="text-[11px] text-slate-400"
                            >
                              {formatDate(comment.created_at)}
                            </time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                            {comment.content}
                          </p>
                        </article>
                      </li>
                    )
                  })}
                </ol>
              )}

              <form onSubmit={handleCommentSubmit} className="border-t border-slate-100 pt-5">
                <label
                  htmlFor="ticket-comment"
                  className="text-xs font-semibold text-slate-700"
                >
                  Add a comment
                </label>
                <textarea
                  id="ticket-comment"
                  value={commentText}
                  maxLength={5000}
                  rows={3}
                  onChange={(event) => {
                    setCommentText(event.target.value)
                    if (commentError) setCommentError('')
                  }}
                  placeholder="Write a reply to the support team..."
                  aria-invalid={Boolean(commentError)}
                  aria-describedby={commentError ? 'ticket-comment-error' : undefined}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/70"
                />
                {commentError && (
                  <p id="ticket-comment-error" className="mt-1.5 text-xs text-rose-600">
                    {commentError}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    {commentText.length.toLocaleString()}/5,000
                  </p>
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submittingComment ? 'Sending...' : 'Send comment'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <PanelHeading icon={Tag} title="Ticket information" />
            <dl className="divide-y divide-slate-100 px-5 sm:px-6">
              <InfoRow label="Status">
                <StatusBadge status={ticket.status} />
              </InfoRow>
              <InfoRow label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </InfoRow>
              <InfoRow label="Category">
                <span className="text-sm font-medium capitalize text-slate-700">
                  {ticket.category || 'General'}
                </span>
              </InfoRow>
              <InfoRow label="Ticket creator">
                <div className="min-w-0 text-right">
                  <p className="truncate text-sm font-medium text-slate-700">{creatorName}</p>
                  {creatorDetail && (
                    <p className="mt-0.5 break-all text-[11px] leading-4 text-slate-400">
                      {creatorDetail}
                    </p>
                  )}
                </div>
              </InfoRow>
            </dl>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <PanelHeading icon={Activity} title="Activity timeline" />
            <div className="px-5 py-5 sm:px-6">
              {activityLoading ? (
                <ListSkeleton rows={4} />
              ) : activityError ? (
                <ErrorState
                  title={activityError.title}
                  message={activityError.message}
                  onRetry={() => setActivityRetry((value) => value + 1)}
                />
              ) : activity.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs leading-5 text-slate-500">
                  No activity has been recorded for this ticket.
                </p>
              ) : (
                <ol className="space-y-0">
                  {activity.map((item, index) => (
                    <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < activity.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[5px] top-3 h-full w-px bg-slate-200"
                        />
                      )}
                      <span className="relative mt-1.5 size-3 shrink-0 rounded-full border-2 border-indigo-300 bg-white" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-5 text-slate-700">
                          {getActivityDescription(item)}
                        </p>
                        <time
                          dateTime={item.created_at}
                          className="mt-1 block text-[11px] text-slate-400"
                        >
                          {formatDate(item.created_at)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <dt className="pt-0.5 text-xs font-medium text-slate-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
