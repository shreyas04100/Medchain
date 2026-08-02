type EmptyStateProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-8 py-12 text-center">
      <h3 className="text-lg font-semibold text-[color:var(--color-text)]">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-[color:var(--color-text-muted)]">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
