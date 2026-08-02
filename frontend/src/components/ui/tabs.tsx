import { useState } from 'react'
import { cn } from '../../lib/utils'

type TabsProps = {
  items: string[]
  defaultValue?: string
}

export function Tabs({ items, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? items[0])

  return (
    <div className="flex flex-wrap gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-1">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(
            'rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition',
            active === item ? 'bg-[color:var(--color-primary)] text-white' : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]',
          )}
          onClick={() => setActive(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
