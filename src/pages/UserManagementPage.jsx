import { useCallback, useEffect, useState } from 'react'
import { Plus, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ErrorState from '../components/ErrorState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyUserId, setBusyUserId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [savingUser, setSavingUser] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not load users.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function updateRole(user, role) {
    setBusyUserId(user.id)
    try {
      const { data } = await api.patch(`/admin/users/${user.id}/role`, { role })
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? data.user : item)),
      )
      toast.success(role === 'admin' ? 'User promoted to admin.' : 'Admin changed to user.')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Could not update the user role.'))
    } finally {
      setBusyUserId('')
    }
  }

  async function createUser(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newUser = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      password: formData.get('password'),
      role: formData.get('role'),
    }

    setSavingUser(true)
    setCreateError('')
    try {
      const { data } = await api.post('/users', newUser)
      setUsers((current) => [data.user, ...current])
      setCreating(false)
      toast.success('User created.')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Could not create the user.')
      setCreateError(message)
      toast.error(message)
    } finally {
      setSavingUser(false)
    }
  }

  async function deleteUser(user) {
    const confirmed = window.confirm(
      `Delete ${user.name}'s account? Their tickets and related records will also be deleted.`,
    )
    if (!confirmed) return

    setBusyUserId(user.id)
    try {
      await api.delete(`/users/${user.id}`)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      toast.success('User deleted.')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Could not delete the user.'))
    } finally {
      setBusyUserId('')
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Administration"
        title="User management"
        description="Review workspace accounts and manage administrator access."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700">
              <Users size={15} />
              {users.length} users
            </span>
            <button
              type="button"
              onClick={() => {
                setCreateError('')
                setCreating(true)
              }}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={15} />
              Add user
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner label="Loading users" />
      ) : error ? (
        <ErrorState title="Users unavailable" message={error} onRetry={loadUsers} />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' && <ShieldCheck size={13} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {user.id === currentUser.id ? (
                        <span className="text-xs font-medium text-slate-400">Current account</span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busyUserId === user.id}
                            onClick={() => updateRole(user, user.role === 'admin' ? 'user' : 'admin')}
                            className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busyUserId === user.id
                              ? 'Updating...'
                              : user.role === 'admin'
                                ? 'Make user'
                                : 'Make admin'}
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${user.name}`}
                            title={`Delete ${user.name}`}
                            disabled={busyUserId === user.id}
                            onClick={() => deleteUser(user)}
                            className="grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {creating && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingUser) setCreating(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-heading"
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/15"
          >
            <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="create-user-heading" className="text-base font-semibold text-slate-900">
                  Add user
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create an account and choose its workspace role.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close add user"
                disabled={savingUser}
                onClick={() => setCreating(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </header>
            <form onSubmit={createUser} className="space-y-4 p-5 sm:p-6">
              {createError && (
                <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                  {createError}
                </p>
              )}
              <label className="block text-xs font-semibold text-slate-700">
                Full name
                <input
                  name="name"
                  type="text"
                  required
                  minLength={1}
                  maxLength={100}
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Temporary password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Must be at least 8 characters. Passwords are limited to 72 bytes.
                </span>
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Role
                <select
                  name="role"
                  defaultValue="user"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={savingUser}
                  onClick={() => setCreating(false)}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUser ? 'Creating...' : 'Create user'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
