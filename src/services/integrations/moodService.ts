import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface MoodEntry {
    date: string;
    moodScore: number;
    sleepHours: number;
    notes?: string;
}

export const moodService = {
    getMoodHistory: async (patientId: string): Promise<MoodEntry[]> => {
        // Future implementation: fetch from 'mood_logs' collection
        // const q = query(collection(db, 'mood_logs'), where('patientId', '==', patientId), orderBy('date', 'desc'), limit(7));
        // const snapshot = await getDocs(q);
        // return snapshot.docs.map(d => d.data() as MoodEntry);

        // For now, return a generated "demo" history based on recent dates
        // This preserves the "demo" functionality but structures it as a service
        const today = new Date();
        const history: MoodEntry[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Randomized realistic data
            const sleep = 6 + Math.random() * 3; // 6-9 hours
            const mood = sleep > 7 ? 7 + Math.random() * 3 : 4 + Math.random() * 4;

            history.push({
                date: dateStr,
                moodScore: Number(mood.toFixed(1)),
                sleepHours: Number(sleep.toFixed(1))
            });
        }

        return history;
    }
};
