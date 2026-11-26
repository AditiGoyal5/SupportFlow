export const CATEGORY_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'account', label: 'Account' },
  { value: 'billing', label: 'Billing' },
  { value: 'general', label: 'General' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
)

export const PRIORITY_DETAILS = [
  { value: 'low', label: 'Low', description: 'A general question or request' },
  { value: 'medium', label: 'Medium', description: 'Something is not working as expected' },
  { value: 'high', label: 'High', description: 'Work is blocked or significantly affected' },
  { value: 'urgent', label: 'Urgent', description: 'A critical issue needs immediate attention' },
]

export const SORT_OPTIONS = [
  { value: 'updated_at:desc', label: 'Recently updated' },
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'priority:desc', label: 'Priority: urgent first' },
  { value: 'title:asc', label: 'Title: A–Z' },
]

const STATUS_RANK = { open: 0, in_progress: 1, resolved: 2, closed: 3 }
const PRIORITY_RANK = { low: 0, medium: 1, high: 2, urgent: 3 }

export function getInitials(name = '', fallback = '?') {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || fallback
  )
}

export function formatFullDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatRelativeDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date)
}

export function validateTicketForm(values) {
  const errors = {}
  const title = values.title?.trim() ?? ''
  const description = values.description?.trim() ?? ''

  if (!title) errors.title = 'Enter a short summary.'
  else if (title.length < 4) errors.title = 'Use at least 4 characters.'

  if (!values.category) errors.category = 'Choose a category.'

  if (!description) errors.description = 'Add a description.'
  else if (description.length < 10) errors.description = 'Add a little more detail (at least 10 characters).'

  return errors
}

export function sortTickets(list, sortBy = 'updated_at', sortOrder = 'desc') {
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...list].sort((a, b) => {
    let result = 0

    switch (sortBy) {
      case 'title':
        result = String(a.title ?? '').localeCompare(String(b.title ?? ''))
        break
      case 'status':
        result = (STATUS_RANK[a.status] ?? 0) - (STATUS_RANK[b.status] ?? 0)
        break
      case 'priority':
        result = (PRIORITY_RANK[a.priority] ?? 0) - (PRIORITY_RANK[b.priority] ?? 0)
        break
      case 'category':
        result = String(a.category ?? '').localeCompare(String(b.category ?? ''))
        break
      case 'created_at':
        result = new Date(a.created_at ?? 0) - new Date(b.created_at ?? 0)
        break
      case 'updated_at':
      default:
        result = new Date(a.updated_at ?? 0) - new Date(b.updated_at ?? 0)
        break
    }

    if (result === 0) {
      result = new Date(a.updated_at ?? 0) - new Date(b.updated_at ?? 0)
    }

    return result * direction
  })
}
