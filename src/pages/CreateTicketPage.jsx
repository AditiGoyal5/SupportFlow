import { useState } from 'react'
import { ChevronRight, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'

const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 10_000

const categories = [
  { value: 'technical', label: 'Technical' },
  { value: 'account', label: 'Account' },
  { value: 'billing', label: 'Billing' },
  { value: 'general', label: 'General' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
]

const priorities = [
  { value: 'low', label: 'Low', description: 'A general question or request' },
  { value: 'medium', label: 'Medium', description: 'Something is not working as expected' },
  { value: 'high', label: 'High', description: 'Work is blocked or significantly affected' },
  { value: 'urgent', label: 'Urgent', description: 'A critical issue needs immediate attention' },
]

const fieldClassName =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/70'

function getFieldError(field, value) {
  if (!value.trim()) return `${field} is required.`
  return ''
}

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState({
    title: '',
    category: '',
    priority: 'medium',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      return { ...current, [field]: '' }
    })
    setFormError('')
  }

  function validate() {
    const nextErrors = {
      title: getFieldError('Ticket title', values.title),
      category: values.category ? '' : 'Choose a category.',
      description: getFieldError('Description', values.description),
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!validate()) return

    setSubmitting(true)
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
      const message = getApiErrorMessage(
        error,
        'We could not create your ticket. Please try again.',
      )
      setFormError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium">
        <Link to="/app" className="text-slate-500 transition hover:text-indigo-600">
          Dashboard
        </Link>
        <ChevronRight size={14} aria-hidden="true" className="text-slate-300" />
        <Link
          to="/app/tickets"
          className="text-slate-500 transition hover:text-indigo-600"
        >
          My Tickets
        </Link>
        <ChevronRight size={14} aria-hidden="true" className="text-slate-300" />
        <span aria-current="page" className="text-slate-800">
          Create Ticket
        </span>
      </nav>

      <PageHeader
        title="Create a Support Ticket"
        description="Describe your issue and our team will help you resolve it."
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
      >
        <div className="space-y-7 p-5 sm:p-8">
          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="ticket-title" className="text-sm font-semibold text-slate-800">
              Ticket Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="ticket-title"
              name="title"
              type="text"
              required
              maxLength={TITLE_MAX_LENGTH}
              autoComplete="off"
              value={values.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Summarize the issue in a few words"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'ticket-title-error ticket-title-count' : 'ticket-title-count'}
              className={`${fieldClassName} ${errors.title ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}`}
            />
            <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3">
              {errors.title ? (
                <p id="ticket-title-error" className="text-xs text-rose-600">
                  {errors.title}
                </p>
              ) : (
                <span />
              )}
              <p id="ticket-title-count" className="shrink-0 text-xs text-slate-400">
                {values.title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="ticket-category" className="text-sm font-semibold text-slate-800">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="ticket-category"
                name="category"
                required
                value={values.category}
                onChange={(event) => updateField('category', event.target.value)}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'ticket-category-error' : undefined}
                className={`${fieldClassName} ${errors.category ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}`}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p id="ticket-category-error" className="mt-1.5 text-xs text-rose-600">
                  {errors.category}
                </p>
              )}
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-slate-800">
                Priority <span className="text-rose-500">*</span>
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {priorities.map((priority) => {
                  const selected = values.priority === priority.value
                  return (
                    <label
                      key={priority.value}
                      className={`flex min-h-[76px] cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition ${
                        selected
                          ? 'border-indigo-300 bg-indigo-50/70 ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={selected}
                        onChange={(event) => updateField('priority', event.target.value)}
                        className="mt-0.5 size-4 accent-indigo-600"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold capitalize text-slate-800">
                          {priority.label}
                        </span>
                        <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                          {priority.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div>
            <label
              htmlFor="ticket-description"
              className="text-sm font-semibold text-slate-800"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <p id="ticket-description-help" className="mt-1 text-xs leading-5 text-slate-500">
              Include what you were trying to do, what happened, and any steps to reproduce it.
            </p>
            <textarea
              id="ticket-description"
              name="description"
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={7}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Add the details our support team needs to understand and resolve your issue..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description
                  ? 'ticket-description-help ticket-description-error ticket-description-count'
                  : 'ticket-description-help ticket-description-count'
              }
              className={`${fieldClassName} min-h-40 resize-y leading-6 ${errors.description ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}`}
            />
            <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3">
              {errors.description ? (
                <p id="ticket-description-error" className="text-xs text-rose-600">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <p id="ticket-description-count" className="shrink-0 text-xs text-slate-400">
                {values.description.length.toLocaleString()}/{DESCRIPTION_MAX_LENGTH.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            to="/app/tickets"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <LoaderCircle size={16} className="animate-spin" />}
            {submitting ? 'Submitting ticket...' : 'Submit ticket'}
          </button>
        </footer>
      </form>
    </div>
  )
}
