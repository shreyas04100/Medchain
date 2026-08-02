import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Check, Eye, EyeOff, KeyRound, Lock, Mail, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthFormCard } from '../components/auth/AuthFormCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Toast } from '../components/ui/toast'
import { requestForgotPasswordOtp, resetForgotPassword, setAuthToken } from '../services/auth'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  otp: z.string().length(6, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex, 'Password must include upper, lower and a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type EmailValues = z.infer<typeof emailSchema>
type ResetValues = z.infer<typeof resetSchema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '', otp: '', newPassword: '', confirmPassword: '' },
  })

  const passwordValue = resetForm.watch('newPassword', '')
  const checks = {
    length: passwordValue.length >= 8,
    lower: /[a-z]/.test(passwordValue),
    upper: /[A-Z]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  }

  const onEmailSubmit = async (values: EmailValues) => {
    setLoading(true)
    setToast(null)
    try {
      await requestForgotPasswordOtp(values)
      resetForm.setValue('email', values.email)
      setStep('reset')
      setToast({ title: 'Verification code sent', description: `We sent a 6-digit code to ${values.email}.`, tone: 'success' })
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to send the verification code.'
      setToast({ title: 'Request failed', description: message, tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const onResetSubmit = async (values: ResetValues) => {
    setLoading(true)
    setToast(null)
    try {
      const response = await resetForgotPassword({ email: values.email, otp: values.otp, newPassword: values.newPassword })
      setAuthToken(response.accessToken)
      setToast({ title: 'Password updated', description: 'You can now sign in with your new password.', tone: 'success' })
      setTimeout(() => navigate('/login'), 1200)
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to reset your password.'
      setToast({ title: 'Reset failed', description: message, tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2 py-6">
      <AuthFormCard title={step === 'email' ? 'Forgot password' : 'Reset your password'} subtitle={step === 'email' ? 'Enter your email to receive a verification code' : 'Enter the code sent to your email and choose a new password'}>
        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" placeholder="Email address" {...emailForm.register('email')} />
              {emailForm.formState.errors.email ? <p className="mt-1 text-sm text-red-500">{emailForm.formState.errors.email.message}</p> : null}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Button type="submit" fullWidth className="h-11" disabled={loading}>
                {loading ? 'Sending code…' : 'Send verification code'}
              </Button>
            </motion.div>
            <p className="text-center text-sm text-slate-500">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-[color:var(--color-primary)]">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" placeholder="Email address" {...resetForm.register('email')} />
              {resetForm.formState.errors.email ? <p className="mt-1 text-sm text-red-500">{resetForm.formState.errors.email.message}</p> : null}
            </div>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" placeholder="6-digit code" maxLength={6} {...resetForm.register('otp')} />
              {resetForm.formState.errors.otp ? <p className="mt-1 text-sm text-red-500">{resetForm.formState.errors.otp.message}</p> : null}
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10 pr-10" placeholder="New password" type={showPassword ? 'text' : 'password'} {...resetForm.register('newPassword')} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {resetForm.formState.errors.newPassword ? <p className="mt-1 text-sm text-red-500">{resetForm.formState.errors.newPassword.message}</p> : null}
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" placeholder="Confirm new password" type={showPassword ? 'text' : 'password'} {...resetForm.register('confirmPassword')} />
              {resetForm.formState.errors.confirmPassword ? <p className="mt-1 text-sm text-red-500">{resetForm.formState.errors.confirmPassword.message}</p> : null}
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

            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => setStep('email')} className="text-sm font-semibold text-[color:var(--color-primary)]">
                Back
              </button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating password…' : 'Reset password'}
              </Button>
            </div>
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
