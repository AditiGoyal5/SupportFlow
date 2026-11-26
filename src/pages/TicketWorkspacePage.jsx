import { useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EditTicketDialog from '../components/EditTicketDialog.jsx'
import PageHeader from '../components/PageHeader.jsx'
import QuickCreateTicketDialog from '../components/QuickCreateTicketDialog.jsx'
import TicketQueryBar from '../components/TicketQueryBar.jsx'
import TicketResults from '../components/TicketResults.jsx'
import { Button } from '../components/ui/button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useTicketQuery from '../hooks/useTicketQuery.js'
import { formatTicketKey } from '../lib/utils.js'

export default function TicketWorkspacePage() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const query = useTicketQuery({ admin: isAdmin })
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={isAdmin ? 'Team operations' : 'Workspace'}
        title={isAdmin ? 'Ticket Queue' : 'My Tickets'}
        description={
          isAdmin
            ? 'Triage, prioritize, and resolve support issues across your workspace.'
            : 'Track your support requests, switch between list and board views, and follow updates.'
        }
        action={
          <Button type="button" size="sm" onClick={() => setQuickCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New ticket
          </Button>
        }
      />

      <TicketQueryBar query={query} />

      <TicketResults
        query={query}
        admin={isAdmin}
        onCreate={() => setQuickCreateOpen(true)}
        onEdit={setEditingTicket}
        onRequestDelete={setDeleteTarget}
        emptyTitle={isAdmin ? 'No tickets in the queue' : 'No tickets yet'}
        emptyDescription={
          isAdmin
            ? 'Tickets will appear here when someone submits a request.'
            : 'Create a ticket to start tracking your support request.'
        }
      />

      {editingTicket && (
        <EditTicketDialog
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSaved={() => {
            setEditingTicket(null)
            query.reload()
          }}
        />
      )}

      <QuickCreateTicketDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onCreated={() => {
          toast.success('Ticket created.')
          query.reload()
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this ticket?"
        description={
          deleteTarget
            ? `${formatTicketKey(deleteTarget.id)} — ${deleteTarget.title} will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete ticket"
        busy={deleteTarget ? query.busyIds.has(deleteTarget.id) : false}
        onConfirm={async () => {
          await query.removeTicket(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
