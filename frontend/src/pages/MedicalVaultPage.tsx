import { motion } from 'framer-motion'
import { FileUp, Search, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Toast } from '../components/ui/toast'
import { useAuth } from '../contexts/AuthContext'
import { deleteMedicalRecord, downloadMedicalRecord, fetchApprovedRecords, fetchAuditLogs, fetchBlockchainTransactions, fetchMedicalRecords, uploadMedicalRecord } from '../services/medicalVault'
import type { AuditLog, BlockchainTransaction, MedicalRecord } from '../services/medicalVault'

export function MedicalVaultPage() {
  const { user } = useAuth()
  const userEmail = user?.email ?? ''
  const isDoctor = user?.roles?.includes('DOCTOR') ?? false

  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ title: string; description?: string; tone: 'success' | 'danger' } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (userEmail) void loadData()
  }, [userEmail, isDoctor])

  async function loadData() {
    try {
      const [r, a, t] = await Promise.all([
        isDoctor ? fetchApprovedRecords(userEmail) : fetchMedicalRecords(userEmail),
        fetchAuditLogs(),
        fetchBlockchainTransactions(),
      ])
      setRecords(r)
      setAuditLogs(a)
      setTransactions(t)
    } catch {
      setToast({ title: 'Unable to load vault', tone: 'danger' })
    }
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setLoading(true)
    try {
      await uploadMedicalRecord(selectedFile, {
        title: selectedFile.name,
        category: uploadCategory || 'General',
        patientEmail: userEmail,
      })
      setToast({ title: 'Record encrypted', description: 'Stored securely and logged on-chain.', tone: 'success' })
      setSelectedFile(null)
      setUploadCategory('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadData()
    } catch {
      setToast({ title: 'Upload failed', description: 'Your file could not be processed.', tone: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMedicalRecord(id)
      setToast({ title: 'Record removed', tone: 'success' })
      await loadData()
    } catch {
      setToast({ title: 'Delete failed', tone: 'danger' })
    }
  }

  async function handleDownload(id: number, fileName: string) {
    try {
      const blob = await downloadMedicalRecord(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `record-${id}`
      link.click()
      window.URL.revokeObjectURL(url)
      setToast({ title: 'Download started', tone: 'success' })
    } catch {
      setToast({ title: 'Download failed', tone: 'danger' })
    }
  }

  const filteredRecords = useMemo(() => records.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategory || r.category === filterCategory
    return matchSearch && matchCat
  }), [records, search, filterCategory])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--color-primary)]">Medical vault</p>
        <h1 className="mt-2 text-3xl font-semibold">Secure your records</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          AES-256 encryption · SHA-256 checksum · IPFS storage · Blockchain audit trail
        </p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {isDoctor ? (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-semibold">Accessible records</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Documents approved by patients will appear here.</p>
              </div>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
              <p className="font-medium text-slate-700 dark:text-slate-200">You can review and download records that patients explicitly granted to you.</p>
              <p className="mt-2">Use the table below to access the records approved for your care.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600"><FileUp className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-semibold">Upload document</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Drag & drop or click to select a file.</p>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed p-10 text-center transition-colors
                ${dragging
                  ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]'
                  : 'border-slate-300 bg-slate-50/80 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50'}`}
            >
              <Sparkles className="h-8 w-8 text-[color:var(--color-primary)]" />
              <p className="mt-3 text-sm font-medium">
                {selectedFile ? selectedFile.name : 'Drop a file here or click to browse'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                PDF, JPG, PNG, DICOM — any format accepted
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={onInputChange}
              />
            </div>

            <div className="mt-4">
              <select
                className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text)]"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
              >
                <option value="">Select category (default: General)</option>
                <option value="Lab Results">Lab Results</option>
                <option value="Imaging">Imaging</option>
                <option value="Prescription">Prescription</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="mt-5">
              <Button onClick={handleUpload} disabled={loading || !selectedFile} fullWidth>
                {loading ? 'Encrypting & uploading…' : 'Secure upload'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Vault overview */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><Workflow className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold">Vault overview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Records, audit events, and chain transactions.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: 'Records secured', value: records.length },
              { label: 'Audit events', value: auditLogs.length },
              { label: 'Chain transactions', value: transactions.length },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Records table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{isDoctor ? 'Accessible records' : 'Medical records'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isDoctor ? 'Search and access records patients have shared with you.' : 'Search, filter, and manage your stored records.'}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" placeholder="Search records" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text)]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All categories</option>
              <option value="Lab Results">Lab Results</option>
              <option value="Imaging">Imaging</option>
              <option value="Prescription">Prescription</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">CID</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {filteredRecords.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No records found</td></tr>
              )}
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 font-medium">{record.title}</td>
                  <td className="px-4 py-3">{record.category}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{record.cid}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">{record.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {isDoctor ? (
                      <Button size="sm" variant="outline" onClick={() => void handleDownload(record.id, record.fileName || record.title)}>Download</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => void handleDelete(record.id)}>Delete</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Audit timeline */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          <h3 className="text-xl font-semibold">Audit timeline</h3>
        </div>
        <div className="mt-4 space-y-3">
          {auditLogs.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">No audit events yet.</div>
          )}
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/50">
              <div className="font-medium">{log.action}</div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">{log.userEmail} · {log.details}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      )}
    </div>
  )
}
