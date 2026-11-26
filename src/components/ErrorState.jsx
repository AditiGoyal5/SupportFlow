import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this information. Please try again.',
  onRetry,
}) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-rose-200 bg-white px-5 py-8 text-center shadow-sm shadow-rose-100/50"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle size={22} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-lg text-sm leading-6 text-slate-500">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </section>
  )
}
