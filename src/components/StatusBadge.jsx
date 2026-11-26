import { CheckCircle2, Circle, CircleDot, XCircle } from 'lucide-react'
import { Badge } from './ui/badge.jsx'
import { cn } from '../lib/utils.js'

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const STATUS_META = {
  open: {
    label: 'Open',
    icon: Circle,
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    dotClass: 'bg-blue-500',
    columnAccent: 'border-t-blue-500',
    headerBg: 'bg-blue-50/70 text-blue-700',
  },
  in_progress: {
    label: 'In Progress',
    icon: CircleDot,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
    columnAccent: 'border-t-amber-500',
    headerBg: 'bg-amber-50/70 text-amber-700',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-500',
    columnAccent: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50/70 text-emerald-700',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
    dotClass: 'bg-slate-400',
    columnAccent: 'border-t-slate-400',
    headerBg: 'bg-slate-100 text-slate-600',
  },
}

export default function StatusBadge({ status, className }) {
  const value = typeof status === 'string' ? status : ''
  const meta = STATUS_META[value] ?? {
    label: value ? value.replace(/_/g, ' ') : 'Unknown',
    icon: Circle,
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
    dotClass: 'bg-slate-400',
  }
  const Icon = meta.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        meta.badgeClass,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{meta.label}</span>
    </Badge>
  )
}
