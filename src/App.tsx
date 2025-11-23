import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login/Login';
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

import { DataProvider } from './contexts/DataContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <DataProvider>
            <Router>
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

                  {/* New Routes */}
                  <Route path="network" element={<NetworkManager />} />
                  <Route path="protocols" element={<GroupProtocols />} />
                  <Route path="resources" element={<Resources />} />
                  <Route path="materials" element={<Materials />} />
                  <Route path="wellbeing" element={<WellbeingCenter />} />
                  <Route path="patients/:id" element={<PatientDetail />} />
                  <Route path="groups" element={<GroupList />} />
                  <Route path="patients" element={<PatientList />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </DataProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
