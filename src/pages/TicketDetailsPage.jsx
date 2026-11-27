import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MessageCircle,
  Send,
  Tag,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import PriorityBadge, {
  PRIORITY_META,
  PRIORITY_OPTIONS,
} from '../components/PriorityBadge.jsx'
import StatusBadge, {
  STATUS_META,
  STATUS_OPTIONS,
} from '../components/StatusBadge.jsx'
import { Avatar, AvatarFallback } from '../components/ui/avatar.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Label } from '../components/ui/label.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.jsx'
import { Separator } from '../components/ui/separator.jsx'
import { Skeleton } from '../components/ui/skeleton.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import { CATEGORY_LABELS } from '../lib/tickets.js'
import { cn, formatTicketKey } from '../lib/utils.js'

function formatEnumLabel(value, meta) {
  if (value === null || value === undefined || value === '') return 'unknown'
  if (meta?.[value]?.label) return meta[value].label
  return String(value)
    .replace(/_/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
}

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

function getCommentAuthorRole(comment, ticket, user) {
  if (comment.author_user_id === user?.id) {
    return user.role === 'admin' ? 'Admin' : 'User'
  }

  if (comment.author_user_id === ticket.assigned_to) {
    return ticket.assignee_role === 'admin' ? 'Admin' : 'User'
  }

  return null
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
        return `${actor} changed priority from ${formatEnumLabel(metadata.oldPriority, PRIORITY_META)} to ${formatEnumLabel(metadata.newPriority, PRIORITY_META)}`
      }

      const fields = Array.isArray(metadata.changedFields)
        ? metadata.changedFields.map((field) => formatEnumLabel(field)).join(', ')
        : ''
      return fields
        ? `${actor} updated ${fields}`
        : `${actor} updated this ticket`
    }
    case 'ticket.status_changed':
      return `${actor} changed status from ${formatEnumLabel(metadata.oldStatus, STATUS_META)} to ${formatEnumLabel(metadata.newStatus, STATUS_META)}`
    case 'ticket.resolved':
      return `${actor} marked this ticket as resolved`
    case 'comment.added':
      return `${actor} added a comment`
    case 'ticket.assigned': {
      const previousAssignee = metadata.previousAssigneeName
      const newAssignee = metadata.newAssigneeName
      if (!previousAssignee && newAssignee) {
        return `${actor} assigned this ticket to ${newAssignee}`
      }
      if (previousAssignee && newAssignee) {
        return `${actor} reassigned this ticket from ${previousAssignee} to ${newAssignee}`
      }
      if (previousAssignee) {
        return `${actor} unassigned ${previousAssignee} from this ticket`
      }
      return `${actor} updated the assignee`
    }
    default:
      return `${actor} updated this ticket`
  }
}

function TicketLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5" role="status" aria-label="Loading ticket details">
      <Skeleton className="h-5 w-60" />
      <Card className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-2/3" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-28 w-full" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </Card>
        </div>
      </div>
    </div>
  )
}

