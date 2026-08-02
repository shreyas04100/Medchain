import { cn } from '../../lib/utils'

type TableProps = React.TableHTMLAttributes<HTMLTableElement>

export function Table({ className, ...props }: TableProps) {
  return <table className={cn('min-w-full border-collapse text-left text-sm', className)} {...props} />
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-[color:var(--color-border)]', className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-[color:var(--color-border)]', className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('bg-[color:var(--color-surface)]', className)} {...props} />
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-[color:var(--color-text)]', className)} {...props} />
}

export function TableHeaderCell({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]', className)} {...props} />
}
