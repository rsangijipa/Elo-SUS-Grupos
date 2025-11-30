import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from 'react-hot-toast';
import EnvTest from './components/EnvTest';

import Login from './pages/Login/Login';
import RoleGuard from './components/Auth/RoleGuard';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule/Schedule';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';
import SessionMode from './pages/Session/SessionMode';
import Support from './pages/Support/Support';
import Layout from './components/Layout/Layout';
import NetworkManager from './pages/Network/NetworkManager';
import GroupProtocols from './pages/Protocols/GroupProtocols';
import Resources from './pages/Resources/Resources';
import Materials from './pages/Materials/Materials';
import WellbeingCenter from './pages/Wellbeing/WellbeingCenter';
import PatientDetail from './pages/Patients/PatientDetail';
import GroupList from './pages/Groups/GroupList';
import PatientList from './pages/Patients/PatientList';
import PatientForm from './pages/Patients/PatientForm';

import GroupManagement from './pages/Groups/GroupManagement';
import DeveloperTools from './pages/Developer/DeveloperTools';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
            <DataProvider>
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
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

                  {/* Admin Only */}
                  <Route path="developer" element={
                    <RoleGuard allowed={['admin']} fallback={<Navigate to="/dashboard" replace />}>
                      <DeveloperTools />
                    </RoleGuard>
                  } />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DataProvider>
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
