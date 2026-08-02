import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medchain-token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  email: string
  firstName: string
  lastName: string
  roles: Role[]
}

export type UserProfile = {
  id: number
  firstName: string
  lastName: string
  email: string
  roles: Role[]
}

export async function registerUser(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}) {
  const response = await api.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export async function requestPatientRegistrationOtp(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}) {
  const response = await api.post('/auth/register/request-otp', payload)
  return response.data
}

export async function verifyPatientRegistration(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  otp: string
}) {
  const response = await api.post<AuthResponse>('/auth/register/verify', payload)
  return response.data
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await api.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function requestForgotPasswordOtp(payload: { email: string }) {
  const response = await api.post('/auth/forgot-password/request-otp', payload)
  return response.data
}

export async function resetForgotPassword(payload: { email: string; otp: string; newPassword: string }) {
  const response = await api.post<AuthResponse>('/auth/forgot-password/reset', payload)
  return response.data
}

export async function createManagedUser(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}) {
  const response = await api.post<AuthResponse>('/auth/admin/create-user', payload)
  return response.data
}

export async function fetchCurrentUser() {
  const response = await api.get<UserProfile>('/auth/me')
  return response.data
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const response = await api.put('/users/me/password', payload)
  return response.data
}

export async function requestPasswordChangeOtp(payload: { currentPassword: string }) {
  const response = await api.post('/users/me/request-password-change-otp', payload)
  return response.data
}

export async function changePasswordWithOtp(payload: { otp: string; newPassword: string }) {
  const response = await api.put('/users/me/password-with-otp', payload)
  return response.data
}

export async function deleteUser(id: number) {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('medchain-token', token)
  } else {
    localStorage.removeItem('medchain-token')
  }
}

export function getStoredUser() {
  const stored = localStorage.getItem('medchain-user')
  return stored ? JSON.parse(stored) : null
}

export function persistUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem('medchain-user', JSON.stringify(user))
  } else {
    localStorage.removeItem('medchain-user')
  }
}

export function getRolePriority(role: string) {
  const priorities: Record<string, number> = { PATIENT: 1, DOCTOR: 2, ADMIN: 3 }
  return priorities[role] ?? 0
}

export default api

