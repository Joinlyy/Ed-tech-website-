import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/marketing/Home';
import About from '@/pages/marketing/About';
import Pricing from '@/pages/marketing/Pricing';
import Checkout from '@/pages/checkout/Checkout';
import AddStudent from '@/pages/checkout/AddStudent';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ClientDashboard from '@/pages/client/Dashboard';
import ExamBoard from '@/pages/client/ExamBoard';
import Reports from '@/pages/client/Reports';
import Settings from '@/pages/client/Settings';
import StaffDashboard from '@/pages/staff/Dashboard';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminSubjects from '@/pages/admin/AdminSubjects';
import AdminQuestionPapers from '@/pages/admin/AdminQuestionPapers';
import AdminSubAdmins from '@/pages/admin/AdminSubAdmins';
import AdminMembers from '@/pages/admin/AdminMembers';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminReports from '@/pages/admin/AdminReports';
import AppShell from '@/components/app/AppShell';
import AuthLayout from '@/components/auth/AuthLayout';
import ProtectedRoute from '@/components/app/ProtectedRoute';

function MarketingLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* marketing */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/add-student" element={<AddStudent />} />
      </Route>

      {/* auth */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* portals — all auth-guarded, all share the AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="/portal/dashboard" element={<ClientDashboard />} />
        <Route path="/portal/exam-board" element={<ExamBoard />} />
        <Route path="/portal/reports" element={<Reports />} />
        <Route path="/portal/settings" element={<Settings />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        
        {/* Admin Suite Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/question-papers" element={<AdminQuestionPapers />} />
        <Route path="/admin/sub-admins" element={<AdminSubAdmins />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
