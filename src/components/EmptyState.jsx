import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) {
  return (
    <section className="grid min-h-[320px] place-items-center rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm shadow-slate-200/40 sm:min-h-[360px]">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon size={25} strokeWidth={1.8} />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </section>
  )
}
