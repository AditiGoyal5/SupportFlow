import { CircleAlert } from 'lucide-react'

export default function AuthError({ children }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
    >
      <CircleAlert aria-hidden="true" size={17} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
