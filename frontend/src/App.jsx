import { API_CONFIG } from "./services/api/apiClient";
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import MasterLayout from "./layouts/MasterLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import { PageLoader } from "./components/ui/StateViews";

// Public Pages
const HomePage = lazy(() => import("./pages/public/HomePage"));
const ExploreEventsPage = lazy(() => import("./pages/public/ExploreEventsPage"));
const AcademicEventsPage = lazy(() => import("./pages/public/AcademicEventsPage"));
const NonAcademicEventsPage = lazy(() => import("./pages/public/NonAcademicEventsPage"));
const EventDetailPage = lazy(() => import("./pages/public/EventDetailPage"));
const NotFoundPage = lazy(() => import("./pages/public/NotFoundPage"));

// Auth Pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));

// Student & GANEAI Pages
const StudentDashboardPage = lazy(() => import("./pages/student/StudentDashboardPage"));
const MyRegistrationsPage = lazy(() => import("./pages/student/MyRegistrationsPage"));
const VerifyReceiptPage = lazy(() => import("./pages/public/VerifyReceiptPage"));
const RegistrationReceiptPage = lazy(() => import("./pages/student/RegistrationReceiptPage"));
const NotificationsPage = lazy(() => import("./pages/student/NotificationsPage"));
const StudentProfilePage = lazy(() => import("./pages/student/StudentProfilePage"));
const GaneAIPage = lazy(() => import("./pages/student/GaneAIPage"));

// Event Admin Pages
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminEventFormPage = lazy(() => import("./pages/admin/AdminEventFormPage"));
const AdminParticipantsPage = lazy(() => import("./pages/admin/AdminParticipantsPage"));

// Master Admin / UPA TIK Pages
const MasterDashboardPage = lazy(() => import("./pages/master/MasterDashboardPage"));
const MasterRolesPage = lazy(() => import("./pages/master/MasterRolesPage"));
const MasterCatalogPage = lazy(() => import("./pages/master/MasterCatalogPage"));
const MasterUsersPage = lazy(() => import("./pages/master/MasterUsersPage"));
const MasterOrganizationsPage = lazy(() => import("./pages/master/MasterOrganizationsPage"));
const MasterEventsPage = lazy(() => import("./pages/master/MasterEventsPage"));
const MasterModerationPage = lazy(() => import("./pages/master/MasterModerationPage"));
const MasterVerificationsPage = lazy(() => import("./pages/master/MasterVerificationsPage"));
const MasterSecurityCenterPage = lazy(() => import("./pages/master/MasterSecurityCenterPage"));
const MasterSessionsPage = lazy(() => import("./pages/master/MasterSessionsPage"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="events" element={<ExploreEventsPage />} />
            <Route path="events/academic" element={<AcademicEventsPage />} />
            <Route path="events/non-academic" element={<NonAcademicEventsPage />} />
            <Route
              path="events/sempro"
              element={<Navigate to="/events/academic?tab=seminar-proposal" replace />}
            />
            <Route path="verify/receipts/:uuid" element={<VerifyReceiptPage />} />
            <Route path="events/:slug" element={<EventDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/email-verified" element={<VerifyEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Student & GANEAI Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="registrations" element={<MyRegistrationsPage />} />
            <Route path="registrations/:id" element={<RegistrationReceiptPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="ai" element={API_CONFIG.useMockApi ? <GaneAIPage /> : <p role="status">Integrasi GaneAI belum tersedia.</p>} />
          </Route>

          {/* Event Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["event_admin", "super_admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/new" element={<AdminEventFormPage />} />
            <Route path="events/:id/edit" element={<AdminEventFormPage />} />
            <Route path="events/:id/participants" element={<AdminParticipantsPage />} />
          </Route>

          {/* Master Admin / UPA TIK Routes */}
          <Route
            path="/master"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <MasterLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MasterDashboardPage />} />
            <Route path="users" element={API_CONFIG.useMockApi ? <MasterUsersPage /> : <MasterRolesPage />} />
            <Route path="catalog" element={<MasterCatalogPage />} />
            <Route path="organizations" element={<MasterOrganizationsPage />} />
            <Route path="events" element={<MasterEventsPage />} />
            <Route path="moderation" element={<MasterModerationPage />} />
            <Route path="student-verifications" element={<MasterVerificationsPage />} />
            <Route path="activity-security" element={API_CONFIG.useMockApi ? <MasterSecurityCenterPage /> : <p role="status">Riwayat keamanan belum tersedia.</p>} />
            <Route path="sessions" element={API_CONFIG.useMockApi ? <MasterSessionsPage /> : <p role="status">Pengelolaan sesi belum tersedia.</p>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}