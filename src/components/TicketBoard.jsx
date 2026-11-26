import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatFullDate, formatRelativeDate, getInitials } from '../lib/tickets.js'
import PriorityBadge from './PriorityBadge.jsx'
import { STATUS_META, STATUS_OPTIONS } from './StatusBadge.jsx'
import { Avatar, AvatarFallback } from './ui/avatar.jsx'
import { Badge } from './ui/badge.jsx'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx'
import { cn, formatTicketKey } from '../lib/utils.js'

export default function TicketBoard({
  tickets,
  admin = false,
  busyIds,
  busyTicketId = '',
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STATUS_OPTIONS.map((column) => {
        const meta = STATUS_META[column.value]
        const Icon = meta.icon
        const columnTickets = tickets.filter((ticket) => ticket.status === column.value)

        return (
          <section
            key={column.value}
            className={cn(
              'flex min-h-[320px] flex-col rounded-xl border border-border border-t-4 bg-muted/40 p-3',
              meta.columnAccent,
            )}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold',
                    meta.headerBg,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {column.label}
                </span>
              </div>
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                {columnTickets.length}
              </Badge>
            </header>

            <div className="flex flex-1 flex-col gap-2.5">
              {columnTickets.length === 0 ? (
                <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border/80 bg-background/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">No {column.label.toLowerCase()} tickets</p>
                </div>
              ) : (
                columnTickets.map((ticket) => {
                  const busy = busyIds?.has(ticket.id) || busyTicketId === ticket.id
                  const requesterName =
                    ticket.creator_name || ticket.creator_email || 'Unknown'

                  return (
                    <Card
                      key={ticket.id}
                      className={cn(
                        'group p-3.5 transition-all hover:border-indigo-300 hover:shadow-sm',
                        busy && 'opacity-60',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={`/app/tickets/${ticket.id}`}
                          className="font-mono text-[11px] font-semibold text-muted-foreground hover:text-primary"
                        >
                          {formatTicketKey(ticket.id)}
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={ticket.priority} showLabel={false} />
                          {(admin || ticket.status === 'open') && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="h-6 w-6"
                                  disabled={busy}
                                  aria-label={`Actions for ${ticket.title}`}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {admin ? (
                                  <>
                                    <DropdownMenuLabel>Move to status</DropdownMenuLabel>
                                    {STATUS_OPTIONS.filter(
                                      (opt) => opt.value !== ticket.status,
                                    ).map((opt) => (
                                      <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => onStatusChange(ticket, opt.value)}
                                      >
                                        <span
                                          className={cn(
                                            'h-2 w-2 rounded-full',
                                            STATUS_META[opt.value]?.dotClass,
                                          )}
                                        />
                                        {opt.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => onEdit(ticket)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit ticket
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:bg-rose-50 focus:text-destructive"
                                      onClick={() => onDelete(ticket)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Delete ticket
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/app/tickets/${ticket.id}`}
                        className="mt-2 block text-sm font-semibold leading-snug text-foreground group-hover:text-primary"
                      >
                        <span className="line-clamp-2">{ticket.title}</span>
                      </Link>

                      {ticket.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {ticket.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                        <Badge
                          variant="secondary"
                          className="max-w-[120px] truncate rounded px-1.5 py-0 text-[10px] font-medium capitalize"
                        >
                          {ticket.category || 'General'}
                        </Badge>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" aria-hidden="true" />
                            <time
                              dateTime={ticket.updated_at}
                              title={formatFullDate(ticket.updated_at)}
                            >
                              {formatRelativeDate(ticket.updated_at)}
                            </time>
                          </span>
                          {admin && (
                            <Avatar className="h-5 w-5" title={requesterName}>
                              <AvatarFallback className="text-[9px]">
                                {getInitials(requesterName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
