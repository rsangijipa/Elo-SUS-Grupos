import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

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
    signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user document using setDoc with specific UID (Security Rule Requirement)
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || 'Usuário Google',
                    avatar: user.photoURL || null, // Using 'avatar' to match User type
                    role: 'patient', // Default role
                    createdAt: new Date().toISOString()
                });
            }

            return user;
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Login cancelado pelo usuário.');
            }
            throw error;
        }
    }
};
