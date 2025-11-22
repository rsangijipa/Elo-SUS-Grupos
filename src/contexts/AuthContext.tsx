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
    type Group,
    type Patient,
    type Appointment
} from '../utils/seedData';

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
    login: (email: string, password?: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleRole: () => void;
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

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API

        let newDb: Database;

        // DEMO LOGIC
        if (email.toLowerCase() === MOCK_PROFESSIONAL.email.toLowerCase()) {
            newDb = {
                user: MOCK_PROFESSIONAL,
                groups: MOCK_GROUPS,
                patients: MOCK_PATIENTS,
                appointments: MOCK_APPOINTMENTS
            };
        } else if (email.toLowerCase() === MOCK_PATIENT.email.toLowerCase()) {
            newDb = {
                user: MOCK_PATIENT,
                groups: [], // Patients don't manage groups
                patients: [],
                appointments: MOCK_APPOINTMENTS // In real app, filter for this patient
            };
        } else {
            // REAL USER LOGIC - Check if we already have data for this user in our "DB" (localStorage)
            // For this MVP, we are just checking if the *current* stored user matches. 
            // In a real app, we'd look up by email in a users array.
            if (db.user && db.user.email === email) {
                newDb = { ...db }; // Keep existing state
            } else {
                // Completely new session/user -> Clean State
                const newUser: User = {
                    ...INITIAL_PROFESSIONAL_STATE,
                    id: `u${Date.now()}`,
                    email: email,
                    name: email.split('@')[0],
                    avatar: email.substring(0, 2).toUpperCase()
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
            id: `u${Date.now()}`,
            name: data.name,
            email: data.email,
            role: data.role || 'professional',
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
            toggleRole
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
