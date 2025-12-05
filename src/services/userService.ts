import {
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    startAt,
    endAt,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types/schema';

export const userService = {
    searchUsers: async (searchTerm: string): Promise<UserProfile[]> => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const usersRef = collection(db, 'users');
        let q;

        // Email search (Exact match)
        if (searchTerm.includes('@')) {
            q = query(
                usersRef,
                where('email', '==', searchTerm),
                limit(5)
            );
        } else {
            // Name search (Starts with)
            q = query(
                usersRef,
                where('name', '>=', searchTerm),
                where('name', '<=', searchTerm + '\uf8ff'),
                limit(5)
            );
        }

        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserProfile));
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    },

    getProfessionals: async () => {
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'professional'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserProfile));
        } catch (error) {
            console.error("Error fetching professionals:", error);
            throw error;
        }
    },

    updateStatus: async (userId: string, status: boolean) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                active: status
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            throw error;
        }
    },

    updateUserData: async (userId: string, data: Partial<UserProfile>) => {
        try {
            const userRef = doc(db, 'users', userId);
            // Remove undefined fields to avoid Firestore errors
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            await updateDoc(userRef, {
                ...cleanData,
                updatedAt: new Date() // Use serverTimestamp() in real app, but Date is fine for now if consistent
            });
        } catch (error) {
            console.error("Error updating user data:", error);
            throw error;
        }
    }
};
