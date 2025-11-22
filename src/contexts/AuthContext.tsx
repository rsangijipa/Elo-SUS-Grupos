import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, MOCK_USER } from '../utils/seedData';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
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

        // Mock login success - In a real app, validate credentials here
        const loggedUser: User = {
            ...MOCK_USER,
            email: email // Use the entered email
        };

        setUser(loggedUser);
        localStorage.setItem('elosus_user', JSON.stringify(loggedUser));
        setIsLoading(false);
    };

    const register = async (data: any) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newUser: User = {
            id: `u${Date.now()}`,
            name: data.name,
            email: data.email,
            role: 'psychologist',
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

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            updateProfile
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
