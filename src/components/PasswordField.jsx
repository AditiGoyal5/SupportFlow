import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { useState } from 'react'
import FormField from './FormField.jsx'

export default function PasswordField({ id = 'password', label = 'Password', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      leadingIcon={KeyRound}
      autoComplete="current-password"
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
      {...props}
    />
  )
}
