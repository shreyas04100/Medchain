import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Toast } from '../components/ui/toast'
import { requestPasswordChangeOtp, changePasswordWithOtp } from '../services/auth'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  const requestOtp = async () => {
    setToast(null)
    setLoading(true)
    try {
      await requestPasswordChangeOtp({ currentPassword })
      setOtpSent(true)
      setToast({ title: 'OTP sent', description: 'Check your email for the 6-digit code.', tone: 'success' })
    } catch (err: any) {
      setToast({ title: 'Request failed', description: err?.response?.data?.message ?? 'Unable to request OTP', tone: 'danger' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const confirmChange = async () => {
    if (newPassword !== confirm) {
      setToast({ title: 'Passwords do not match', tone: 'danger' })
      return
    }
    setLoading(true)
    setToast(null)
    try {
      await changePasswordWithOtp({ otp, newPassword })
      setToast({ title: 'Password changed', description: 'Your password was updated successfully.', tone: 'success' })
      setTimeout(() => navigate('/'), 1200)
    } catch (err: any) {
      setToast({ title: 'Change failed', description: err?.response?.data?.message ?? 'Unable to change password', tone: 'danger' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-2 py-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Change password (double-auth)</h2>

        {!otpSent ? (
          <>
            <div>
              <label className="text-sm text-slate-600">Current password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-600">New password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-600">Confirm new password</label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={requestOtp} disabled={loading || !currentPassword || !newPassword || !confirm}>
                {loading ? 'Requesting OTP…' : 'Request OTP'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm text-slate-600">Enter 6-digit OTP sent to your email</label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOtpSent(false)} disabled={loading}>
                Back
              </Button>
              <Button onClick={confirmChange} disabled={loading || !otp}>
                {loading ? 'Saving…' : 'Confirm & Save'}
              </Button>
            </div>
          </>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      ) : null}
    </div>
  )
}
