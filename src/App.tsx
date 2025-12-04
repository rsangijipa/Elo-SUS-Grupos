import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from 'react-hot-toast';
import LoadingFallback from './components/Common/LoadingFallback';

// Lazy load pages
const Login = lazy(() => import('./pages/Login/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Schedule = lazy(() => import('./pages/Schedule/Schedule'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const UnitReport = lazy(() => import('./pages/Reports/UnitReport'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const SessionMode = lazy(() => import('./pages/Session/SessionMode'));
const Support = lazy(() => import('./pages/Support/Support'));
const NetworkManager = lazy(() => import('./pages/Network/NetworkManager'));
const GroupProtocols = lazy(() => import('./pages/Protocols/GroupProtocols'));
const Resources = lazy(() => import('./pages/Resources/Resources'));
const Materials = lazy(() => import('./pages/Materials/Materials'));
const WellbeingCenter = lazy(() => import('./pages/Wellbeing/WellbeingCenter'));
const PatientDetail = lazy(() => import('./pages/Patients/PatientDetail'));
const GroupList = lazy(() => import('./pages/Groups/GroupList'));
const PatientList = lazy(() => import('./pages/Patients/PatientList'));
const PatientForm = lazy(() => import('./pages/Patients/PatientForm'));
const AnamnesisPage = lazy(() => import('./pages/Anamnesis/AnamnesisPage'));
const GroupManagement = lazy(() => import('./pages/Groups/GroupManagement'));
const DeveloperTools = lazy(() => import('./pages/Developer/DeveloperTools'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

import RoleGuard from './components/Auth/RoleGuard';
import Layout from './components/Layout/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import { AccessibilityProvider } from './contexts/AccessibilityContext';

function App() {
  return (
    <Router>
      <AccessibilityProvider>
        <NotificationProvider>
          <AuthProvider>
            <ThemeProvider>
              <DataProvider>
                <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="schedule" element={<Schedule />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="reports/unit" element={<UnitReport />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="session/:id" element={<SessionMode />} />
                      <Route path="support" element={<Support />} />

                      {/* Clinical Routes - Admin & Professional */}
                      <Route path="network" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <NetworkManager />
                        </RoleGuard>
                      } />
                      <Route path="protocols" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <GroupProtocols />
                        </RoleGuard>
                      } />
                      <Route path="resources" element={<Resources />} />
                      <Route path="materials" element={<Materials />} />
                      <Route path="wellbeing" element={<WellbeingCenter />} />

                      <Route path="patients/:id" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <PatientDetail />
                        </RoleGuard>
                      } />
                      <Route path="groups" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <GroupList />
                        </RoleGuard>
                      } />
                      <Route path="groups/:id/manage" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <GroupManagement />
                        </RoleGuard>
                      } />
                      <Route path="patients" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <PatientList />
                        </RoleGuard>
                      } />
                      <Route path="patients/new" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <PatientForm />
                        </RoleGuard>
                      } />
                      <Route path="patients/edit/:id" element={
                        <RoleGuard allowed={['admin', 'professional']} fallback={<Navigate to="/dashboard" replace />}>
                          <PatientForm />
                        </RoleGuard>
                      } />
                      <Route path="anamnese" element={<AnamnesisPage />} />

                      {/* Admin Only */}
                      <Route path="admin" element={
                        <RoleGuard allowed={['admin']} fallback={<Navigate to="/dashboard" replace />}>
                          <AdminDashboard />
                        </RoleGuard>
                      } />
                      <Route path="developer" element={
                        <RoleGuard allowed={['admin']} fallback={<Navigate to="/dashboard" replace />}>
                          <DeveloperTools />
                        </RoleGuard>
                      } />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </DataProvider>
            </ThemeProvider>
          </AuthProvider>
        </NotificationProvider>
      </AccessibilityProvider>
    </Router>
  );
}

export default App;
