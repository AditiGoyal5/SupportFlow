import { Columns3, LayoutList, RotateCcw, Search } from 'lucide-react'
import { CATEGORY_OPTIONS, SORT_OPTIONS } from '../lib/tickets.js'
import { PRIORITY_OPTIONS } from './PriorityBadge.jsx'
import { STATUS_META, STATUS_OPTIONS } from './StatusBadge.jsx'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'
import { Input } from './ui/input.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.jsx'
import { cn } from '../lib/utils.js'

function ViewToggle({ view, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5" role="group" aria-label="Ticket view">
      <Button
        type="button"
        size="sm"
        variant={view === 'list' ? 'default' : 'ghost'}
        className={cn(
          'h-7 gap-1.5 rounded-md px-2.5 text-xs',
          view !== 'list' && 'text-muted-foreground',
        )}
        onClick={() => onChange('list')}
      >
        <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
        List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={view === 'board' ? 'default' : 'ghost'}
        className={cn(
          'h-7 gap-1.5 rounded-md px-2.5 text-xs',
          view !== 'board' && 'text-muted-foreground',
        )}
        onClick={() => onChange('board')}
      >
        <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
        Board
      </Button>
    </div>
  )
}

export default function TicketQueryBar({ query, children }) {
  function handleSubmit(event) {
    event.preventDefault()
    query.setSearch(query.searchDraft.trim())
  }

  return (
    <Card className="space-y-3 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by status">
          <button
            type="button"
            onClick={() => query.setFilter('status', '')}
            className={cn(
              'inline-flex h-7 cursor-pointer items-center rounded-md px-2.5 text-xs font-medium transition-colors',
              query.status === ''
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            All
          </button>
          {STATUS_OPTIONS.map((option) => {
            const meta = STATUS_META[option.value]
            const active = query.status === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => query.setFilter('status', option.value)}
                className={cn(
                  'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    active ? 'bg-white' : meta?.dotClass,
                  )}
                />
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {query.hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={query.clearFilters}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </Button>
          )}
          <ViewToggle view={query.view} onChange={query.setView} />
          {children}
        </div>
      </div>

      <form
        role="search"
        onSubmit={handleSubmit}
        className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_150px_150px_180px_auto]"
      >
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search tickets"
            placeholder="Search by key, title, or description..."
            value={query.searchDraft}
            onChange={(event) => query.setSearchDraft(event.target.value)}
            className="h-8 pl-8.5 text-xs"
          />
        </div>

        <Select
          value={query.priority || 'all'}
          onValueChange={(value) => query.setFilter('priority', value === 'all' ? '' : value)}
        >
          <SelectTrigger aria-label="Filter by priority" className="h-8 text-xs">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.category || 'all'}
          onValueChange={(value) => query.setFilter('category', value === 'all' ? '' : value)}
        >
          <SelectTrigger aria-label="Filter by category" className="h-8 text-xs">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${query.sortBy}:${query.sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split(':')
            query.setSort(field, order)
          }}
        >
          <SelectTrigger aria-label="Sort tickets by" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" variant="secondary" size="sm" className="h-8">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Search
        </Button>
      </form>
    </Card>
  )
}
