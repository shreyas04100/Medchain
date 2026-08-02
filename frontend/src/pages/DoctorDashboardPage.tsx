import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Stethoscope, CheckCircle2, Clock, FileText, Search, Download } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { staggerChildren, slideUp } from '../design-system/animations'
import {
  fetchRequestsByDoctor, fetchApprovedRecords, requestAccess, fetchMedicalRecords, downloadMedicalRecord
} from '../services/medicalVault'
import type { MedicalRecord } from '../services/medicalVault'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Toast } from '../components/ui/toast'

export function DoctorDashboardPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const doctorEmail = user?.email ?? ''

  const [searchEmail, setSearchEmail] = useState('')
  const [searchedEmail, setSearchedEmail] = useState('')
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)

  const { data: myRequests = [] } = useQuery({
    queryKey: ['doctor-requests', doctorEmail],
    queryFn: () => fetchRequestsByDoctor(doctorEmail),
    enabled: !!doctorEmail,
    refetchInterval: 8000,
  })

  const { data: approvedRecords = [] } = useQuery({
    queryKey: ['approved-records', doctorEmail],
    queryFn: () => fetchApprovedRecords(doctorEmail),
    enabled: !!doctorEmail,
    refetchInterval: 8000,
  })

  const { data: patientRecords = [], isFetching: searching } = useQuery({
    queryKey: ['patient-records-search', searchedEmail],
    queryFn: () => fetchMedicalRecords(searchedEmail),
    enabled: !!searchedEmail,
  })

  const requestMut = useMutation({
    mutationFn: ({ recordId, patientEmail }: { recordId: number; patientEmail: string }) =>
      requestAccess(recordId, doctorEmail, patientEmail),
    onSuccess: () => {
      setToast({ title: 'Access request sent', description: 'The patient will be notified to approve.', tone: 'success' })
      qc.invalidateQueries({ queryKey: ['doctor-requests'] })
    },
    onError: () => setToast({ title: 'Failed to send request', tone: 'danger' }),
  })

  const alreadyRequested = (recordId: number) => myRequests.some((r) => r.recordId === recordId)
  const pending = myRequests.filter((r) => r.status === 'PENDING')
  const approved = myRequests.filter((r) => r.status === 'APPROVED')

  const handleDownload = async (record: MedicalRecord) => {
    try {
      const blob = await downloadMedicalRecord(record.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = record.fileName || `${record.title}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      setToast({ title: 'Download started', description: `${record.title} has been downloaded.`, tone: 'success' })
    } catch (error) {
      setToast({ title: 'Download failed', description: 'You may not have access to this record.', tone: 'danger' })
      console.error(error)
    }
  }

  return (
    <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={slideUp} className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-400">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">Doctor Workspace</p>
          <h1 className="text-2xl font-bold">Welcome, Dr. {user?.firstName}</h1>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { icon: Clock, label: 'Pending Requests', value: pending.length, color: 'text-amber-600 bg-amber-500/10' },
          { icon: CheckCircle2, label: 'Approved Access', value: approved.length, color: 'text-emerald-600 bg-emerald-500/10' },
          { icon: FileText, label: 'Records Accessible', value: approvedRecords.length, color: 'text-sky-600 bg-sky-500/10' },
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
          <Search className="h-4 w-4 text-sky-500" />
          <h2 className="text-base font-semibold">Search Patient Records</h2>
        </div>
        <p className="mb-4 text-sm text-slate-400">Enter a patient's email to see their records, then request access to specific ones.</p>
        <div className="flex gap-3">
          <Input placeholder="Patient email address" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearchedEmail(searchEmail)} />
          <Button onClick={() => setSearchedEmail(searchEmail)} disabled={!searchEmail}>
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </div>

        {searchedEmail && (
          <div className="mt-4 space-y-2">
            {patientRecords.length === 0 && !searching && <p className="py-4 text-center text-sm text-slate-400">No records found for {searchedEmail}</p>}
            {patientRecords.map((r: MedicalRecord) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-slate-400">{r.category} · {r.patientEmail}</p>
                </div>
                <Button size="sm" disabled={alreadyRequested(r.id) || requestMut.isPending} onClick={() => requestMut.mutate({ recordId: r.id, patientEmail: r.patientEmail })}>
                  {alreadyRequested(r.id) ? 'Requested' : 'Request Access'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-semibold">My Access Requests</h2>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {myRequests.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No requests yet</p>}
            {myRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-medium">Record #{r.recordId}</p>
                  <p className="text-xs text-slate-400">{r.patientEmail}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                  r.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                  r.status === 'REVOKED' ? 'bg-slate-500/10 text-slate-500' :
                  'bg-amber-500/10 text-amber-600'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={slideUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-500" />
            <h2 className="text-base font-semibold">Accessible Patient Records</h2>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {approvedRecords.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No approved records yet.</p>}
            {approvedRecords.map((r) => (
              <div key={r.id} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.patientEmail} · {r.category}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">APPROVED</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-mono text-xs text-slate-400">{r.cid}</p>
                  <Button size="sm" variant="outline" onClick={() => void handleDownload(r)}>
                    <Download className="mr-1 h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      )}
    </motion.div>
  )
}
