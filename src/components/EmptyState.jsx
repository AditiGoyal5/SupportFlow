import { Inbox } from 'lucide-react'
import { Card } from './ui/card.jsx'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <Card className="border-dashed px-6 py-12 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  )
}
