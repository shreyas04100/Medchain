export function Spinner() {
  return (
    <div className="flex items-center justify-center" aria-label="Loading">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--color-primary)] border-t-transparent" />
    </div>
  )
}
