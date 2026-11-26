import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import { formatTicketKey } from '../lib/utils.js'
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
import { Textarea } from './ui/textarea.jsx'

export default function EditTicketDialog({ ticket, onClose, onSaved }) {
  const [values, setValues] = useState({
    title: ticket.title,
    description: ticket.description,
    category: ticket.category || 'general',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const body = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
    }

    if (!body.title || !body.description || !body.category) {
      setError('Title, description, and category are required.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const { data } = await api.patch(`/tickets/${ticket.id}`, body)
      toast.success('Ticket updated.')
      onSaved(data.ticket)
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Could not update this ticket.')
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
              {formatTicketKey(ticket.id)}
            </span>
            <DialogTitle>Edit ticket</DialogTitle>
          </div>
          <DialogDescription>
            Update the summary, category, or description. Status and priority are managed by support.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-ticket-title">Summary</Label>
            <Input
              id="edit-ticket-title"
              name="title"
              required
              maxLength={200}
              value={values.title}
              onChange={updateField}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-ticket-category">Category</Label>
            <Input
              id="edit-ticket-category"
              name="category"
              required
              maxLength={50}
              value={values.category}
              onChange={updateField}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-ticket-description">Description</Label>
            <Textarea
              id="edit-ticket-description"
              name="description"
              required
              maxLength={10_000}
              rows={5}
              value={values.description}
              onChange={updateField}
              className="resize-y leading-6"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
