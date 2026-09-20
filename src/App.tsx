import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Resident Pages
import { DashboardPage } from './pages/resident/DashboardPage';
import { CommunityPage } from './pages/resident/CommunityPage';
import { CommunityMapPage } from './pages/resident/CommunityMapPage';
import { ShareBorrowPage } from './pages/resident/ShareBorrowPage';
import { SafetyWatchPage } from './pages/resident/SafetyWatchPage';
import { EventsPage } from './pages/resident/EventsPage';
import { TrustPointsPage } from './pages/resident/TrustPointsPage';
import { ProfilePage } from './pages/resident/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminResidentsPage } from './pages/admin/AdminResidentsPage';
import { AdminSafetyPage } from './pages/admin/AdminSafetyPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminModerationPage } from './pages/admin/AdminModerationPage';

// Redirect Authenticated Users Away from Login / Register
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected Route Component: Redirect Unauthenticated Users to /login
const ProtectedRoute: React.FC<{ children: React.ReactElement; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Routes (Redirect away if already logged in) */}
            <Route
              element={
                <PublicOnlyRoute>
                  <AuthLayout />
                </PublicOnlyRoute>
              }
            >
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated Resident & Admin Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Resident Feature Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community-map" element={<CommunityMapPage />} />
              <Route path="/map" element={<CommunityMapPage />} />
              <Route path="/share-borrow" element={<ShareBorrowPage />} />
              <Route path="/share" element={<ShareBorrowPage />} />
              <Route path="/safety-watch" element={<SafetyWatchPage />} />
              <Route path="/safety" element={<SafetyWatchPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/trust-points" element={<TrustPointsPage />} />
              <Route path="/trust" element={<TrustPointsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/residents"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminResidentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminResidentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/safety-reports"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSafetyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/safety"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSafetyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminModerationPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Default Catch-all */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
