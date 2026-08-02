import { Moon, Sun } from 'lucide-react'
import { Button } from '../ui/button'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">MedChain</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Healthcare command center</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">{user.firstName}</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/change-password')}>
              Change
              </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
            </div>
          ) : null}

          <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </div>
    </header>
  )
}
