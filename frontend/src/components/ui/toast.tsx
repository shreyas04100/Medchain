import { motion } from 'framer-motion'
import { CheckCircle2, CircleAlert } from 'lucide-react'

type ToastProps = {
  title: string
  description?: string
  tone?: 'success' | 'danger'
}

export function Toast({ title, description, tone = 'success' }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex max-w-sm items-start gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--color-shadow-medium)]"
    >
      {tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-red-500" />}
      <div>
        <p className="font-medium text-[color:var(--color-text)]">{title}</p>
        {description ? <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{description}</p> : null}
      </div>
    </motion.div>
  )
}
