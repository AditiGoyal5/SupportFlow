import { AlertTriangle, ChevronDown, ChevronUp, ChevronsUp, Minus } from 'lucide-react'
import { Badge } from './ui/badge.jsx'
import { cn } from '../lib/utils.js'

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const PRIORITY_META = {
  low: {
    label: 'Low',
    icon: ChevronDown,
    iconClass: 'text-slate-500',
    badgeClass: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    iconClass: 'text-sky-600',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  high: {
    label: 'High',
    icon: ChevronUp,
    iconClass: 'text-orange-600',
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  urgent: {
    label: 'Urgent',
    icon: ChevronsUp,
    iconClass: 'text-rose-600',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

export default function PriorityBadge({ priority, showLabel = true, className }) {
  const value = typeof priority === 'string' ? priority : ''
  const meta = PRIORITY_META[value] ?? {
    label: value || 'Unknown',
    icon: AlertTriangle,
    iconClass: 'text-slate-400',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
  }
  const Icon = meta.icon

  if (!showLabel) {
    return (
      <span
        title={`Priority: ${meta.label}`}
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-md border',
          meta.badgeClass,
          className,
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', meta.iconClass)} />
      </span>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize whitespace-nowrap',
        meta.badgeClass,
        className,
      )}
    >
      <Icon className={cn('h-3 w-3 shrink-0', meta.iconClass)} />
      <span>{meta.label}</span>
    </Badge>
  )
}
