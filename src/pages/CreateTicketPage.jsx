import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronRight, CornerDownLeft, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader.jsx'
import { PRIORITY_META } from '../components/PriorityBadge.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.jsx'
import { Textarea } from '../components/ui/textarea.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import {
  CATEGORY_OPTIONS,
  PRIORITY_DETAILS,
  validateTicketForm,
} from '../lib/tickets.js'
import { cn } from '../lib/utils.js'

const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 10_000
const INITIAL_VALUES = { title: '', category: '', priority: 'medium', description: '' }

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef(null)
  const categoryRef = useRef(null)
  const descriptionRef = useRef(null)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  const submit = useCallback(async () => {
    if (submitting) return

    const nextErrors = validateTicketForm(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      if (nextErrors.title) titleRef.current?.focus()
      else if (nextErrors.category) categoryRef.current?.focus()
      else descriptionRef.current?.focus()
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      const { data } = await api.post('/tickets', {
        title: values.title.trim(),
        category: values.category,
        priority: values.priority,
        description: values.description.trim(),
      })

      if (!data?.ticket?.id) {
        throw new Error('The server did not return the created ticket.')
      }

      toast.success('Your support ticket was created.')
      navigate(`/app/tickets/${data.ticket.id}`)
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'We could not create your ticket. Please try again.'),
      )
    } finally {
      setSubmitting(false)
    }
  }, [navigate, submitting, values])

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        submit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [submit])

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium">
        <Link to="/app" className="text-muted-foreground transition hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight size={14} aria-hidden="true" className="text-border" />
        <Link to="/app/tickets" className="text-muted-foreground transition hover:text-primary">
          Tickets
        </Link>
        <ChevronRight size={14} aria-hidden="true" className="text-border" />
        <span aria-current="page" className="text-foreground">
          Create ticket
        </span>
      </nav>

      <PageHeader
        eyebrow="New issue"
        title="Create a ticket"
        description="Describe the issue once — we'll route it to the right person."
      />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="space-y-6">
              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="ticket-title" className="text-sm">
                    Summary <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {values.title.length}/{TITLE_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="ticket-title"
                  ref={titleRef}
                  autoFocus
                  maxLength={TITLE_MAX_LENGTH}
                  placeholder="A short, specific summary of the issue"
                  value={values.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                  className={cn(
                    'h-10 text-sm placeholder:text-xs',
                    errors.title && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
                {errors.title && (
                  <p id="title-error" className="text-xs text-destructive">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="ticket-description" className="text-sm">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {values.description.length.toLocaleString()}/{DESCRIPTION_MAX_LENGTH.toLocaleString()}
                  </span>
                </div>
                <Textarea
                  id="ticket-description"
                  ref={descriptionRef}
                  rows={6}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  placeholder="What were you trying to do? What happened instead? Include steps to reproduce if you can."
                  value={values.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                  className={cn(
                    'min-h-56 resize-y leading-6 placeholder:text-xs',
                    errors.description && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
                {errors.description ? (
                  <p id="description-error" className="text-xs text-destructive">
                    {errors.description}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <Card className="sticky bottom-4 z-10 flex flex-col gap-3 border-border/80 bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">⌘/Ctrl + Enter</kbd> to create
            </p>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button asChild type="button" variant="outline" size="sm">
                <Link to="/app/tickets">Cancel</Link>
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {submitting ? 'Creating…' : 'Create ticket'}
              </Button>
            </div>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Details</h2>
            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ticket-category">Category</Label>
                <Select
                  value={values.category}
                  onValueChange={(value) => updateField('category', value)}
                >
                  <SelectTrigger
                    id="ticket-category"
                    ref={categoryRef}
                    aria-invalid={Boolean(errors.category)}
                    className={cn(
                      '[&>span]:text-xs text-xs',
                       errors.category && 'border-destructive',
                    )}
                  >
                    <SelectValue className="text-xs" placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category}</p>
                )}
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-foreground">Priority</legend>
                <div className="grid gap-1.5">
                  {PRIORITY_DETAILS.map((priority) => {
                    const selected = values.priority === priority.value
                    const Icon = PRIORITY_META[priority.value]?.icon
                    return (
                      <label
                        key={priority.value}
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors',
                          selected
                            ? 'border-primary bg-indigo-50/70 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50',
                        )}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={selected}
                          onChange={() => updateField('priority', priority.value)}
                          className="sr-only"
                        />
                        {Icon && (
                          <Icon
                            aria-hidden="true"
                            className={cn(
                              'mt-0.5 h-3.5 w-3.5 shrink-0',
                              PRIORITY_META[priority.value]?.iconClass,
                            )}
                          />
                        )}
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-foreground">
                            {priority.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                            {priority.description}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          </Card>

        </aside>
      </form>
    </div>
  )
}
