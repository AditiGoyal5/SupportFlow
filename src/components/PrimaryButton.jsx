import { LoaderCircle } from 'lucide-react'

export default function PrimaryButton({
  children,
  loading = false,
  className = '',
  disabled = false,
  ...buttonProps
}) {
  return (
    <button
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-65 ${className}`}
      disabled={loading || disabled}
      {...buttonProps}
    >
      {loading && <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />}
      {children}
    </button>
  )
}
