export const designTokens = {
  colors: {
    primary: 'var(--color-primary)',
    primaryStrong: 'var(--color-primary-strong)',
    primarySoft: 'var(--color-primary-soft)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    surface: 'var(--color-surface)',
    surfaceElevated: 'var(--color-surface-elevated)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
  },
  spacing: {
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  shadows: {
    soft: 'var(--color-shadow-soft)',
    medium: 'var(--color-shadow-medium)',
    large: 'var(--color-shadow-large)',
  },
  durations: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  },
}

export const typographyScale = {
  display: 'text-4xl font-semibold tracking-tight sm:text-5xl',
  heading: 'text-2xl font-semibold tracking-tight',
  subheading: 'text-lg font-medium',
  body: 'text-sm leading-6 text-[color:var(--color-text-muted)]',
  caption: 'text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]',
  label: 'text-sm font-medium',
  code: 'rounded-md bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800',
}
