import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db } from './firebase';

export interface MoodLog {
    id?: string;
    patientId: string;
    value: 1 | 2 | 3 | 4 | 5; // 1: Angry, 2: Sad, 3: Neutral, 4: Happy, 5: Very Happy
    tags: string[];
    note?: string;
    aiAnalysis?: any; // Stores the JSON result from Gemini
    relatedGroupId?: string;
    createdAt: any;
}

export const moodService = {
    logMood: async (data: Omit<MoodLog, 'id' | 'createdAt'>) => {
        try {
            // 1. Save Mood Log
            const docRef = await addDoc(collection(db, `users/${data.patientId}/mood_logs`), {
                ...data,
                createdAt: serverTimestamp()
            });

            // 2. Check Risk Alert
            await moodService.checkRiskAlert(data.patientId);

            return docRef.id;
        } catch (error) {
            console.error("Error logging mood:", error);
            throw error;
        }
    },

    getPatientHistory: async (patientId: string, limitCount: number = 15) => {
        try {
            const q = query(
                collection(db, `users/${patientId}/mood_logs`),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MoodLog));
        } catch (error) {
            console.error("Error fetching mood history:", error);
            throw error;
        }
    },

    checkRiskAlert: async (patientId: string) => {
        try {
            // Get last 3 logs
            const history = await moodService.getPatientHistory(patientId, 3);

            if (history.length < 3) return;

            const sum = history.reduce((acc, curr) => acc + curr.value, 0);
            const average = sum / history.length;

            // If average < 2 (mostly 1s and 2s), flag alert
            if (average < 2) {
                const userRef = doc(db, 'users', patientId);
                await updateDoc(userRef, {
                    hasAlert: true
                });
            }
        } catch (error) {
            console.error("Error checking risk alert:", error);
            // Don't throw here to avoid blocking the UI if risk check fails
        }
    }
};
