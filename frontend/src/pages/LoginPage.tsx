import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthFormCard } from '../components/auth/AuthFormCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Toast } from '../components/ui/toast'
import { useAuth } from '../contexts/AuthContext'
import { loginUser, setAuthToken } from '../services/auth'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setToast(null)
    try {
      const response = await loginUser(values)
      setAuthToken(response.accessToken)
      login({
        id: 0,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        roles: response.roles,
      })
      setToast({ title: 'Welcome back', description: 'Your session is ready.', tone: 'success' })
      const role = response.roles[0] ?? 'PATIENT'
      if (role === 'ADMIN') navigate('/admin-dashboard')
      else if (role === 'DOCTOR') navigate('/doctor-dashboard')
      else navigate('/patient-dashboard')
    } catch {
      setToast({ title: 'Login failed', description: 'Check your credentials and try again.', tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2 py-6">
      <AuthFormCard title="Welcome back" subtitle="Access your secure MedChain workspace">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" placeholder="Email address" {...register('email')} />
            {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10 pr-10" placeholder="Password" type={showPassword ? 'text' : 'password'} {...register('password')} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password.message}</p> : null}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Button type="submit" fullWidth className="h-11" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </motion.div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-semibold text-[color:var(--color-primary)]">
              Forgot password?
            </Link>
            <span className="text-slate-500 dark:text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-semibold text-[color:var(--color-primary)]">
                Create an account
              </Link>
            </span>
          </div>
        </form>
      </AuthFormCard>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      ) : null}
    </div>
  )
}
