import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    INITIAL_PROFESSIONAL_STATE,
    INITIAL_PATIENT_STATE,
    MOCK_PROFESSIONAL,
    MOCK_PATIENT,
    type User
} from '../utils/seedData';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password?: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for persisted session
        const storedUser = localStorage.getItem('elosus_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user', error);
                localStorage.removeItem('elosus_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        let loggedUser: User;

        // DEMO LOGIC: Check for specific demo emails
        if (email.toLowerCase() === MOCK_PROFESSIONAL.email.toLowerCase()) {
            loggedUser = MOCK_PROFESSIONAL;
        } else if (email.toLowerCase() === MOCK_PATIENT.email.toLowerCase()) {
            loggedUser = MOCK_PATIENT;
        } else {
            // REAL USER LOGIC: Clean state
            // Default to Professional state for new users unless specified otherwise
            // In a real app, this would be determined by the registration flow
            loggedUser = {
                ...INITIAL_PROFESSIONAL_STATE,
                id: `u${Date.now()}`,
                email: email,
                name: email.split('@')[0], // Temporary name from email
                avatar: email.substring(0, 2).toUpperCase()
            };
        }

        setUser(loggedUser);
        localStorage.setItem('elosus_user', JSON.stringify(loggedUser));
        setIsLoading(false);
    };

    const register = async (data: any) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create new user with clean state based on selected role
        const baseState = data.role === 'patient' ? INITIAL_PATIENT_STATE : INITIAL_PROFESSIONAL_STATE;

        const newUser: User = {
            ...baseState,
            id: `u${Date.now()}`,
            name: data.name,
            email: data.email,
            role: data.role || 'professional',
            avatar: data.name.substring(0, 2).toUpperCase()
        };

        setUser(newUser);
        localStorage.setItem('elosus_user', JSON.stringify(newUser));
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('elosus_user');
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('elosus_user', JSON.stringify(updatedUser));
    };

    const toggleRole = () => {
        if (!user) return;

        // For development: switch between mock profiles or just toggle role property
        if (user.email === MOCK_PROFESSIONAL.email) {
            setUser(MOCK_PATIENT);
            localStorage.setItem('elosus_user', JSON.stringify(MOCK_PATIENT));
        } else if (user.email === MOCK_PATIENT.email) {
            setUser(MOCK_PROFESSIONAL);
            localStorage.setItem('elosus_user', JSON.stringify(MOCK_PROFESSIONAL));
        } else {
            // For real users, just toggle the role string and reset to initial state of that role
            const newRole = user.role === 'professional' ? 'patient' : 'professional';
            const baseState = newRole === 'patient' ? INITIAL_PATIENT_STATE : INITIAL_PROFESSIONAL_STATE;

            const updatedUser = {
                ...baseState,
                id: user.id,
                name: user.name,
                email: user.email,
                role: newRole,
                avatar: user.avatar
            };

            setUser(updatedUser);
            localStorage.setItem('elosus_user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
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
