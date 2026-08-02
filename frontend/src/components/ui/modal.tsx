import { cn } from '../../lib/utils'

type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
  open: boolean
  onClose: () => void
}

export function Modal({ open, onClose, className, children, ...props }: ModalProps) {
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={onClose}>
      <div
        className={cn('w-full max-w-lg rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--color-shadow-large)]', className)}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  ) : null
}
