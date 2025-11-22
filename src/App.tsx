import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientForm from './pages/Patients/PatientForm';
import GroupList from './pages/Groups/GroupList';
import GroupForm from './pages/Groups/GroupForm';
import GroupDetail from './pages/Groups/GroupDetail';
import Calendar from './pages/Schedule/Calendar';
import Schedule from './pages/Schedule/Schedule';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';
import Layout from './components/Layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Patients */}
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/new" element={<PatientForm />} />
        <Route path="patients/:id" element={<PatientForm />} />

        {/* Groups */}
        <Route path="groups" element={<GroupList />} />
        <Route path="groups/new" element={<GroupForm />} />
        <Route path="groups/:id" element={<GroupForm />} />

        {/* New Pages */}
        <Route path="schedule" element={<Schedule />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
