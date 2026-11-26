import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'

export default function ErrorState({ title, message, onRetry }) {
  return (
    <Card className="border-rose-200 bg-rose-50/40 px-6 py-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-600">
        <AlertTriangle size={20} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      {message && (
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-muted-foreground">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw size={14} />
            Try again
          </Button>
        </div>
      )}
    </Card>
  )
}
