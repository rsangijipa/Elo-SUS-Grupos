import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    INITIAL_PROFESSIONAL_STATE,
    INITIAL_PATIENT_STATE,
    MOCK_PROFESSIONAL,
    MOCK_PATIENT,
    MOCK_GROUPS,
    MOCK_PATIENTS,
    MOCK_APPOINTMENTS,
    type User,
    type Patient,
    type Appointment
} from '../utils/seedData';
import { Group } from '../types/group';

interface Database {
    user: User | null;
    groups: Group[];
    patients: Patient[];
    appointments: Appointment[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    db: Database;
    login: (email: string, password?: string, role?: 'professional' | 'patient') => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleRole: () => void;
    switchDevRole: (type: 'referrer' | 'executor' | 'patient') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'elosus_db';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<Database>({
        user: null,
        groups: [],
        patients: [],
        appointments: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load from localStorage on mount
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                setDb(JSON.parse(storedData));
            } catch (error) {
                console.error('Failed to parse stored DB', error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Helper to save DB to state and localStorage
    const saveDb = (newDb: Database) => {
        setDb(newDb);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    };

    const login = async (email: string, password?: string, role?: 'professional' | 'patient') => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API

        let newDb: Database;

        // 🚨 DEMO MODE (Admin / Dev)
        if (email.toLowerCase() === 'admin@elosus.gov.br' || email.toLowerCase() === 'doll.ricardoll@gmail.com') {
            console.log("🔐 LOGGING IN AS DEMO ADMIN");
            newDb = {
                user: MOCK_PROFESSIONAL,
                groups: MOCK_GROUPS,
                patients: MOCK_PATIENTS,
                appointments: MOCK_APPOINTMENTS
            };
        }
        // 🚨 DEMO PATIENT
        else if (email.toLowerCase() === 'paciente@elosus.gov.br') {
            console.log("👤 LOGGING IN AS DEMO PATIENT");
            newDb = {
                user: MOCK_PATIENT,
                groups: [],
                patients: [],
                appointments: MOCK_APPOINTMENTS
            };
        }
        // 🌍 REAL USER (PRODUCTION)
        else {
            console.log("🌍 LOGGING IN AS REAL USER (CLEAN STATE)");

            // Check if we already have data for this user in our "Local DB"
            if (db.user && db.user.email === email) {
                newDb = { ...db }; // Keep existing state
            } else {
                // NEW USER -> CLEAN SLATE (No Dr. Joao's patients!)
                const newUser: User = {
                    ...(role === 'patient' ? INITIAL_PATIENT_STATE : INITIAL_PROFESSIONAL_STATE),
                    id: `u${Date.now()}`,
                    email: email,
                    name: email.split('@')[0],
                    role: role || 'professional',
                    avatar: undefined // No avatar initially
                };
                newDb = {
                    user: newUser,
                    groups: [],
                    patients: [],
                    appointments: []
                };
            }
        }

        saveDb(newDb);
        setIsLoading(false);
    };

    const register = async (data: any) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const baseState = data.role === 'patient' ? INITIAL_PATIENT_STATE : INITIAL_PROFESSIONAL_STATE;

        const newUser: User = {
            ...baseState,
            id: `u${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            email: data.email,
            role: data.role || 'professional',
            cpf: data.cpf,
            avatar: data.name.substring(0, 2).toUpperCase()
        };

        // Initialize with EMPTY arrays
        const newDb: Database = {
            user: newUser,
            groups: [],
            patients: [],
            appointments: []
        };

        saveDb(newDb);
        setIsLoading(false);
    };

    const logout = () => {
        // We might want to keep the DB in localStorage even after logout for persistence across sessions,
        // but clear the 'user' object to signify logged out. 
        // However, for this simple auth flow, let's just clear the user from state.
        // If we want to support multiple users on same browser, we'd need a better structure.
        // For now, let's clear the current session user but keep data if we wanted (omitted for simplicity).

        // Actually, to be safe and simple:
        setDb(prev => ({ ...prev, user: null }));
        // We update localStorage to reflect logged out state
        const newDb = { ...db, user: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!db.user) return;
        const updatedUser = { ...db.user, ...data };
        const newDb = { ...db, user: updatedUser };
        saveDb(newDb);
    };

    const toggleRole = () => {
        if (!db.user) return;

        // Simple toggle for dev purposes
        const newRole = db.user.role === 'professional' ? 'patient' : 'professional';
        const baseState = newRole === 'patient' ? INITIAL_PATIENT_STATE : INITIAL_PROFESSIONAL_STATE;

        const updatedUser = {
            ...db.user,
            ...baseState,
            role: newRole as 'professional' | 'patient'
        };

        const newDb = { ...db, user: updatedUser };
        saveDb(newDb);
    };

    const switchDevRole = (type: 'referrer' | 'executor' | 'patient') => {
        let newUser: User;

        if (type === 'referrer') {
            newUser = {
                ...INITIAL_PROFESSIONAL_STATE,
                id: 'doc_ref_01',
                name: 'Dr. Encaminhador',
                email: 'medico@ubs.sus.gov.br',
                role: 'professional',
                avatar: 'DR',
                crp: 'CRM 12345' // Mock CRM
            };
        } else if (type === 'executor') {
            newUser = {
                ...MOCK_PROFESSIONAL, // Use the mock professional as the executor (Therapist)
                id: 'psi_exec_01',
                name: 'Psi. Atendente',
                email: 'psi@caps.sus.gov.br',
                role: 'professional',
                avatar: 'PS',
                crp: 'CRP 06/12345'
            };
        } else {
            newUser = {
                ...MOCK_PATIENT,
                id: 'pat_01',
                name: 'Paciente Teste',
                email: 'paciente@email.com',
                role: 'patient',
                avatar: 'PA'
            };
        }

        const newDb = { ...db, user: newUser };
        // If switching to executor, ensure groups are loaded (mock groups)
        if (type === 'executor' && newDb.groups.length === 0) {
            newDb.groups = MOCK_GROUPS;
        }

        saveDb(newDb);
    };

    return (
        <AuthContext.Provider value={{
            user: db.user,
            isAuthenticated: !!db.user,
            isLoading,
            db,
            login,
            register,
            logout,
            updateProfile,
            toggleRole,
            switchDevRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
