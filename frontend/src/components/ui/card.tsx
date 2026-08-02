import { cn } from '../../lib/utils'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean
}

export function Card({ className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--color-shadow-soft)]',
        className,
      )}
      {...props}
    />
  )
}
