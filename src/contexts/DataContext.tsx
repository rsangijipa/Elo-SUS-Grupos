import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    Group,
    Patient,
    Appointment,
    MOCK_GROUPS,
    DEMO_PATIENTS,
    MOCK_APPOINTMENTS
} from '../utils/seedData';
import { useAuth } from './AuthContext';

interface DataContextType {
    groups: Group[];
    patients: Patient[];
    appointments: Appointment[];
    loading: boolean;
    addGroup: (group: Omit<Group, 'id'>) => void;
    addPatient: (patient: Omit<Patient, 'id'>) => void;
    addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    deletePatient: (id: string) => void;
    refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
    GROUPS: 'elosus_groups',
    PATIENTS: 'elosus_patients',
    APPOINTMENTS: 'elosus_appointments'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    // Load data from localStorage or seed if empty/demo
    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = () => {
        setLoading(true);

        // Try to load from localStorage
        const storedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
        const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
        const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);

        if (storedGroups) setGroups(JSON.parse(storedGroups));
        else {
            setGroups(MOCK_GROUPS);
            localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(MOCK_GROUPS));
        }

        if (storedPatients) setPatients(JSON.parse(storedPatients));
        else {
            setPatients(DEMO_PATIENTS);
            localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(DEMO_PATIENTS));
        }

        if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
        else {
            setAppointments(MOCK_APPOINTMENTS);
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
        }

        setLoading(false);
    };

    const addGroup = (groupData: Omit<Group, 'id'>) => {
        const newGroup: Group = {
            ...groupData,
            id: `g${Date.now()}`
        };
        const updatedGroups = [...groups, newGroup];
        setGroups(updatedGroups);
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updatedGroups));
    };

    const addPatient = (patientData: Omit<Patient, 'id'>) => {
        const newPatient: Patient = {
            ...patientData,
            id: `p${Date.now()}`
        };
        const updatedPatients = [newPatient, ...patients]; // Add to top
        setPatients(updatedPatients);
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));
    };

    const updatePatient = (id: string, data: Partial<Patient>) => {
        const updatedPatients = patients.map(p => p.id === id ? { ...p, ...data } : p);
        setPatients(updatedPatients);
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));
    };

    const deletePatient = (id: string) => {
        const updatedPatients = patients.filter(p => p.id !== id);
        setPatients(updatedPatients);
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));
    };

    const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
        const newAppointment: Appointment = {
            ...appointmentData,
            id: `a${Date.now()}`
        };
        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
    };

    const refreshData = () => {
        loadData();
    };

    return (
        <DataContext.Provider value={{
            groups,
            patients,
            appointments,
            loading,
            addGroup,
            addPatient,
            addAppointment,
            updatePatient,
            deletePatient,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
