import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'
import { sortTickets } from '../lib/tickets.js'

const PAGE_SIZE = 10
const BOARD_LIMIT = 50

const DEFAULTS = {
  search: '',
  status: '',
  priority: '',
  category: '',
  sort: 'updated_at',
  order: 'desc',
  view: 'list',
  page: '1',
}

const SORT_FIELDS = new Set(['updated_at', 'created_at', 'priority', 'title', 'category', 'status'])

export default function useTicketQuery({ admin = false, onMutated } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search')?.trim() ?? ''
  const status = searchParams.get('status') ?? ''
  const priority = searchParams.get('priority') ?? ''
  const category = searchParams.get('category') ?? ''
  const requestedSort = searchParams.get('sort') ?? DEFAULTS.sort
  const sortBy = SORT_FIELDS.has(requestedSort) ? requestedSort : DEFAULTS.sort
  const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
  const view = searchParams.get('view') === 'board' ? 'board' : 'list'
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [searchDraft, setSearchDraft] = useState(search)
  const [tickets, setTickets] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyIds, setBusyIds] = useState(() => new Set())
  const [reloadKey, setReloadKey] = useState(0)

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)

        Object.entries(patch).forEach(([key, value]) => {
          const normalized = value == null ? '' : String(value)
          if (normalized === '' || normalized === DEFAULTS[key]) next.delete(key)
          else next.set(key, normalized)
        })

        if (resetPage) next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    const nextSearch = searchDraft.trim()
    if (nextSearch === search) return undefined

    const timer = window.setTimeout(() => updateParams({ search: nextSearch }), 300)
    return () => window.clearTimeout(timer)
  }, [searchDraft, search, updateParams])

  const limit = view === 'board' ? BOARD_LIMIT : PAGE_SIZE

  useEffect(() => {
    const controller = new AbortController()
    const params = {
      page: view === 'board' ? 1 : page,
      limit,
    }

    if (admin) {
      params.sortBy = sortBy
      params.sortOrder = sortOrder
    }
    if (status) params.status = status
    if (priority) params.priority = priority
    if (category) params.category = category
    if (search) params.search = search

    setLoading(true)
    setError('')

    api
      .get(admin ? '/admin/tickets' : '/tickets', { params, signal: controller.signal })
      .then(({ data }) => {
        setTickets(sortTickets(data.tickets ?? [], sortBy, sortOrder))
        setPagination(
          data.pagination ?? { page: 1, limit, total: 0, totalPages: 0 },
        )
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return
        setError(
          getApiErrorMessage(
            requestError,
            admin ? 'Could not load the ticket queue.' : 'Could not load your tickets.',
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [admin, view, page, limit, sortBy, sortOrder, status, priority, category, search, reloadKey])

  const setBusy = useCallback((id, busy) => {
    setBusyIds((current) => {
      const next = new Set(current)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const updateField = useCallback(
    async (ticket, field, value) => {
      if (ticket[field] === value) return

      const previousValue = ticket[field]
      setBusy(ticket.id, true)
      setTickets((current) =>
        current.map((item) =>
          item.id === ticket.id ? { ...item, [field]: value } : item,
        ),
      )

      try {
        await api.patch(`/admin/tickets/${ticket.id}/${field}`, { [field]: value })
        toast.success(
          field === 'status' ? 'Ticket status updated.' : 'Ticket priority updated.',
        )
        onMutated?.()
      } catch (requestError) {
        setTickets((current) =>
          current.map((item) =>
            item.id === ticket.id ? { ...item, [field]: previousValue } : item,
          ),
        )
        toast.error(
          getApiErrorMessage(
            requestError,
            field === 'status'
              ? 'Could not update ticket status.'
              : 'Could not update ticket priority.',
          ),
        )
      } finally {
        setBusy(ticket.id, false)
      }
    },
    [onMutated, setBusy],
  )

  const removeTicket = useCallback(
    async (ticket) => {
      setBusy(ticket.id, true)
      try {
        await api.delete(`/tickets/${ticket.id}`)
        toast.success('Ticket deleted.')
        setReloadKey((current) => current + 1)
        onMutated?.()
      } catch (requestError) {
        toast.error(getApiErrorMessage(requestError, 'Could not delete this ticket.'))
      } finally {
        setBusy(ticket.id, false)
      }
    },
    [onMutated, setBusy],
  )

  const clearFilters = useCallback(() => {
    setSearchDraft('')
    updateParams({ search: '', status: '', priority: '', category: '' })
  }, [updateParams])

  const toggleSort = useCallback(
    (field) => {
      const nextOrder =
        field === sortBy ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'
      updateParams({ sort: field, order: nextOrder })
    },
    [sortBy, sortOrder, updateParams],
  )

  const setSort = useCallback(
    (field, order) => updateParams({ sort: field, order }),
    [updateParams],
  )

  const setPageNumber = useCallback(
    (nextPage) => updateParams({ page: String(nextPage) }, { resetPage: false }),
    [updateParams],
  )

  const reload = useCallback(() => setReloadKey((current) => current + 1), [])

  const hasFilters = Boolean(search || status || priority || category)
  const endpoint = admin ? '/admin/tickets' : '/tickets'

  return {
    // query state
    search,
    searchDraft,
    status,
    priority,
    category,
    sortBy,
    sortOrder,
    view,
    page,
    hasFilters,
    endpoint,
    // data
    tickets,
    pagination,
    loading,
    error,
    busyIds,
    // actions
    setSearchDraft,
    setSearch: (value) => updateParams({ search: value }),
    setFilter: (key, value) => updateParams({ [key]: value }),
    setView: (value) => updateParams({ view: value }),
    setPage: setPageNumber,
    clearFilters,
    toggleSort,
    setSort,
    reload,
    loadTickets: reload,
    updateField,
    removeTicket,
  }
}
