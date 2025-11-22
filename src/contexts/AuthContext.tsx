import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, MOCK_PROFESSIONAL, MOCK_PATIENT } from '../utils/seedData';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
    toggleRole: () => void; // Dev mode helper
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

    const login = async (email: string, _password: string) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock login logic:
        // If email contains 'paciente', log in as patient, otherwise default to professional
        const isPatient = email.toLowerCase().includes('paciente') || email.toLowerCase().includes('maria');

        const baseUser = isPatient ? MOCK_PATIENT : MOCK_PROFESSIONAL;

        const loggedUser: User = {
            ...baseUser,
            email: email // Use the entered email but keep other mock data
        };

        setUser(loggedUser);
        localStorage.setItem('elosus_user', JSON.stringify(loggedUser));
        setIsLoading(false);
    };

    const register = async (data: any) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Default new registrations to professional for now, or infer from data
        const newUser: User = {
            id: `u${Date.now()}`,
            name: data.name,
            email: data.email,
            role: 'professional', // Default role
            crp: data.crp,
            approach: data.approach,
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

    const updateProfile = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('elosus_user', JSON.stringify(updatedUser));
        }
    };

    const toggleRole = () => {
        if (!user) return;

        const newRole = user.role === 'professional' ? 'patient' : 'professional';
        const newUserTemplate = newRole === 'professional' ? MOCK_PROFESSIONAL : MOCK_PATIENT;

        // Preserve ID and Name if we want, or just swap completely for the mock
        // Swapping completely is safer for the mock data structure consistency
        const updatedUser = {
            ...newUserTemplate,
            // Optional: keep some session specific stuff if needed, but for now clean swap is better
        };

        setUser(updatedUser);
        localStorage.setItem('elosus_user', JSON.stringify(updatedUser));

        // Force reload to ensure all components re-render with correct role context if needed
        // window.location.reload(); 
        // Actually, React state update should be enough if components listen to user.role
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
