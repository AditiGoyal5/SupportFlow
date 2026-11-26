import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function AppHeader({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('You have been signed out.')
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            SupportFlow
          </p>
          <h1 className="truncate text-base font-semibold tracking-[-0.02em] text-slate-900 sm:text-lg">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <span className="grid size-10 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {initials(user.name)}
          </span>
          <div className="max-w-[170px]">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
          </div>
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 sm:hidden">
          {initials(user.name)}
        </span>
        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
