import { useState } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100'

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
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-ticket-heading"
        className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/15"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id="edit-ticket-heading" className="text-base font-semibold text-slate-900">
              Edit ticket
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Status and priority are managed separately.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close edit ticket"
            disabled={saving}
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              {error}
            </p>
          )}
          <label className="block text-xs font-semibold text-slate-700">
            Title
            <input
              name="title"
              required
              maxLength={200}
              value={values.title}
              onChange={updateField}
              className={inputClassName}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Category
            <input
              name="category"
              required
              maxLength={50}
              value={values.category}
              onChange={updateField}
              className={inputClassName}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Description
            <textarea
              name="description"
              required
              maxLength={10_000}
              rows={5}
              value={values.description}
              onChange={updateField}
              className={`${inputClassName} resize-y leading-6`}
            />
          </label>
          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle size={16} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
