import {
    collection,
    query,
    where,
    getDocs,
    limit,
    updateDoc,
    doc
} from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import { UserProfile } from '../types/schema';
import { withErrorHandling } from '../utils/errorHandler';

export const userService = {
    searchUsers: async (searchTerm: string): Promise<UserProfile[]> => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const usersRef = collection(db, COLLECTIONS.USERS);
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

        return withErrorHandling(async () => {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserProfile));
        }, [] as UserProfile[]);
    },

    getProfessionals: async () => {
        return withErrorHandling(async () => {
            const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'professional'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserProfile));
        }, [] as UserProfile[]);
    },

    updateStatus: async (userId: string, status: boolean) => {
        return withErrorHandling(async () => {
            const userRef = doc(db, COLLECTIONS.USERS, userId);
            await updateDoc(userRef, {
                active: status
            });
        });
    },

    updateUserData: async (userId: string, data: Partial<UserProfile>) => {
        return withErrorHandling(async () => {
            const userRef = doc(db, COLLECTIONS.USERS, userId);
            // Remove undefined fields to avoid Firestore errors
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([, v]) => v !== undefined)
            );

            await updateDoc(userRef, {
                ...cleanData,
                updatedAt: new Date() // Use serverTimestamp() in real app, but Date is fine for now if consistent
            });
        });
    }
};
