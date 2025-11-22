import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfessionalDashboard from './Dashboard/ProfessionalDashboard';
import PatientDashboard from './Dashboard/PatientDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <>
            {user.role === 'professional' ? (
                <ProfessionalDashboard key="professional" />
            ) : (
                <PatientDashboard key="patient" />
            )}
        </>
    );
};

export default Dashboard;
