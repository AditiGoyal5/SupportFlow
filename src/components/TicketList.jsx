import { useState } from 'react'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PriorityBadge, { PRIORITY_META, PRIORITY_OPTIONS } from './PriorityBadge.jsx'
import StatusBadge, { STATUS_META, STATUS_OPTIONS } from './StatusBadge.jsx'
import { Avatar, AvatarFallback } from './ui/avatar.jsx'
import { Badge } from './ui/badge.jsx'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.jsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table.jsx'
import { CATEGORY_LABELS } from '../lib/tickets.js'
import { cn, formatTicketKey } from '../lib/utils.js'
import { formatFullDate, formatRelativeDate, getInitials } from '../lib/tickets.js'

function SortableHead({ label, field, sort, onSortChange, className }) {
  const active = sort.by === field

  return (
    <TableHead
      scope="col"
      aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('p-0', className)}
    >
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className="flex h-10 w-full cursor-pointer items-center gap-1 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        {active ? (
          sort.order === 'asc' ? (
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
        )}
      </button>
    </TableHead>
  )
}

function StatusProperty({ ticket, admin, busy, onStatusChange }) {
  const meta = STATUS_META[ticket.status]

  if (!admin) return <StatusBadge status={ticket.status} />

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={ticket.status}
        disabled={busy}
        onValueChange={(value) => onStatusChange(ticket, value)}
      >
        <SelectTrigger
          aria-label={`Status for ${ticket.title}`}
          className="h-7 w-[128px] border-transparent bg-transparent px-2 text-xs font-medium shadow-none hover:bg-muted"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta?.dotClass)}
            />
            <span className="truncate">{meta?.label ?? ticket.status}</span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('h-2 w-2 rounded-full', STATUS_META[option.value]?.dotClass)}
                />
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {busy && <LoaderCircle className="h-3 w-3 animate-spin text-muted-foreground" aria-hidden="true" />}
    </div>
  )
}

