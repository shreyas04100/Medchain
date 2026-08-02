import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, FileText, ShieldCheck, Bell, Upload, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { staggerChildren, slideUp } from '../design-system/animations'
import { fetchMedicalRecords, fetchRequestsByPatient, approveAccess, rejectAccess, fetchAllDoctors } from '../services/medicalVault'
import { Toast } from '../components/ui/toast'
import { useState } from 'react'

export function PatientDashboardPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  const { data: records = [] } = useQuery({
    queryKey: ['records', user?.email],
    queryFn: () => fetchMedicalRecords(user!.email),
    enabled: !!user,
  })

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['patient-requests', user?.email],
    queryFn: () => fetchRequestsByPatient(user!.email),
    enabled: !!user,
    refetchInterval: 8000,
  })

  const { data: doctors = [] } = useQuery({
    queryKey: ['all-doctors'],
    queryFn: fetchAllDoctors,
  })

  const approveMut = useMutation({
    mutationFn: approveAccess,
    onSuccess: () => {
      setToast({ title: 'Access approved', description: 'The doctor can now open the allowed record.', tone: 'success' })
      qc.invalidateQueries({ queryKey: ['patient-requests'] })
      qc.invalidateQueries({ queryKey: ['doctor-requests'] })
      qc.invalidateQueries({ queryKey: ['approved-records'] })
    },
  })

  const rejectMut = useMutation({
    mutationFn: rejectAccess,
    onSuccess: () => {
      setToast({ title: 'Access rejected', description: 'The doctor request was denied.', tone: 'danger' })
      qc.invalidateQueries({ queryKey: ['patient-requests'] })
      qc.invalidateQueries({ queryKey: ['doctor-requests'] })
      qc.invalidateQueries({ queryKey: ['approved-records'] })
    },
  })


  const pendingRequests = incomingRequests.filter((r) => r.status === 'PENDING')
  const byCategory = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }))
  const recent = records.slice(0, 5)

  return (
    <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={slideUp} className="flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Patient Portal</p>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}</h1>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: FileText, label: 'Total Records', value: records.length, color: 'text-blue-600 bg-blue-500/10' },
          { icon: ShieldCheck, label: 'Encrypted', value: records.length, color: 'text-emerald-600 bg-emerald-500/10' },
          { icon: Upload, label: 'Uploaded', value: records.filter((r) => r.status === 'UPLOADED').length, color: 'text-violet-600 bg-violet-500/10' },
          { icon: Bell, label: 'Pending Requests', value: pendingRequests.length, color: pendingRequests.length > 0 ? 'text-red-600 bg-red-500/10' : 'text-amber-600 bg-amber-500/10' },
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

      <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-semibold">Doctor Access Requests</h2>
          {pendingRequests.length > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{pendingRequests.length}</span>}
        </div>
        <div className="space-y-2">
          {incomingRequests.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No doctors have requested access yet.</p>}
          {incomingRequests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
              <div>
                <p className="text-sm font-medium">{r.doctorEmail}</p>
                <p className="text-xs text-slate-400">Requesting access to Record #{r.recordId}</p>
              </div>
              {r.status === 'PENDING' ? (
                <div className="flex gap-2">
                  <button onClick={() => approveMut.mutate(r.id)} className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 transition hover:bg-emerald-500/20" title="Approve">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => rejectMut.mutate(r.id)} className="rounded-lg bg-red-500/10 p-1.5 text-red-600 transition hover:bg-red-500/20" title="Reject">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>{r.status}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>


      <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sky-500" />
          <h2 className="text-base font-semibold">Available Doctors</h2>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {doctors.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No doctors available yet.</p>}
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
              <p className="font-medium">{doctor.firstName} {doctor.lastName}</p>
              <p className="text-xs text-slate-400">{doctor.email}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Records by Category</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">No records yet</div>
          )}
        </motion.div>

        <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Recent Records</p>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No records uploaded yet</p>}
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.category}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">{r.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/medical-vault" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500">
            <Upload className="h-4 w-4" /> Upload Record
          </Link>
          <Link to="/medical-vault" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            <Eye className="h-4 w-4" /> View Vault
          </Link>
        </div>
      </motion.div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      )}
    </motion.div>
  )
}
