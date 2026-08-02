import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, Stethoscope, ShieldCheck, Home, LogIn, UserPlus, Lock, Brain, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { fetchActiveAlerts } from '../../services/ml'

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { user, isAuthenticated } = useAuth()
  const { data: alerts = [] } = useQuery({ queryKey: ['sidebar-alerts'], queryFn: fetchActiveAlerts })
  const hasActiveAlerts = alerts.some((alert) => !alert.resolved)

  const publicLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/login', label: 'Login', icon: LogIn },
    { to: '/register', label: 'Register', icon: UserPlus },
  ]

  const authCommonLinks = [{ to: '/medical-vault', label: 'Medical Vault', icon: Lock }]

  const roleLinks = [] as { to: string; label: string; icon: any }[]
  if (isAuthenticated && user) {
    if ((user.roles ?? []).includes('PATIENT')) roleLinks.push({ to: '/patient-dashboard', label: 'Patient Dashboard', icon: LayoutDashboard })
    if ((user.roles ?? []).includes('DOCTOR')) roleLinks.push({ to: '/doctor-dashboard', label: 'Doctor Dashboard', icon: Stethoscope })
    if ((user.roles ?? []).includes('ADMIN')) roleLinks.push({ to: '/admin-dashboard', label: 'Admin Dashboard', icon: ShieldCheck })
  }

  const links = isAuthenticated ? [{ to: '/', label: 'Home', icon: Home }, ...authCommonLinks, ...roleLinks, { to: '/sentinel', label: 'Sentinel AI', icon: Brain }] : publicLinks

  return (
    <aside className={`fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-800 bg-slate-950 p-6 text-slate-100 transition-transform duration-300 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="mb-8 flex items-center gap-2">
        <div className="rounded-xl bg-violet-500/20 p-2 text-violet-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold">MedChain</p>
          <p className="text-xs text-slate-500">Secure Healthcare</p>
        </div>
        <button type="button" aria-label="Close navigation menu" className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 md:hidden" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const showAlert = to === '/sentinel' && hasActiveAlerts
          return (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => onClose?.()} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {showAlert ? <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red-500" /> : null}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
