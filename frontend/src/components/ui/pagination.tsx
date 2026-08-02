import { Button } from './button'

type PaginationProps = {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm">
        Previous
      </Button>
      <span className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] px-3 py-2 text-sm text-[color:var(--color-text)]">
        {currentPage} / {totalPages}
      </span>
      <Button variant="secondary" size="sm">
        Next
      </Button>
    </div>
  )
}
