import { cn } from '../../lib/utils'

type TimelineItemProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  description?: string
  active?: boolean
}

export function TimelineItem({ title, description, active = false, className, ...props }: TimelineItemProps) {
  return (
    <div className={cn('flex gap-3', className)} {...props}>
      <div className={cn('mt-1 h-3 w-3 rounded-full', active ? 'bg-[color:var(--color-primary)]' : 'bg-[color:var(--color-border)]')} />
      <div>
        <p className="font-medium text-[color:var(--color-text)]">{title}</p>
        {description ? <p className="text-sm text-[color:var(--color-text-muted)]">{description}</p> : null}
      </div>
    </div>
  )
}
