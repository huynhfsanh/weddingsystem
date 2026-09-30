import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { HomePage } from "@/pages/public/HomePage";
import { PackagesPage } from "@/pages/public/PackagesPage";
import { PackageDetailPage } from "@/pages/public/PackageDetailPage";
import { AboutPage, ContactPage, FaqPage } from "@/pages/public/ContentPages";
import { LoginPage, RegisterPage } from "@/pages/auth/AuthPages";
import { CustomerDashboardPage } from "@/pages/customer/CustomerDashboardPage";
import { CreateContractPage } from "@/pages/customer/CreateContractPage";
import { ContractDetailPage, ContractsPage, PaymentPage } from "@/pages/customer/ContractsPages";
import { ChatbotPage } from "@/pages/customer/ChatbotPage";
import { NotificationsPage, PaymentsPage, ProfilePage } from "@/pages/customer/AccountPages";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminCatalogPage, AdminContractsPage, AdminPackagesPage, AdminPaymentsPage, AdminUsersPage } from "@/pages/admin/AdminManagementPages";
import { AdminAssignmentDetailPage, AdminAssignmentsPage, AdminCapacityPage, AdminContractDetailPage, AdminDamagesPage, AdminPhotosPage } from "@/pages/admin/AdminOperationsPages";
import { AdminAuditPage, AdminPayrollPage, AdminReportsPage, AdminSettingsPage } from "@/pages/admin/AdminSupportPages";
import { AdminChatbotPage, AdminFaqPage, AdminStaffRatesPage, AdminSupportRequestsPage } from "@/pages/admin/AdminReferencePages";
import { AdminMenuPage } from "@/pages/admin/AdminMenuPage";
import { StaffAssignmentDetailPage, StaffAssignmentsPage, StaffCheckPage, StaffDamagePage, StaffDashboardPage, StaffPayrollPage } from "@/pages/staff/StaffPages";
import { ForbiddenPage, NotFoundPage } from "@/pages/system/SystemPages";

export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} /><Route path="about" element={<AboutPage />} /><Route path="packages" element={<PackagesPage />} /><Route path="packages/:slug" element={<PackageDetailPage />} /><Route path="faq" element={<FaqPage />} /><Route path="contact" element={<ContactPage />} />
    </Route>
    <Route path="login" element={<LoginPage />} /><Route path="register" element={<RegisterPage />} /><Route path="forbidden" element={<ForbiddenPage />} />

    <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}><Route element={<CustomerLayout />}>
      <Route path="customer/dashboard" element={<CustomerDashboardPage />} /><Route path="customer/profile" element={<ProfilePage />} /><Route path="customer/packages" element={<PackagesPage embedded />} /><Route path="customer/packages/:slug" element={<PackageDetailPage />} />
      <Route path="customer/contracts" element={<ContractsPage />} /><Route path="customer/contracts/new" element={<CreateContractPage />} /><Route path="customer/contracts/:id" element={<ContractDetailPage />} /><Route path="customer/contracts/:id/payment" element={<PaymentPage />} />
      <Route path="customer/payments" element={<PaymentsPage />} /><Route path="customer/chatbot" element={<ChatbotPage />} /><Route path="customer/notifications" element={<NotificationsPage />} />
    </Route></Route>

    <Route element={<ProtectedRoute roles={["ADMIN"]} />}><Route element={<DashboardLayout />}>
      <Route path="admin/dashboard" element={<AdminDashboardPage />} /><Route path="admin/users" element={<AdminUsersPage />} /><Route path="admin/users/:id" element={<AdminUsersPage />} />
      <Route path="admin/packages" element={<AdminPackagesPage />} /><Route path="admin/menu-combos" element={<AdminMenuPage />} /><Route path="admin/catalog-items" element={<AdminCatalogPage />} /><Route path="admin/contracts" element={<AdminContractsPage />} /><Route path="admin/contracts/new" element={<CreateContractPage admin />} /><Route path="admin/contracts/:id" element={<AdminContractDetailPage />} />
      <Route path="admin/payments" element={<AdminPaymentsPage />} /><Route path="admin/capacity" element={<AdminCapacityPage />} /><Route path="admin/assignments" element={<AdminAssignmentsPage />} /><Route path="admin/assignments/:id" element={<AdminAssignmentDetailPage />} />
      <Route path="admin/photos" element={<AdminPhotosPage />} /><Route path="admin/damages" element={<AdminDamagesPage />} /><Route path="admin/damages/:id" element={<AdminDamagesPage />} /><Route path="admin/staff-rates" element={<AdminStaffRatesPage />} />
      <Route path="admin/payroll" element={<AdminPayrollPage />} /><Route path="admin/reports" element={<AdminReportsPage />} /><Route path="admin/chatbot" element={<AdminChatbotPage />} /><Route path="admin/chatbot/faqs" element={<AdminFaqPage />} />
      <Route path="admin/support-requests" element={<AdminSupportRequestsPage />} /><Route path="admin/settings" element={<AdminSettingsPage />} /><Route path="admin/audit-logs" element={<AdminAuditPage />} />
    </Route></Route>

    <Route element={<ProtectedRoute roles={["STAFF"]} />}><Route element={<DashboardLayout />}>
      <Route path="staff/dashboard" element={<StaffDashboardPage />} /><Route path="staff/assignments" element={<StaffAssignmentsPage />} /><Route path="staff/assignments/:id" element={<StaffAssignmentDetailPage />} />
      <Route path="staff/assignments/:id/check-in" element={<StaffCheckPage mode="check-in" />} /><Route path="staff/assignments/:id/check-out" element={<StaffCheckPage mode="check-out" />} /><Route path="staff/assignments/:id/damage" element={<StaffDamagePage />} />
      <Route path="staff/payroll" element={<StaffPayrollPage />} /><Route path="staff/profile" element={<ProfilePage />} /><Route path="staff/notifications" element={<NotificationsPage />} />
    </Route></Route>

    <Route path="*" element={<NotFoundPage />} />
    <Route path="dashboard" element={<Navigate to="/" replace />} />
  </Routes>;
}
