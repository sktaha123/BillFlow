import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignatureSetupPage } from '@/pages/signature/SignatureSetupPage';
import { FacultyHome } from '@/pages/faculty/FacultyHome';
import { BillWizard } from '@/pages/faculty/create-bill/BillWizard';
import { MyBillsPage } from '@/pages/faculty/MyBillsPage';
import { HodHome } from '@/pages/hod/HodHome';
import { HodPendingBills } from '@/pages/hod/HodPendingBills';
import { HodBillReview } from '@/pages/hod/HodBillReview';
import { HodApprovalSuccess } from '@/pages/hod/HodApprovalSuccess';
import { HeadHome } from '@/pages/head/HeadHome';
import { HeadPendingBills } from '@/pages/head/HeadPendingBills';
import { HeadBillReview } from '@/pages/head/HeadBillReview';
import { HeadApprovalSuccess } from '@/pages/head/HeadApprovalSuccess';
import { BillsListPage } from '@/pages/common/BillsListPage';
import { BillDetailsPage } from '@/pages/common/BillDetailsPage';
import { OfficialBillViewPage } from '@/pages/common/OfficialBillViewPage';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xs text-neutral-400 font-mono animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own home
    if (role === 'HOD') return <Navigate to="/hod" replace />;
    if (role === 'HEAD') return <Navigate to="/head" replace />;
    return <Navigate to="/faculty" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Root redirect based on role
const RootRedirect = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xs text-neutral-400 font-mono animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role === 'HOD') return <Navigate to="/hod" replace />;
  if (role === 'HEAD') return <Navigate to="/head" replace />;
  return <Navigate to="/faculty" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Signature Setup — All roles */}
      <Route
        path="/signature-setup"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'HEAD']}>
            <SignatureSetupPage />
          </ProtectedRoute>
        }
      />

      {/* ─── FACULTY ROUTES ─── */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/create-bill"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <BillWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/my-bills"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <MyBillsPage />
          </ProtectedRoute>
        }
      />

      {/* ─── HOD ROUTES ─── */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HodHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/pending"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HodPendingBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/review/:id"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HodBillReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/approved-success/:id"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HodApprovalSuccess />
          </ProtectedRoute>
        }
      />

      {/* ─── HEAD / PRINCIPAL ROUTES ─── */}
      <Route
        path="/head"
        element={
          <ProtectedRoute allowedRoles={['HEAD']}>
            <HeadHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/head/pending"
        element={
          <ProtectedRoute allowedRoles={['HEAD']}>
            <HeadPendingBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/head/review/:id"
        element={
          <ProtectedRoute allowedRoles={['HEAD']}>
            <HeadBillReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/head/approved-success/:id"
        element={
          <ProtectedRoute allowedRoles={['HEAD']}>
            <HeadApprovalSuccess />
          </ProtectedRoute>
        }
      />

      {/* ─── SHARED ROUTES — All roles ─── */}
      <Route
        path="/bills"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'HEAD']}>
            <BillsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bill/:id"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'HEAD']}>
            <BillDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bill/:id/official"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'HEAD']}>
            <OfficialBillViewPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
