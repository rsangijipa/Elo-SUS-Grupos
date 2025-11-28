import {
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    startAt,
    endAt
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types/user';

export const userService = {
    searchUsers: async (searchTerm: string): Promise<User[]> => {
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
            // Firestore range query for "starts with"
            const strSearch = searchTerm.toLowerCase();
            const strEnd = strSearch + '\uf8ff';

            // Note: This assumes you have a lowercase field or are searching case-sensitive.
            // For true case-insensitive search in Firestore without third-party (Algolia), 
            // we usually store a 'nameLower' field. 
            // For now, assuming the user types correctly or we match against 'name'.
            // If 'name' is mixed case, this range query might be tricky without a normalized field.
            // Let's try matching against 'name' directly for now, assuming standard capitalization or exact start.
            // A better approach for production is to store `searchKey: name.toLowerCase()` on the user doc.

            // Let's assume we search on 'name' field.
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
            } as User));
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    }
};
