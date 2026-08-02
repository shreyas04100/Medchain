import { Card } from './card'

type StatCardProps = {
  label: string
  value: string
  hint?: string
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-medium text-[color:var(--color-text-muted)]">{label}</p>
      <p className="text-2xl font-semibold text-[color:var(--color-text)]">{value}</p>
      {hint ? <p className="text-xs text-[color:var(--color-text-muted)]">{hint}</p> : null}
    </Card>
  )
}