function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TicketDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [ticket, setTicket] = useState(null)
  const [directoryUsers, setDirectoryUsers] = useState([])
  const [directoryUsersError, setDirectoryUsersError] = useState('')
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
  const submittingCommentRef = useRef(false)
  const commentsRequestId = useRef(0)
  const [updatingField, setUpdatingField] = useState(false)
  const [assignableUsers, setAssignableUsers] = useState([])
  const [assignableUsersLoading, setAssignableUsersLoading] = useState(false)
  const [assignableUsersError, setAssignableUsersError] = useState('')
  const [assignmentBusy, setAssignmentBusy] = useState(false)
  const assignableUsersRequestId = useRef(0)
  const [ticketRetry, setTicketRetry] = useState(0)
  const [commentsRetry, setCommentsRetry] = useState(0)
  const [activityRetry, setActivityRetry] = useState(0)

  const loadComments = useCallback(async ({ signal } = {}) => {
    const requestId = ++commentsRequestId.current
    setCommentsLoading(true)
    setCommentsError(null)
    try {
      const { data } = await api.get(`/tickets/${id}/comments`, { signal })
      if (requestId !== commentsRequestId.current) return false

      const orderedComments = Array.isArray(data.comments) ? data.comments : []
      orderedComments.sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
      )
      setComments(orderedComments)
      return true
    } catch (error) {
      if (requestId === commentsRequestId.current && !signal?.aborted) {
        setCommentsError(getRequestError(error, 'comments'))
      }
      return false
    } finally {
      if (requestId === commentsRequestId.current) {
        setCommentsLoading(false)
      }
    }
  }, [id])

  const loadAssignableUsers = useCallback(async (
    ticketId = id,
    { signal } = {},
  ) => {
    const requestId = ++assignableUsersRequestId.current
    setAssignableUsersLoading(true)
    setAssignableUsersError('')
    try {
      const { data } = await api.get(
        `/tickets/${ticketId}/assignable-users`,
        { signal },
      )
      if (requestId === assignableUsersRequestId.current) {
        setAssignableUsers(Array.isArray(data.users) ? data.users : [])
      }
    } catch (error) {
      if (requestId === assignableUsersRequestId.current && !signal?.aborted) {
        setAssignableUsersError(
          getApiErrorMessage(error, 'Could not load assignable users.'),
        )
      }
    } finally {
      if (requestId === assignableUsersRequestId.current) {
        setAssignableUsersLoading(false)
      }
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
    const commentsController = new AbortController()
    const assigneesController = new AbortController()
    setTicket(null)
    setTicketLoading(true)
    setTicketError(null)
    setComments([])
    setCommentsLoading(false)
    setCommentsError(null)
    setActivity([])
    setAssignableUsers([])
    setAssignableUsersLoading(false)
    setAssignableUsersError('')

    api
      .get(`/tickets/${id}`)
      .then(({ data }) => {
        if (!active) return
        const loadedTicket = data.ticket
        setTicket(loadedTicket)
        loadComments({ signal: commentsController.signal })
        loadActivity()
        if (isAdmin || loadedTicket.assigned_to === user?.id) {
          loadAssignableUsers(id, { signal: assigneesController.signal })
        }
      })
      .catch((error) => {
        if (active) setTicketError(getRequestError(error, 'ticket'))
      })
      .finally(() => {
        if (active) setTicketLoading(false)
      })

    return () => {
      active = false
      commentsController.abort()
      commentsRequestId.current += 1
      assigneesController.abort()
      assignableUsersRequestId.current += 1
    }
  }, [
    id,
    ticketRetry,
    loadComments,
    loadActivity,
    loadAssignableUsers,
    isAdmin,
    user?.id,
  ])

  useEffect(() => {
    if (ticket && commentsRetry > 0) loadComments()
  }, [ticket, commentsRetry, loadComments])

  useEffect(() => {
    if (ticket && activityRetry > 0) loadActivity()
  }, [ticket, activityRetry, loadActivity])

  useEffect(() => {
    if (!isAdmin || !ticket) return undefined

    const controller = new AbortController()
    setDirectoryUsersError('')
    api
      .get('/admin/users', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setDirectoryUsers(Array.isArray(data.users) ? data.users : [])
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setDirectoryUsersError(
            getApiErrorMessage(error, 'Could not load reporter details.'),
          )
        }
      })

    return () => controller.abort()
  }, [isAdmin, ticket?.created_by, ticket?.user_id])

  async function handleCommentSubmit(event) {
    event.preventDefault()
    if (submittingCommentRef.current) return

    const content = commentText.trim()

    if (!content) {
      setCommentError('Write a comment before submitting.')
      return
    }

    submittingCommentRef.current = true
    setSubmittingComment(true)
    setCommentError('')
    try {
      const { data } = await api.post(`/tickets/${id}/comments`, { content })
      const createdComment = data.comment

      commentsRequestId.current += 1
      setComments((currentComments) => {
        if (currentComments.some((comment) => comment.id === createdComment.id)) {
          return currentComments
        }

        return [...currentComments, createdComment].sort(
          (left, right) =>
            new Date(left.created_at).getTime() -
            new Date(right.created_at).getTime(),
        )
      })
      setCommentsLoading(false)
      setCommentsError(null)
      setCommentText('')
      toast.success('Your comment was added.')
      loadActivity()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not add your comment.')
      setCommentError(message)
      toast.error(message)
    } finally {
      submittingCommentRef.current = false
      setSubmittingComment(false)
    }
  }

  async function updateManagedField(field, value) {
    if (!ticket) return
    setUpdatingField(true)
    try {
      const { data } = await api.patch(`/admin/tickets/${ticket.id}/${field}`, {
        [field]: value,
      })
      if (!data?.ticket) {
        toast.error('The server returned an invalid ticket update response.')
        return
      }

      setTicket(data.ticket)
      toast.success(field === 'status' ? 'Ticket status updated.' : 'Ticket priority updated.')
      loadActivity()
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
      setUpdatingField(false)
    }
  }

  async function updateAssignee(assignedTo) {
    if (!ticket) return

    setAssignmentBusy(true)
    setAssignableUsersError('')
    try {
      const { data } = await api.patch(`/tickets/${ticket.id}/assign`, {
        assigned_to: assignedTo,
      })
      if (!data?.ticket) {
        toast.error('The server returned an invalid assignment response.')
        return
      }

      const updatedTicket = data.ticket
      setTicket(updatedTicket)
      toast.success(
        assignedTo
          ? `Ticket assigned to ${updatedTicket.assignee_name || 'the selected user'}.`
          : 'Ticket unassigned.',
      )

      if (!isAdmin && updatedTicket.assigned_to !== user?.id) {
        assignableUsersRequestId.current += 1
        setAssignableUsers([])
        if (updatedTicket.created_by !== user?.id) {
          navigate('/app/tickets')
        }
      } else {
        loadAssignableUsers(ticket.id)
        loadActivity()
      }
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        'Could not update the ticket assignment.',
      )
      setAssignableUsersError(message)
      toast.error(message)
    } finally {
      setAssignmentBusy(false)
    }
  }

  if (ticketLoading) return <TicketLoadingSkeleton />

  if (ticketError) {
    const isNotFound = ticketError.title === 'Ticket not found'
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/tickets">
            <ArrowLeft className="h-4 w-4" />
            Back to {isAdmin ? 'All Tickets' : 'My Tickets'}
          </Link>
        </Button>
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
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/tickets">
            <ArrowLeft className="h-4 w-4" />
            Back to {isAdmin ? 'All Tickets' : 'My Tickets'}
          </Link>
        </Button>
        <EmptyState
          title="Ticket not found"
          description="This ticket may have been removed or you may not have access to it."
        />
      </div>
    )
  }

  const isOwnTicket = (ticket.created_by ?? ticket.user_id) === user?.id
  const reporter = directoryUsers.find(
    (candidate) => candidate.id === (ticket.created_by ?? ticket.user_id),
  )
  const creatorName =
    ticket.creator_name ?? reporter?.name ?? (isOwnTicket ? user.name : 'Ticket creator')
  const creatorEmail =
    ticket.creator_email ?? reporter?.email ?? (isOwnTicket ? user.email : '')
  const creatorDetail =
    creatorEmail && !/^[0-9a-f-]{36}$/i.test(creatorEmail) ? creatorEmail : ''
  const canManageAssignment =
    isAdmin || ticket.assigned_to === user?.id
  const ticketKey = formatTicketKey(ticket.id)
  const backPath = '/app/tickets'
  const backLabel = isAdmin ? 'All Tickets' : 'My Tickets'

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Jira-style breadcrumb + back bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs">
          <Link to="/app" className="text-muted-foreground transition hover:text-primary">
            Dashboard
          </Link>
          <span aria-hidden="true" className="text-border">/</span>
          <Link to={backPath} className="text-muted-foreground transition hover:text-primary">
            {backLabel}
          </Link>
          <span aria-hidden="true" className="text-border">/</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
            {ticketKey}
          </span>
        </nav>

        <Button asChild variant="outline" size="sm">
          <Link to={backPath}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {backLabel}
          </Link>
        </Button>
      </div>

      {/* Main 2-column Jira/ClickUp layout */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <main className="min-w-0 space-y-6">
          {/* Issue Title & Description Card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 bg-muted/20 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px] font-semibold">
                    {ticketKey}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] font-medium">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {CATEGORY_LABELS[ticket.category] ??
                      formatEnumLabel(ticket.category ?? 'general')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              <h1 className="pt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {ticket.title}
              </h1>
            </CardHeader>

            <CardContent className="pt-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h2>
              <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {ticket.description}
              </div>
            </CardContent>

            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Created {formatDate(ticket.created_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                Updated {formatDate(ticket.updated_at)}
              </span>
            </div>
          </Card>

          {/* Comments Card */}
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between border-b border-border/70 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle className="h-4 w-4 text-primary" />
                Comments
              </CardTitle>
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                {comments.length}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {commentsLoading ? (
                <ListSkeleton />
              ) : commentsError ? (
                <ErrorState
                  title={commentsError.title}
                  message={commentsError.message}
                  onRetry={() => setCommentsRetry((value) => value + 1)}
                />
              ) : comments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-7 text-center">
                  <MessageCircle className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">No comments yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add a reply below to continue the conversation.
                  </p>
                </div>
              ) : (
                <ol className="space-y-4" aria-label="Ticket conversation">
                  {comments.map((comment) => {
                    const author = comment.author_name || 'Former member'
                    const isCurrentUser = comment.author_user_id === user?.id
                    const authorRole = comment.author_user_id
                      ? getCommentAuthorRole(comment, ticket, user)
                      : null
                    return (
                      <li
                        key={comment.id}
                        className={`flex gap-3 ${isCurrentUser ? 'sm:flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-[11px]">
                            {initials(author) || <UserRound className="h-3.5 w-3.5" />}
                          </AvatarFallback>
                        </Avatar>
                        <article className={`min-w-0 flex-1 rounded-lg border px-4 py-3 ${
                          isCurrentUser
                            ? 'border-indigo-100 bg-indigo-50/50'
                            : 'border-border/80 bg-muted/25'
                        }`}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h3 className="text-xs font-semibold text-foreground">{author}</h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              {authorRole && (
                                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/80">
                                  {authorRole}
                                  {isCurrentUser ? ' · You' : ''}
                                </span>
                              )}
                              <time
                                dateTime={comment.created_at}
                                className="text-[11px] text-muted-foreground"
                              >
                                {formatDate(comment.created_at)}
                              </time>
                            </div>
                          </div>
                          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                            {comment.content}
                          </p>
                        </article>
                      </li>
                    )
                  })}
                </ol>
              )}

              <Separator />

              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <Label htmlFor="ticket-comment">Add a comment</Label>
                <Textarea
                  id="ticket-comment"
                  value={commentText}
                  maxLength={5000}
                  rows={3}
                  disabled={submittingComment}
                  onChange={(event) => {
                    setCommentText(event.target.value)
                    if (commentError) setCommentError('')
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      (event.ctrlKey || event.metaKey)
                    ) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder="Write a reply to the support team..."
                  aria-invalid={Boolean(commentError)}
                  aria-describedby={commentError ? 'ticket-comment-error' : undefined}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/70 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                    {submittingComment ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {submittingComment ? 'Sending...' : 'Send reply'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4 text-primary" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 pt-0">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                {isAdmin ? (
                  <Select
                    value={ticket.status}
                    disabled={updatingField}
                    onValueChange={(value) => updateManagedField('status', value)}
                  >
                    <SelectTrigger className="h-8 w-[145px] text-[11px] font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                STATUS_META[option.value]?.dotClass,
                              )}
                            />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={ticket.status} />
                )}
              </div>

              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-xs font-medium text-muted-foreground">Priority</span>
                {isAdmin ? (
                  <Select
                    value={ticket.priority}
                    disabled={updatingField}
                    onValueChange={(value) => updateManagedField('priority', value)}
                  >
                    <SelectTrigger className="h-8 w-[145px] text-[11px] font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => {
                        const PriorityIcon = PRIORITY_META[option.value]?.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              {PriorityIcon && (
                                <PriorityIcon
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    PRIORITY_META[option.value]?.iconClass,
                                  )}
                                />
                              )}
                              {option.label}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <PriorityBadge priority={ticket.priority} />
                )}
              </div>

              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <Badge variant="secondary" className="font-medium">
                  {CATEGORY_LABELS[ticket.category] ??
                    formatEnumLabel(ticket.category ?? 'general')}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-4 py-3.5">
                <span className="pt-0.5 text-xs font-medium text-muted-foreground">Reporter</span>
                <div className="flex min-w-0 items-center gap-2 text-right">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {initials(creatorName) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{creatorName}</p>
                    {creatorDetail && (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {creatorDetail}
                      </p>
                    )}
                    {!creatorDetail && directoryUsersError && (
                      <p className="text-[11px] text-destructive">
                        Reporter details unavailable
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 py-3.5">
                <span className="pt-2 text-xs font-medium text-muted-foreground">
                  Assignee
                </span>
                {canManageAssignment && !assignableUsersError ? (
                  <Select
                    value={ticket.assigned_to ?? 'unassigned'}
                    disabled={assignmentBusy || assignableUsersLoading}
                    onValueChange={(value) =>
                      updateAssignee(value === 'unassigned' ? null : value)
                    }
                  >
                    <SelectTrigger
                      aria-label="Ticket assignee"
                      className="h-8 w-[180px] text-[11px] font-medium"
                    >
                      <SelectValue
                        placeholder={
                          assignableUsersLoading ? 'Loading users…' : 'Unassigned'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdmin && (
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                      )}
                      {assignableUsers.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name} · {assignee.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="min-w-0 text-right">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {ticket.assignee_name ||
                        (ticket.assigned_to ? 'Assigned user' : 'Unassigned')}
                    </p>
                    {ticket.assignee_role && (
                      <p className="text-[11px] capitalize text-muted-foreground">
                        {ticket.assignee_role}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {canManageAssignment && assignableUsersError && (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-3 pb-3.5 text-xs text-destructive"
                >
                  <span>{assignableUsersError}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => loadAssignableUsers(ticket.id)}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {activityLoading ? (
                <ListSkeleton rows={4} />
              ) : activityError ? (
                <ErrorState
                  title={activityError.title}
                  message={activityError.message}
                  onRetry={() => setActivityRetry((value) => value + 1)}
                />
              ) : activity.length === 0 ? (
                <p className="rounded-lg bg-muted/40 px-3 py-4 text-center text-xs leading-5 text-muted-foreground">
                  No activity has been recorded for this ticket.
                </p>
              ) : (
                <ol className="space-y-0">
                  {activity.map((item, index) => (
                    <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < activity.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[5px] top-3 h-full w-px bg-border"
                        />
                      )}
                      <span className="relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-background" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-5 text-foreground/90">
                          {getActivityDescription(item)}
                        </p>
                        <time
                          dateTime={item.created_at}
                          className="mt-0.5 block text-[11px] text-muted-foreground"
                        >
                          {formatDate(item.created_at)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
