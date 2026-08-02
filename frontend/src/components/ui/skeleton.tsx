import { cn } from '../../lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-[var(--radius-md)] bg-[color:var(--color-surface-elevated)]', className)} {...props} />
}
