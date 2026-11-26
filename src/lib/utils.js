import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTicketKey(id) {
  if (id === null || id === undefined) return 'SF-?'
  const raw = String(id).trim()
  if (/^\d+$/.test(raw)) {
    return `SF-${raw}`
  }
  return `SF-${raw.slice(0, 6).toUpperCase()}`
}
