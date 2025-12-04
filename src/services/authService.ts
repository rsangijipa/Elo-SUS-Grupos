import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
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
    }
};