function PriorityProperty({ ticket, admin, busy, onPriorityChange }) {
  const meta = PRIORITY_META[ticket.priority]

  if (!admin) return <PriorityBadge priority={ticket.priority} />

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={ticket.priority}
        disabled={busy}
        onValueChange={(value) => onPriorityChange(ticket, value)}
      >
        <SelectTrigger
          aria-label={`Priority for ${ticket.title}`}
          className="h-7 w-[108px] border-transparent bg-transparent px-2 text-xs font-medium shadow-none hover:bg-muted"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {meta?.icon && (
              <meta.icon
                aria-hidden="true"
                className={cn('h-3 w-3 shrink-0', meta.iconClass)}
              />
            )}
            <span className="truncate">{meta?.label ?? ticket.priority}</span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((option) => {
            const Icon = PRIORITY_META[option.value]?.icon
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  {Icon && (
                    <Icon
                      aria-hidden="true"
                      className={cn('h-3.5 w-3.5', PRIORITY_META[option.value]?.iconClass)}
                    />
                  )}
                  {option.label}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {busy && <LoaderCircle className="h-3 w-3 animate-spin text-muted-foreground" aria-hidden="true" />}
    </div>
  )
}

export default function TicketList({
  tickets,
  admin = false,
  currentUserId,
  busyIds,
  sort = { by: 'updated_at', order: 'desc' },
  onSortChange,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  groupByStatus = true,
}) {
  const [collapsed, setCollapsed] = useState(() => new Set())
  const columnCount = admin ? 9 : 8

  function toggleGroup(value) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  function renderRow(ticket) {
    const busy = busyIds?.has(ticket.id) ?? false
    const isCreator = (ticket.created_by ?? ticket.user_id) === currentUserId
    const requesterName = ticket.creator_name || ticket.creator_email || 'Unknown'
    const assigneeName = ticket.assignee_name || 'Unassigned'

    return (
      <TableRow key={ticket.id} aria-busy={busy} className={cn('group', busy && 'opacity-60')}>
        <TableCell className="w-[88px] pl-4 align-top">
          <Link
            to={`/app/tickets/${ticket.id}`}
            className="inline-flex rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            {formatTicketKey(ticket.id)}
          </Link>
        </TableCell>

        <TableCell className="min-w-[260px] max-w-[420px] py-2 align-top">
          <Link
            to={`/app/tickets/${ticket.id}`}
            className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
          >
            <span className="line-clamp-1">{ticket.title}</span>
          </Link>
          {ticket.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {ticket.description}
            </p>
          )}
        </TableCell>

        <TableCell className="w-[150px] py-2 align-top">
          <StatusProperty
            ticket={ticket}
            admin={admin}
            busy={busy}
            onStatusChange={onStatusChange}
          />
        </TableCell>

        <TableCell className="w-[130px] py-2 align-top">
          <PriorityProperty
            ticket={ticket}
            admin={admin}
            busy={busy}
            onPriorityChange={onPriorityChange}
          />
        </TableCell>

        <TableCell className="w-[130px] py-2 align-top">
          <Badge
            variant="secondary"
            className="max-w-[120px] truncate rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-700"
            title={CATEGORY_LABELS[ticket.category] ?? ticket.category}
          >
            {CATEGORY_LABELS[ticket.category] ?? ticket.category ?? 'General'}
          </Badge>
        </TableCell>

        <TableCell className="w-[160px] py-2 align-top">
          {ticket.assignee_name ? (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-6 w-6" role="img" aria-label={assigneeName}>
                <AvatarFallback className="text-[10px]">
                  {getInitials(assigneeName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {assigneeName}
                </p>
                {ticket.assignee_role && (
                  <p className="text-[10px] capitalize text-muted-foreground">
                    {ticket.assignee_role}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </TableCell>

        {admin && (
          <TableCell className="w-[170px] py-2 align-top">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-6 w-6" role="img" aria-label={requesterName}>
                <AvatarFallback className="text-[10px]">
                  {getInitials(requesterName)}
                </AvatarFallback>
              </Avatar>
              <p className="truncate text-xs font-medium text-foreground">{requesterName}</p>
            </div>
          </TableCell>
        )}

        <TableCell className="w-[100px] py-2 align-top text-xs text-muted-foreground">
          <time dateTime={ticket.updated_at} title={formatFullDate(ticket.updated_at)}>
            {formatRelativeDate(ticket.updated_at)}
          </time>
        </TableCell>

        <TableCell className="w-[60px] py-2 pr-4 text-right align-top">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={busy}
                aria-label={`Actions for ${ticket.title}`}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/tickets/${ticket.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  View details
                </Link>
              </DropdownMenuItem>
              {admin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-rose-50 focus:text-destructive"
                    onClick={() => onDelete?.(ticket)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete ticket
                  </DropdownMenuItem>
                </>
              )}
              {!admin && isCreator && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(ticket)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit ticket
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-rose-50 focus:text-destructive"
                    onClick={() => onDelete?.(ticket)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete ticket
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }

  const groups = groupByStatus
    ? STATUS_OPTIONS.map((option) => ({
        ...option,
        meta: STATUS_META[option.value],
        items: tickets.filter((ticket) => ticket.status === option.value),
      })).filter((group) => group.items.length > 0)
    : []

  return (
    <Card className="overflow-hidden">
      <Table
        wrapperProps={{
          role: 'region',
          'aria-label': admin ? 'Support ticket queue' : 'My tickets',
          tabIndex: 0,
        }}
      >
        <caption className="sr-only">
          {admin ? 'Support ticket queue' : 'My tickets'} — click a column heading to sort
        </caption>
        <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className="w-[88px] pl-4">
              Key
            </TableHead>
            <SortableHead label="Summary" field="title" sort={sort} onSortChange={onSortChange} />
            <SortableHead label="Status" field="status" sort={sort} onSortChange={onSortChange} />
            <SortableHead label="Priority" field="priority" sort={sort} onSortChange={onSortChange} />
            <SortableHead label="Category" field="category" sort={sort} onSortChange={onSortChange} />
            <TableHead scope="col" className="w-[160px]">Assignee</TableHead>
            {admin && <TableHead scope="col" className="w-[170px]">Requester</TableHead>}
            <SortableHead label="Updated" field="updated_at" sort={sort} onSortChange={onSortChange} className="w-[100px]" />
            <TableHead scope="col" className="w-[60px] pr-4 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupByStatus ? (
            groups.map((group) => {
              const isCollapsed = collapsed.has(group.value)
              const GroupIcon = group.meta?.icon

              return [
                <TableRow key={`${group.value}-header`} className="hover:bg-muted/30">
                  <TableCell
                    colSpan={columnCount}
                    className="border-b border-t border-border/60 bg-muted/30 px-3 py-1.5"
                  >
                    <button
                      type="button"
                      aria-expanded={!isCollapsed}
                      onClick={() => toggleGroup(group.value)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs font-semibold text-foreground hover:text-primary"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      )}
                      {GroupIcon && (
                        <GroupIcon
                          aria-hidden="true"
                          className={cn('h-3.5 w-3.5', group.iconClass)}
                        />
                      )}
                      <span>{group.label}</span>
                      <Badge
                        variant="secondary"
                        className="rounded-full px-1.5 py-0 text-[10px] font-semibold"
                        aria-label={`${group.items.length} ${group.items.length === 1 ? 'ticket' : 'tickets'}`}
                      >
                        {group.items.length} {group.items.length === 1 ? 'ticket' : 'tickets'}
                      </Badge>
                    </button>
                  </TableCell>
                </TableRow>,
                ...(isCollapsed ? [] : group.items.map(renderRow)),
              ]
            })
          ) : (
            tickets.map(renderRow)
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
