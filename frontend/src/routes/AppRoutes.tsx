import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { MainLayout } from '../components/layout/MainLayout'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { PatientDashboardPage } from '../pages/PatientDashboardPage'
import { DoctorDashboardPage } from '../pages/DoctorDashboardPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { SentinelDashboardPage } from '../pages/SentinelDashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { DesignSystemPage } from '../pages/DesignSystemPage'
import { MedicalVaultPage } from '../pages/MedicalVaultPage'
import { ChangePasswordPage } from '../pages/ChangePasswordPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'

export function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']} />}>
          <Route path="/medical-vault" element={<MedicalVaultPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/sentinel" element={<SentinelDashboardPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  )
}
