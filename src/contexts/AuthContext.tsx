import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types/user';
import { useNotifications } from './NotificationContext';

const INITIAL_PROFESSIONAL_STATE = {
    crp: '',
    specialty: '',
    approach: '',
    bio: ''
};

const INITIAL_PATIENT_STATE = {
    cns: '',
    emergencyContact: '',
    phone: '',
    address: '',
    neighborhood: '',
    unidadeSaudeId: '',
    status: 'active' as 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout',
    observacoes: ''
};
import { patientService } from '../services/patientService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password?: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    // Deprecated/Mock methods kept for compatibility but might need removal or refactor
    toggleRole: () => void;
    switchDevRole: (type: 'referrer' | 'executor' | 'patient') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotifications();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            id: firebaseUser.uid,
                            ...userData,
                            email: userData.email || firebaseUser.email || ''
                        } as User);
                    } else {
                        // Fallback if user exists in Auth but not in Firestore (shouldn't happen normally)
                        console.warn('User authenticated but no Firestore document found.');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Inactivity Timeout Logic
    useEffect(() => {
        if (!user) return;

        const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('User inactive for 1 minute. Logging out...');
                logout();
                addNotification({
                    type: 'info',
                    title: 'Sessão Expirada',
                    message: 'Você foi desconectado por inatividade.'
                });
            }, INACTIVITY_LIMIT);
        };

        const handleActivity = () => {
            resetTimer();
        };

        // Initial timer start
        resetTimer();

        // Listen for user activity
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, [user]);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            // If password is not provided (e.g. from some old mock calls), use a default or error
            // For the demo buttons, we will ensure they pass the password.
            if (!password) {
                throw new Error('Senha é obrigatória.');
            }
            await signInWithEmailAndPassword(auth, email, password);
            addNotification({
                type: 'success',
                title: 'Login realizado',
                message: 'Bem-vindo de volta!'
            });
        } catch (error: any) {
            console.error('Login error:', error);
            let message = 'Falha ao realizar login.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'E-mail ou senha incorretos.';
            }
            addNotification({
                type: 'alert',
                title: 'Erro no Login',
                message
            });
            setIsLoading(false); // Only set loading to false on error
            throw error;
        }
    };

    const register = async (data: any) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const firebaseUser = userCredential.user;

            const baseState = data.role === 'patient' ? INITIAL_PATIENT_STATE : INITIAL_PROFESSIONAL_STATE;

            const newUser: User = {
                ...baseState,
                id: firebaseUser.uid,
                name: data.name,
                email: data.email,
                role: data.role || 'professional',
                cpf: data.cpf,
                avatar: data.name.substring(0, 2).toUpperCase(),
                // Ensure these fields are present
                unidadeSaudeId: 'all',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // If role is patient, merge patient state
            if (data.role === 'patient') {
                Object.assign(newUser, {
                    cns: data.cns,
                    birthDate: '',
                    sexo: 'Outro',
                    phone: data.phone || '',
                    address: data.address || '',
                    neighborhood: data.neighborhood || '',
                    status: 'active',
                    observacoes: 'Cadastrado via App',
                    emergencyContact: data.emergencyContact || ''
                });
            }

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...newUser,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setUser(newUser);
            addNotification({
                type: 'success',
                title: 'Conta criada',
                message: 'Seu cadastro foi realizado com sucesso.'
            });
        } catch (error: any) {
            console.error('Registration error:', error);
            let message = 'Falha ao criar conta.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Este e-mail já está em uso.';
            }
            addNotification({
                type: 'alert',
                title: 'Erro no Cadastro',
                message
            });
            setIsLoading(false); // Only set loading to false on error, otherwise wait for auth state change
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            addNotification({
                type: 'success',
                title: 'Logout',
                message: 'Você saiu do sistema.'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.id);
            await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
            setUser(prev => prev ? { ...prev, ...data } : null);
            addNotification({
                type: 'success',
                title: 'Perfil atualizado',
                message: 'Seus dados foram salvos.'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            addNotification({
                type: 'alert',
                title: 'Erro',
                message: 'Não foi possível atualizar o perfil.'
            });
        }
    };

    // Deprecated methods - kept empty or logging warning to prevent build errors if used elsewhere
    const toggleRole = () => {
        console.warn('toggleRole is deprecated in production mode.');
    };

    const switchDevRole = (type: 'referrer' | 'executor' | 'patient') => {
        if (!user) return;

        const originalRole = user.originalRole || user.role;
        let newRole: 'professional' | 'patient' | 'admin' = 'professional';
        let additionalData = {};

        if (type === 'patient') {
            newRole = 'patient';
            additionalData = INITIAL_PATIENT_STATE;
        } else {
            // referrer or executor are both professionals
            newRole = 'professional';
            additionalData = INITIAL_PROFESSIONAL_STATE;
        }

        // Preserve ID, Name, Email, and Original Role
        const updatedUser: User = {
            ...user,
            ...additionalData,
            id: user.id,
            name: user.name,
            email: user.email,
            role: newRole,
            originalRole: originalRole,
            // Add specific flags for referrer/executor if needed by UI, 
            // but for now the role switch is mainly about Patient vs Professional.
            // If the UI distinguishes Referrer vs Executor by ID (e.g. doc_ref_01), we might need to mock the ID too,
            // but changing ID breaks Auth. 
            // Instead, we'll rely on the fact that 'professional' role sees the pro dashboard.
        };

        setUser(updatedUser);

        addNotification({
            type: 'info',
            title: 'Modo de Teste',
            message: `Perfil alternado para: ${type === 'patient' ? 'Paciente' : type === 'referrer' ? 'Encaminhador' : 'Executor'}`
        });
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
