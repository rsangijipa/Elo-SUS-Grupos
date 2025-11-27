import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit, addDoc } from 'firebase/firestore';

export interface MoodEntry {
    date: string;
    moodScore: number;
    sleepHours: number;
    notes?: string;
}

export const moodService = {
    getMoodHistory: async (patientId: string): Promise<MoodEntry[]> => {
        try {
            const q = query(
                collection(db, 'mood_logs'),
                where('patientId', '==', patientId),
                orderBy('date', 'desc'),
                limit(7)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => d.data() as MoodEntry).reverse(); // Return chronological order
        } catch (error) {
            console.error('Error fetching mood history:', error);
            return [];
        }
    },

    addMoodEntry: async (patientId: string, entry: Omit<MoodEntry, 'date'>) => {
        // Helper to add data for testing/usage
        const date = new Date().toISOString().split('T')[0];
        await addDoc(collection(db, 'mood_logs'), {
            patientId,
            date,
            ...entry,
            createdAt: new Date()
        });
    }
};
