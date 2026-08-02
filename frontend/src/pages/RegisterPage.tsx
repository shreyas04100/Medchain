import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, Check, X, KeyRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthFormCard } from '../components/auth/AuthFormCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Toast } from '../components/ui/toast'
import { requestPatientRegistrationOtp, setAuthToken, verifyPatientRegistration } from '../services/auth'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex, 'Password must include upper, lower and a special character'),
  role: z.literal('PATIENT'),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [loading, setLoading] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [pendingRegistration, setPendingRegistration] = useState<FormValues | null>(null)
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'PATIENT' } })

  const passwordValue = watch('password', '')
  const checks = {
    length: passwordValue.length >= 8,
    lower: /[a-z]/.test(passwordValue),
    upper: /[A-Z]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setToast(null)
    try {
      await requestPatientRegistrationOtp(values)
      setPendingRegistration(values)
      setOtpCode('')
      setStep('verify')
      setToast({ title: 'Verification code sent', description: `We sent a 6-digit confirmation code to ${values.email}.`, tone: 'success' })
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Please try again with different details.'
      setToast({ title: 'Registration failed', description: message, tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const onVerify = async (event: FormEvent) => {
    event.preventDefault()
    if (!pendingRegistration) {
      setToast({ title: 'Verification failed', description: 'Please request a new verification code.', tone: 'danger' })
      return
    }

    if (!otpCode.trim()) {
      setToast({ title: 'Verification failed', description: 'Please enter the confirmation code sent to your email.', tone: 'danger' })
      return
    }

    setLoading(true)
    setToast(null)
    try {
      const response = await verifyPatientRegistration({ ...pendingRegistration, otp: otpCode.trim() })
      setAuthToken(response.accessToken)
      setToast({ title: 'Account created', description: 'You can now access your dashboard.', tone: 'success' })
      const role = response.roles[0] ?? 'PATIENT'
      if (role === 'ADMIN') navigate('/admin-dashboard')
      else if (role === 'DOCTOR') navigate('/doctor-dashboard')
      else navigate('/patient-dashboard')
    } catch (error: any) {
      const message = error?.response?.data?.message || 'The confirmation code is invalid or has expired.'
      setToast({ title: 'Verification failed', description: message, tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (!pendingRegistration) return
    setLoading(true)
    setToast(null)
    try {
      await requestPatientRegistrationOtp(pendingRegistration)
      setOtpCode('')
      setToast({ title: 'Verification code resent', description: `A new code was sent to ${pendingRegistration.email}.`, tone: 'success' })
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to resend verification code.'
      setToast({ title: 'Verification failed', description: message, tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2 py-6">
      <AuthFormCard title={step === 'verify' ? 'Verify your email' : 'Create your account'} subtitle={step === 'verify' ? 'Enter the 6-digit code sent to your email' : 'Join MedChain as a patient'}>
        {step === 'verify' ? (
          <form onSubmit={onVerify} className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-700">We sent a 6-digit code to {pendingRegistration?.email}</p>
              <p className="mt-1">Enter it below to finish creating your patient account.</p>
            </div>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Button type="submit" fullWidth className="h-11" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify and create account'}
              </Button>
            </motion.div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" onClick={() => setStep('form')} className="font-semibold text-[color:var(--color-primary)]">
                Edit details
              </button>
              <button type="button" onClick={resendOtp} className="font-medium text-slate-600" disabled={loading}>
                Resend code
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" placeholder="First name" {...register('firstName')} />
                {errors.firstName ? <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p> : null}
              </div>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" placeholder="Last name" {...register('lastName')} />
                {errors.lastName ? <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p> : null}
              </div>
            </div>

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

            <div className="space-y-1 px-2">
              <p className="text-sm font-medium">Password must contain:</p>
              <ul className="mt-1 grid grid-cols-2 gap-2">
                <li className={`flex items-center gap-2 text-sm ${checks.length ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {checks.length ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} 8+ characters
                </li>
                <li className={`flex items-center gap-2 text-sm ${checks.upper ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {checks.upper ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} 1 uppercase
                </li>
                <li className={`flex items-center gap-2 text-sm ${checks.lower ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {checks.lower ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} 1 lowercase
                </li>
                <li className={`flex items-center gap-2 text-sm ${checks.special ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {checks.special ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} 1 special character
                </li>
              </ul>
            </div>

            {/* Role is fixed to PATIENT. Doctors and Admins must be created by an Admin. */}
            <input type="hidden" value="PATIENT" {...register('role')} />
            <p className="text-xs text-slate-500">Registering as a Patient. To create Doctor or Admin accounts, contact an Administrator.</p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Button type="submit" fullWidth className="h-11" disabled={loading}>
                {loading ? 'Sending code…' : 'Send verification code'}
              </Button>
            </motion.div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[color:var(--color-primary)]">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </AuthFormCard>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      ) : null}
    </div>
  )
}
