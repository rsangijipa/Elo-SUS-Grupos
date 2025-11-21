import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientForm from './pages/Patients/PatientForm';
import GroupList from './pages/Groups/GroupList';
import GroupForm from './pages/Groups/GroupForm';
import GroupDetail from './pages/Groups/GroupDetail';
import Calendar from './pages/Schedule/Calendar';

// Placeholder components for routes we haven't built yet
const Schedule = () => <div>Agenda (Em construção)</div>;
const Reports = () => <div>Relatórios (Em construção)</div>;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="grupos" element={<GroupList />} />
            <Route path="grupos/novo" element={<GroupForm />} />
            <Route path="grupos/:id" element={<GroupDetail />} />
            <Route path="grupos/editar/:id" element={<GroupForm />} />
            <Route path="pacientes" element={<PatientList />} />
            <Route path="pacientes/novo" element={<PatientForm />} />
            <Route path="pacientes/:id" element={<PatientForm />} />
            <Route path="agenda" element={<Calendar />} />
            <Route path="relatorios" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
