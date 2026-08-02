import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCurrentUser, getStoredUser, persistUser, setAuthToken, type UserProfile } from '../services/auth'

type AuthContextValue = {
  user: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
  login: (user: UserProfile) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('medchain-token')
    if (!token) {
      setLoading(false)
      return
    }

    fetchCurrentUser()
      .then((profile) => {
        setUser(profile)
        persistUser(profile)
      })
      .catch(() => {
        setAuthToken(null)
        persistUser(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (nextUser: UserProfile) => {
    setUser(nextUser)
    persistUser(nextUser)
  }

  const logout = () => {
    setAuthToken(null)
    persistUser(null)
    setUser(null)
    navigate('/login')
  }

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), loading, login, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
