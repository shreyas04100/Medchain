import { cn } from '../../lib/utils'

type SectionHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2 border-b border-[color:var(--color-border)] pb-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  )
}
