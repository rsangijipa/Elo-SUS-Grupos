import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types/schema';
import toast from 'react-hot-toast';
import type { UserRole } from '../types/shared';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    cpf?: string;
    crp?: string;
    cns?: string;
}

// Helper to determine the initial state for a role
const getInitialProfile = (uid: string, email: string, name: string, role: UserRole) => {
    const base = {
        uid, id: uid, email, name, role,
        avatar: name.substring(0, 2).toUpperCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
    
    if (role === 'patient') {
        return { ...base, cns: '', status: 'active', neighborhood: '', phone: '' };
    }
    return { ...base, crp: '', specialty: '', approach: '', bio: '' };
};

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password?: string, expectedRole?: UserRole) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    refreshData: () => Promise<void>;
    /** @deprecated Disponivel apenas em DEV. */
    toggleRole: () => void;
    /** @deprecated Disponivel apenas em DEV. */
    switchDevRole: (type: 'patient' | 'executor' | 'referrer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isSubscribed = true;
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const docRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        if (isSubscribed) {
                            setUser({ id: firebaseUser.uid, ...docSnap.data() } as UserProfile);
                        }
                    } else if (import.meta.env.DEV) {
                        // RECOVERY MODE for DEV: If doc is missing but user exists in Auth, try to recreate it
                        console.warn(`[AuthProvider] Missing profile for ${firebaseUser.uid}. Attempting recovery...`);
                        const role: UserRole = firebaseUser.email?.includes('admin') ? 'admin' : 
                                             firebaseUser.email?.includes('prof') ? 'professional' : 'patient';
                        
                        const recoveryProfile = getInitialProfile(
                            firebaseUser.uid, 
                            firebaseUser.email || '', 
                            firebaseUser.displayName || 'Demo User', 
                            role
                        );
                        
                        await setDoc(docRef, recoveryProfile);
                        if (isSubscribed) setUser(recoveryProfile as any);
                    } else {
                        // Prod behavior: clean logout if corrupted
                        await signOut(auth);
                        if (isSubscribed) setUser(null);
                    }
                } catch (error) {
                    console.error('[Auth] Profile error:', error);
                    if (isSubscribed) setUser(null);
                    setIsLoading(false);
                    return;
                }
            } else {
                if (isSubscribed) setUser(null);
            }
            if (isSubscribed) setIsLoading(false);
        });

        return () => { isSubscribed = false; unsubscribe(); };
    }, []);

    const login = async (email: string, password?: string, expectedRole?: UserRole) => {
        if (!password) throw new Error('Senha obrigatoria');

        const credentials = await signInWithEmailAndPassword(auth, email, password);

        if (expectedRole) {
            const profileRef = doc(db, COLLECTIONS.USERS, credentials.user.uid);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) {
                await signOut(auth);
                throw new Error('Perfil de usuario nao encontrado.');
            }

            const profile = profileSnap.data() as UserProfile;
            if (profile.role !== expectedRole) {
                await signOut(auth);
                const selectedLabel = expectedRole === 'professional' ? 'profissional' : expectedRole === 'patient' ? 'paciente' : 'administrador';
                const actualLabel = profile.role === 'professional' ? 'profissional' : profile.role === 'patient' ? 'paciente' : 'administrador';
                throw new Error(`Este cadastro pertence ao perfil ${actualLabel}. Use a opcao ${actualLabel} para entrar, nao ${selectedLabel}.`);
            }
        }

        toast.success('Bem-vindo!');
    };

    const register = async (data: RegisterData) => {
        const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const normalizedRole: UserRole = data.role === 'professional' ? 'professional' : data.role === 'admin' ? 'admin' : 'patient';
        const profile = getInitialProfile(res.user.uid, data.email, data.name, normalizedRole);
        
        // Merge with registration fields (CPF, CNS, etc.)
        const finalProfile = { ...profile, ...data, role: normalizedRole, originalRole: normalizedRole };
        delete (finalProfile as any).password;
        
        await setDoc(doc(db, COLLECTIONS.USERS, res.user.uid), finalProfile);
        setUser(finalProfile as any);
        toast.success('Cadastrado!');
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        toast.success('Sessao encerrada');
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;
        try {
            await setDoc(doc(db, COLLECTIONS.USERS, user.id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
            setUser(prev => prev ? { ...prev, ...data } : null);
            toast.success('Salvo!');
        } catch (error) {
            toast.error('Erro ao salvar');
        }
    };

    const devOnlyError = () => new Error('Disponivel apenas em DEV');

    const toggleRole = () => {
        if (!import.meta.env.DEV) {
            throw devOnlyError();
        }
        if (!user) return;

        const nextRole = user.role === 'patient' ? 'professional' : 'patient';
        console.warn(`[DEV][${new Date().toISOString()}] toggleRole chamado por ${user.id}`);
        setUser({ ...user, role: nextRole } as UserProfile);
    };

    const switchDevRole = (type: 'patient' | 'executor' | 'referrer') => {
        if (!import.meta.env.DEV) {
            throw devOnlyError();
        }
        if (!user) return;

        const role: UserRole = type === 'patient' ? 'patient' : 'professional';
        console.warn(`[DEV][${new Date().toISOString()}] switchDevRole(${type}) chamado por ${user.id}`);
        setUser({ ...user, role, originalRole: user.originalRole || user.role } as UserProfile);
    };

    const refreshData = async () => {
        if (!user) return;
        const d = await getDoc(doc(db, COLLECTIONS.USERS, user.id));
        if (d.exists()) setUser({ id: user.id, ...d.data() } as any);
    };

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile, refreshData, toggleRole, switchDevRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const c = useContext(AuthContext);
    if (!c) throw new Error('useAuth must be used within an AuthProvider');
    return c;
};
