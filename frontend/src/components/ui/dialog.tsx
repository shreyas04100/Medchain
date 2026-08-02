import { Button } from './button'
import { Modal } from './modal'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  actionLabel?: string
}

export function Dialog({ open, onClose, title, description, actionLabel = 'Continue' }: DialogProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--color-text)]">{title}</h3>
          {description ? <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{description}</p> : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button>{actionLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}
