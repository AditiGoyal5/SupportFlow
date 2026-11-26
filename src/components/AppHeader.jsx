import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const activeSearch = searchParams.get('search') ?? ''
  const [searchValue, setSearchValue] = useState(activeSearch)

  useEffect(() => {
    setSearchValue(activeSearch)
  }, [activeSearch])

  function handleSearch(event) {
    event.preventDefault()
    const search = searchValue.trim()
    navigate(search ? `/app/tickets?search=${encodeURIComponent(search)}` : '/app/tickets')
  }

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

      <form
        role="search"
        onSubmit={handleSearch}
        className="relative mx-6 hidden w-full max-w-[360px] flex-1 md:block"
      >
        <Search
          aria-hidden="true"
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          aria-label="Search tickets"
          placeholder="Search tickets..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100/70"
        />
      </form>

      <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell size={19} strokeWidth={1.8} />
        </button>
        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
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
