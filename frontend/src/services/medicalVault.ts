import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medchain-token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Ensure Authorization header is set (some builds obfuscated the original interceptor). This interceptor
// runs after the existing one and guarantees Bearer token is attached for requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medchain-token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type MedicalRecord = {
  id: number
  title: string
  category: string
  patientEmail: string
  fileName: string
  mimeType: string
  checksum: string
  fileSize: number
  cid: string
  status: string
  uploadedAt: string
}

export type AccessRequest = {
  id: number
  patientEmail: string
  doctorEmail: string
  recordId: number
  status: string
  requestedAt: string
  respondedAt: string | null
}

export type AuditLog = {
  id: number
  action: string
  userEmail: string
  ipAddress: string
  details: string
  transactionHash: string
  timestamp: string
}

export type BlockchainTransaction = {
  id: number
  transactionHash: string
  blockNumber: number
  timestamp: string
  cid: string
  recordId: string
}

export type DoctorProfile = {
  id: number
  firstName: string
  lastName: string
  email: string
}

export async function uploadMedicalRecord(file: File, payload: { title: string; category: string; patientEmail: string }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', payload.title)
  formData.append('category', payload.category)
  formData.append('patientEmail', payload.patientEmail)
  const res = await api.post<MedicalRecord>('records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function fetchMedicalRecords(patientEmail: string) {
  const res = await api.get<MedicalRecord[]>(`records?patientEmail=${encodeURIComponent(patientEmail)}`)
  return res.data
}

export async function fetchApprovedRecords(doctorEmail: string) {
  const res = await api.get<MedicalRecord[]>(`records/approved?doctorEmail=${encodeURIComponent(doctorEmail)}`)
  return res.data
}

export async function getMedicalRecord(id: number) {
  const res = await api.get<MedicalRecord>(`records/${id}`)
  return res.data
}

export async function deleteMedicalRecord(id: number) {
  await api.delete(`records/${id}`)
}

export function getViewUrl(id: number): string {
  const token = localStorage.getItem('medchain-token')
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/api/records/view/${id}?token=${token ?? ''}`
}

export async function viewRecord(id: number): Promise<string> {
  const res = await api.get(`records/view/${id}`, { responseType: 'blob' })
  return URL.createObjectURL(res.data)
}

export async function downloadMedicalRecord(id: number): Promise<Blob> {
  const res = await api.get(`records/download/${id}`, { responseType: 'blob' })
  return res.data
}

export async function fetchAllDoctors(): Promise<DoctorProfile[]> {
  const res = await api.get<DoctorProfile[]>('users/doctors')
  return res.data
}

export async function requestAccess(recordId: number, doctorEmail: string, patientEmail: string) {
  const res = await api.post<AccessRequest>('access/request', null, {
    params: { recordId, doctorEmail, patientEmail },
  })
  return res.data
}

export async function grantAccess(recordId: number, doctorEmail: string) {
  // Patient-side direct grant was removed; keep this wrapper to call the server endpoint
  const res = await api.post<AccessRequest>('access/grant', null, {
    params: { recordId, doctorEmail },
  })
  return res.data
}

export async function approveAccess(requestId: number) {
  const res = await api.post<AccessRequest>(`access/approve?requestId=${requestId}`)
  return res.data
}

export async function rejectAccess(requestId: number) {
  const res = await api.post<AccessRequest>(`access/reject?requestId=${requestId}`)
  return res.data
}

export async function revokeAccess(requestId: number) {
  const res = await api.post<AccessRequest>(`access/revoke?requestId=${requestId}`)
  return res.data
}

export async function fetchPendingAccessRequests() {
  const res = await api.get<AccessRequest[]>('access/pending')
  return res.data
}

export async function fetchRequestsByDoctor(doctorEmail: string) {
  const res = await api.get<AccessRequest[]>(`access/by-doctor?doctorEmail=${encodeURIComponent(doctorEmail)}`)
  return res.data
}

export async function fetchRequestsByPatient(patientEmail: string) {
  const res = await api.get<AccessRequest[]>(`access/by-patient?patientEmail=${encodeURIComponent(patientEmail)}`)
  return res.data
}

export async function fetchAuditLogs() {
  const res = await api.get<AuditLog[]>('audit')
  return res.data
}

export async function fetchBlockchainTransactions() {
  const res = await api.get<BlockchainTransaction[]>('blockchain/transactions')
  return res.data
}

export default api


