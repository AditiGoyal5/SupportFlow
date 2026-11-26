import { Bell, LogOut, Menu, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { Avatar, AvatarFallback } from './ui/avatar.jsx'
import { Button } from './ui/button.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx'
import { Input } from './ui/input.jsx'

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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">
          {title}
        </h2>
      </div>

      <form onSubmit={handleSearch} className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search tickets"
          placeholder="Search tickets..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-9 bg-muted/50 pl-8.5"
        />
      </form>

      <div className="flex shrink-0 items-center gap-2">
        {user.role !== 'admin' && (
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/app/tickets/new">
              <Plus className="h-3.5 w-3.5" />
              New ticket
            </Link>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-muted-foreground"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-9 gap-2.5 rounded-full px-1.5 sm:rounded-lg sm:px-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[11px]">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden max-w-[140px] text-left sm:block">
                <p className="truncate text-xs font-semibold leading-none text-foreground">
                  {user.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] capitalize leading-none text-muted-foreground">
                  {user.role}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-[11px] font-normal text-muted-foreground">
                {user.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:bg-rose-50 focus:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
