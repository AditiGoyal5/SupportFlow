export default function FormField({
  id,
  label,
  leadingIcon: Icon,
  trailing,
  error,
  hint,
  className = '',
  ...inputProps
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
            strokeWidth={1.8}
          />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`h-12 w-full rounded-xl border bg-white text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${trailing ? 'pr-12' : 'pr-4'} ${
            error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'
          }`}
          {...inputProps}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-3 flex items-center">{trailing}</span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
}
