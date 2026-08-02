import { Button } from './button'
import { Modal } from './modal'

type ConfirmationDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
}

export function ConfirmationDialog({ open, onClose, onConfirm, title, description }: ConfirmationDialogProps) {
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
          <Button variant="danger" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}
