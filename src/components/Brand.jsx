import { LifeBuoy } from 'lucide-react'

export default function Brand({ light = false, compact = false }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          light
            ? 'bg-white/12 text-white ring-1 ring-white/15'
            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/70'
        }`}
      >
        <LifeBuoy size={21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span
          className={`text-[19px] font-bold tracking-[-0.04em] ${
            light ? 'text-white' : 'text-slate-900'
          }`}
        >
          Support<span className={light ? 'text-indigo-200' : 'text-indigo-600'}>Flow</span>
        </span>
      )}
    </div>
  )
}
