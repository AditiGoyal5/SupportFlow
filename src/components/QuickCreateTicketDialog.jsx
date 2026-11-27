import { useEffect, useState } from 'react'
import { ArrowUpRight, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import { CATEGORY_OPTIONS, PRIORITY_DETAILS, validateTicketForm } from '../lib/tickets.js'
import { PRIORITY_META } from './PriorityBadge.jsx'
import { Button } from './ui/button.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.jsx'
import { Input } from './ui/input.jsx'
import { Label } from './ui/label.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.jsx'
import { Textarea } from './ui/textarea.jsx'
import { cn } from '../lib/utils.js'

const INITIAL_VALUES = { title: '', description: '', category: '', priority: 'medium' }

export default function QuickCreateTicketDialog({ open, onOpenChange, onCreated }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(INITIAL_VALUES)
    setErrors({})
    setFormError('')
  }, [open])

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTicketForm(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setFormError('')
    try {
      const { data } = await api.post('/tickets', {
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        priority: values.priority,
      })
      onCreated?.(data.ticket)
      onOpenChange(false)
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not create this ticket. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create ticket</DialogTitle>
          <DialogDescription>
            Capture the essentials now — you can refine the details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="quick-ticket-title">Summary</Label>
            <Input
              id="quick-ticket-title"
              autoFocus
              maxLength={200}
              placeholder="What do you need help with?"
              value={values.title}
              onChange={(event) => updateField('title', event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'quick-title-error' : undefined}
              className={cn(
                'placeholder:text-xs',
                errors.title && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            {errors.title && (
              <p id="quick-title-error" className="text-xs text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quick-ticket-category">Category</Label>
              <Select
                value={values.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger
                  id="quick-ticket-category"
                  aria-invalid={Boolean(errors.category)}
                  className={cn(
                   '[&>span]:text-xs text-xs',
                   errors.category && 'border-destructive',
                  )}
                >
                  <SelectValue placeholder="Select a category" />
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

            <fieldset className="space-y-1.5">
              <legend className="text-xs font-semibold text-foreground">Priority</legend>
              <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-muted/40 p-1">
                {PRIORITY_DETAILS.map((priority) => {
                  const selected = values.priority === priority.value
                  const Icon = PRIORITY_META[priority.value]?.icon
                  return (
                    <label
                      key={priority.value}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[11px] font-semibold transition-colors',
                        selected
                          ? 'bg-background text-foreground shadow-xs ring-1 ring-border'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      title={priority.description}
                    >
                      <input
                        type="radio"
                        name="quick-priority"
                        value={priority.value}
                        checked={selected}
                        onChange={() => updateField('priority', priority.value)}
                        className="sr-only"
                      />
                      {Icon && (
                        <Icon
                          aria-hidden="true"
                          className={cn('h-3.5 w-3.5', PRIORITY_META[priority.value]?.iconClass)}
                        />
                      )}
                      {priority.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-ticket-description">Description</Label>
            <Textarea
              id="quick-ticket-description"
              rows={4}
              maxLength={10000}
              placeholder="Add a few details so the team can help..."
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              aria-invalid={Boolean(errors.description)}
              className={cn(
                'min-h-24 resize-y placeholder:text-xs',
                errors.description && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button asChild type="button" variant="ghost" size="sm" className="mr-auto">
              <Link to="/app/tickets/new" onClick={() => onOpenChange(false)}>
                Full form
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Creating…' : 'Create ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
