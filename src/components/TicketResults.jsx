import { TicketPlus } from 'lucide-react'
import EmptyState from './EmptyState.jsx'
import ErrorState from './ErrorState.jsx'
import TicketBoard from './TicketBoard.jsx'
import TicketList from './TicketList.jsx'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'
import { Skeleton } from './ui/skeleton.jsx'

export default function TicketResults({
  query,
  admin = false,
  currentUserId,
  onCreate,
  onEdit,
  onRequestDelete,
  emptyTitle,
  emptyDescription,
}) {
  const pageSize = query.view === 'board' ? 50 : 10

  if (query.error) {
    return (
      <ErrorState
        title="Tickets could not be loaded"
        message={query.error}
        onRetry={query.reload}
      />
    )
  }

  if (query.loading) {
    return (
      <Card className="space-y-3 p-4" role="status" aria-label="Loading tickets">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </Card>
    )
  }

  if (query.tickets.length === 0) {
    return (
      <EmptyState
        title={query.hasFilters ? 'No matching tickets' : emptyTitle}
        description={query.hasFilters ? 'Try changing your search or filters.' : emptyDescription}
        action={
          query.hasFilters ? (
            <Button type="button" variant="outline" size="sm" onClick={query.clearFilters}>
              Clear filters
            </Button>
          ) : !admin ? (
            <Button type="button" size="sm" onClick={onCreate}>
              <TicketPlus className="h-4 w-4" aria-hidden="true" />
              Create ticket
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (query.view === 'board') {
    return (
      <div className="space-y-3">
        {query.pagination.total > query.tickets.length && (
          <p className="text-xs text-muted-foreground">
            Showing the first {query.tickets.length} of {query.pagination.total} tickets. Switch to
            list view to page through the rest.
          </p>
        )}
        <TicketBoard
          tickets={query.tickets}
          admin={admin}
          currentUserId={currentUserId}
          busyIds={query.busyIds}
          onEdit={onEdit}
          onDelete={onRequestDelete}
          onStatusChange={(ticket, value) => query.updateField(ticket, 'status', value)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <TicketList
        tickets={query.tickets}
        admin={admin}
        currentUserId={currentUserId}
        busyIds={query.busyIds}
        sort={{ by: query.sortBy, order: query.sortOrder }}
        onSortChange={query.toggleSort}
        onEdit={onEdit}
        onDelete={onRequestDelete}
        onStatusChange={(ticket, value) => query.updateField(ticket, 'status', value)}
        onPriorityChange={(ticket, value) => query.updateField(ticket, 'priority', value)}
      />

      <footer className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {query.pagination.total === 0 ? 0 : (query.page - 1) * pageSize + 1}
          {'–'}
          {Math.min(query.page * pageSize, query.pagination.total)} of {query.pagination.total}{' '}
          tickets
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.page <= 1 || query.loading}
            onClick={() => query.setPage(query.page - 1)}
          >
            Previous
          </Button>
          <span className="min-w-20 text-center text-xs text-muted-foreground">
            Page {query.page} of {query.pagination.totalPages || 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.page >= query.pagination.totalPages || query.loading}
            onClick={() => query.setPage(query.page + 1)}
          >
            Next
          </Button>
        </div>
      </footer>
    </div>
  )
}
