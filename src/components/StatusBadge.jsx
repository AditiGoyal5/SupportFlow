const statusStyles = {
  open: 'bg-blue-50 text-blue-700 ring-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export default function StatusBadge({ status }) {
  const value = typeof status === 'string' ? status : ''
  const label = value ? value.replace(/_/g, ' ') : 'Unknown'
  const styles = statusStyles[value] ?? 'bg-slate-100 text-slate-600 ring-slate-200'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
