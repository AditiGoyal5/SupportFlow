import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthError from '../components/AuthError.jsx'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiErrorMessage } from '../lib/api-error.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate('/app', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not sign in. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LockKeyhole size={22} strokeWidth={1.9} />
        </span>
        <p className="text-sm font-semibold text-indigo-600">Welcome back</p>
        <h2 className="mt-1.5 text-[32px] font-semibold tracking-[-0.05em] text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your details to continue to your support workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthError>{error}</AuthError>
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
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
        />
        <PrimaryButton type="submit" loading={submitting} className="mt-2">
          Sign in <ArrowRight size={17} />
        </PrimaryButton>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        New to SupportFlow?{' '}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <LockKeyhole size={13} />
        Your account is protected with secure sign-in.
      </p>
    </AuthLayout>
  )
}
