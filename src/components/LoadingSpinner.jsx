export default function LoadingSpinner({ label = 'Loading', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600"
      />
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  )
}
