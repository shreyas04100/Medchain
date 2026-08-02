import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, ShieldCheck, Activity, FileText, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { staggerChildren, slideUp } from '../design-system/animations'
import { fetchAuditLogs, fetchBlockchainTransactions } from '../services/medicalVault'
import { useEffect, useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Toast } from '../components/ui/toast'
import { createManagedUser, deleteUser } from '../services/auth'
import { fetchAllDoctors } from '../services/medicalVault'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data: auditLogs = [] } = useQuery({ queryKey: ['audit-logs'], queryFn: fetchAuditLogs })
  const { data: txns = [] } = useQuery({ queryKey: ['blockchain-txns'], queryFn: fetchBlockchainTransactions })
  const { data: doctors = [], refetch: refetchDoctors } = useQuery({ queryKey: ['admin-doctors'], queryFn: fetchAllDoctors })

  const actionCounts = auditLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.action] = (acc[l.action] ?? 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(actionCounts).map(([name, value]) => ({ name, value }))
  const recentLogs = auditLogs.slice(0, 8)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [removingDoctorId, setRemovingDoctorId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  useEffect(() => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
  }, [user])

  const handleCreateDoctor = async () => {
    setLoadingCreate(true)
    setToast(null)
    try {
      await createManagedUser({ firstName, lastName, email, password, role: 'DOCTOR' })
      setToast({ title: 'Doctor created', description: 'An account has been created for the doctor. Share credentials with them.', tone: 'success' })
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      await refetchDoctors()
    } catch (err) {
      setToast({ title: 'Creation failed', description: 'Unable to create doctor account. Check console for errors.', tone: 'danger' })
      console.error(err)
    } finally {
      setLoadingCreate(false)
    }
  }

  const handleRemoveDoctor = async (doctorId: number) => {
    if (!window.confirm('Remove this doctor account from MedChain?')) return
    setRemovingDoctorId(doctorId)
    setToast(null)
    try {
      await deleteUser(doctorId)
      setToast({ title: 'Doctor removed', description: 'The doctor account has been removed.', tone: 'success' })
      await refetchDoctors()
    } catch (err) {
      setToast({ title: 'Removal failed', description: 'Unable to remove the doctor account.', tone: 'danger' })
      console.error(err)
    } finally {
      setRemovingDoctorId(null)
    }
  }

  return (
    <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={slideUp} className="flex items-center gap-3">
        <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-400">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Admin Console</p>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Activity, label: 'Audit Events', value: auditLogs.length, color: 'text-violet-600 bg-violet-500/10' },
          { icon: FileText, label: 'Blockchain Txns', value: txns.length, color: 'text-blue-600 bg-blue-500/10' },
          { icon: ShieldCheck, label: 'Action Types', value: Object.keys(actionCounts).length, color: 'text-emerald-600 bg-emerald-500/10' },
          { icon: Users, label: 'Unique Users', value: new Set(auditLogs.map((l) => l.userEmail)).size, color: 'text-amber-600 bg-amber-500/10' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Audit Actions Breakdown</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">No audit data</div>
          )}
        </motion.div>

        <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Recent Audit Logs</p>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {recentLogs.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No audit logs</p>}
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-slate-400">{log.userEmail}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Recent Blockchain Transactions</p>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {txns.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No transactions</p>}
          {txns.slice(0, 6).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800/60">
              <div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-300">{tx.transactionHash.slice(0, 24)}…</p>
                <p className="text-xs text-slate-400">Block #{tx.blockNumber}</p>
              </div>
              <p className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Create Doctor Account</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input name="doctor-firstname" autoComplete="off" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input name="doctor-lastname" autoComplete="off" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input name="doctor-email" autoComplete="off" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input name="doctor-temp-password" autoComplete="new-password" placeholder="Temporary password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={handleCreateDoctor} disabled={loadingCreate || !firstName || !lastName || !email || !password}>
            {loadingCreate ? 'Creating…' : 'Create Doctor'}
          </Button>
        </div>
        {toast ? (
          <div className="mt-4">
            <Toast title={toast.title} description={toast.description} tone={toast.tone} />
          </div>
        ) : null}
      </motion.div>

      <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Doctor Management</p>
            <p className="mt-1 text-sm text-slate-400">Admin can review and remove doctor accounts.</p>
          </div>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-600">{doctors.length}</span>
        </div>
        {doctors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">No doctors yet.</div>
        ) : (
          <div className="space-y-2">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <div>
                  <p className="font-medium">{doctor.firstName} {doctor.lastName}</p>
                  <p className="text-xs text-slate-400">{doctor.email}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => void handleRemoveDoctor(doctor.id)} disabled={removingDoctorId === doctor.id}>
                  {removingDoctorId === doctor.id ? 'Removing…' : 'Remove'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
