import { Search } from 'lucide-react'
import { Input } from './input'

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function SearchInput(props: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
      <Input className="pl-9" {...props} />
    </div>
  )
}
