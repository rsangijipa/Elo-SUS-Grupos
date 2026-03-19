import {
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { auth, db } from './firebase';
import { UserProfile } from '../types/schema';
import { handleFirebaseError } from '../utils/errorHandler';

export const authService = {
    reauthenticateUser: async (password: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('Usuário não autenticado.');

        const credential = EmailAuthProvider.credential(user.email, password);
        try {
            await reauthenticateWithCredential(user, credential);
        } catch (error: unknown) {
            throw new Error(handleFirebaseError(error) || 'Senha atual incorreta.');
        }
    },
    updateUserPassword: async (newPassword: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado.');

        try {
            await updatePassword(user, newPassword);
        } catch (error: unknown) {
            if (error instanceof Error && (error as any).code === 'auth/requires-recent-login') {
                throw new Error('REQ_LOGIN');
            }
            throw new Error(handleFirebaseError(error));
        }
    },
    sendResetPassword: async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: unknown) {
            throw new Error(handleFirebaseError(error));
        }
    },
    signInWithGoogle: async (expectedRole: UserProfile['role'] = 'patient'): Promise<UserProfile> => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user document using setDoc with specific UID (Security Rule Requirement)
                const newUserData: UserProfile = {
                    uid: user.uid,
                    id: user.uid,
                    name: user.displayName || 'Usuário Google',
                    email: user.email || '',
                    role: expectedRole,
                    originalRole: expectedRole,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                    // Default fields
                    stats: {
                        xp: 0,
                        level: 1,
                        completedChallenges: 0,
                        streakDays: 0
                    }
                };
                await setDoc(userDocRef, newUserData);
                return newUserData;
            } else {
                const existingUser = userDoc.data() as UserProfile;

                if (existingUser.role !== expectedRole) {
                    await auth.signOut();
                    const actualLabel = existingUser.role === 'professional' ? 'profissional' : existingUser.role === 'patient' ? 'paciente' : 'administrador';
                    throw new Error(`Este cadastro Google pertence ao perfil ${actualLabel}. Selecione esse perfil para entrar.`);
                }

                return existingUser;
            }
        } catch (error: unknown) {
            if (error instanceof Error && (error as any).code === 'auth/popup-closed-by-user') {
                throw new Error('Login cancelado pelo usuário.');
            }
            throw new Error(handleFirebaseError(error));
        }
    }
};
