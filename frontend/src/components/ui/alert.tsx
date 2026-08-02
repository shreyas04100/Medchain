import { cn } from '../../lib/utils'

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'info' | 'success' | 'warning' | 'danger'
}

const variants = {
  info: 'border-[color:var(--color-primary-soft)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-strong)]',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
}

export function Alert({ className, variant = 'info', ...props }: AlertProps) {
  return <div className={cn('rounded-[var(--radius-lg)] border p-4 text-sm', variants[variant], className)} {...props} />
}
