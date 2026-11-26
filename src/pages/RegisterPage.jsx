import { ArrowRight, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthError from '../components/AuthError.jsx'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiErrorMessage } from '../lib/api-error.js'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/app', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create your account. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <UserRound size={22} strokeWidth={1.9} />
        </span>
        <p className="text-sm font-semibold text-indigo-600">Get started</p>
        <h2 className="mt-1.5 text-[32px] font-semibold tracking-[-0.05em] text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Join your support workspace in just a moment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError>{error}</AuthError>
        <FormField
          id="name"
          name="name"
          label="Full name"
          type="text"
          leadingIcon={UserRound}
          autoComplete="name"
          placeholder="Alex Morgan"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={1}
          maxLength={100}
        />
        <FormField
          id="email"
          name="email"
          label="Email address"
          type="email"
          leadingIcon={Mail}
          autoComplete="email"
          autoCapitalize="none"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={255}
        />
        <PasswordField
          id="password"
          name="password"
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          hint="Use at least 8 characters."
        />
        <p className="text-xs leading-5 text-slate-500">
          New accounts are created with the standard user role.
        </p>
        <PrimaryButton type="submit" loading={submitting} className="mt-1">
          Create account <ArrowRight size={17} />
        </PrimaryButton>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
