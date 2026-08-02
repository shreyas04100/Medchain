import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type ProtectedRouteProps = {
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles = [] }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Authenticating…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !user?.roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
