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
