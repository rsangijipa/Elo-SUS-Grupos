import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types/schema';

export const authService = {
    reauthenticateUser: async (password: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('Usuário não autenticado.');

        const credential = EmailAuthProvider.credential(user.email, password);
        try {
            await reauthenticateWithCredential(user, credential);
        } catch (error: any) {
            console.error("Error reauthenticating:", error);
            throw new Error('Senha atual incorreta.');
        }
    },
    updateUserPassword: async (newPassword: string) => {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado.');

        try {
            await updatePassword(user, newPassword);
        } catch (error: any) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/requires-recent-login') {
                throw new Error('REQ_LOGIN');
            }
            throw error;
        }
    },
    signInWithGoogle: async (): Promise<UserProfile> => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user document using setDoc with specific UID (Security Rule Requirement)
                const newUserData: UserProfile = {
                    uid: user.uid,
                    id: user.uid,
                    name: user.displayName || 'Usuário Google',
                    email: user.email || '',
                    role: 'patient',
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
                return userDoc.data() as UserProfile;
            }
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Login cancelado pelo usuário.');
            }
            throw error;
        }
    }
};
