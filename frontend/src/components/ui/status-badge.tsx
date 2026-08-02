import { Badge } from './badge'

type StatusBadgeProps = {
  status: 'Active' | 'Review' | 'Paused' | 'Archived'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    Active: 'success' as const,
    Review: 'warning' as const,
    Paused: 'accent' as const,
    Archived: 'danger' as const,
  }

  return <Badge variant={map[status]}>{status}</Badge>
}
