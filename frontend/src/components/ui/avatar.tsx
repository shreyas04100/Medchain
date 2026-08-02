import { cn } from '../../lib/utils'

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

export function Avatar({ src, fallback, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div className={cn('flex items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] font-semibold text-[color:var(--color-text)]', sizeClasses[size], className)} {...props}>
      {src ? <img src={src} alt={fallback} className="h-full w-full object-cover" /> : fallback}
    </div>
  )
}
