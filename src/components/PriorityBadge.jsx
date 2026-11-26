const priorityStyles = {
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
  medium: 'bg-sky-50 text-sky-700 ring-sky-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  urgent: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function PriorityBadge({ priority }) {
  const value = typeof priority === 'string' ? priority : ''
  const label = value || 'Unknown'
  const styles = priorityStyles[value] ?? 'bg-slate-100 text-slate-600 ring-slate-200'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
    >
      {label}
    </span>
  )
}
