import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

type AuthFormCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthFormCard({ title, subtitle, children }: AuthFormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-xl rounded-[2rem] border border-white/50 bg-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70"
    >
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--color-primary)]">Secure access</p>
        <h2 className="mt-2 text-3xl font-semibold text-[color:var(--color-text)]">{title}</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  )
}
