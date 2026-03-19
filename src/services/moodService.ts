import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    updateDoc,
    doc,
    Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import { withErrorHandling } from '../utils/errorHandler';
import { toJsDate } from '../utils/dateUtils';

export interface MoodLog {
    id?: string;
    patientId: string;
    value: 1 | 2 | 3 | 4 | 5; // 1: Angry, 2: Sad, 3: Neutral, 4: Happy, 5: Very Happy
    tags: string[];
    note?: string;
    aiAnalysis?: unknown; // Stores the JSON result from Gemini
    relatedGroupId?: string;
    createdAt: Timestamp | null;
}

export const moodService = {
    logMood: async (data: Omit<MoodLog, 'id' | 'createdAt'>) => {
        return withErrorHandling(async () => {
            // 1. Save Mood Log
            const docRef = await addDoc(collection(db, `users/${data.patientId}/mood_logs`), {
                ...data,
                createdAt: serverTimestamp()
            });

            // 2. Check Risk Alert
            await moodService.checkRiskAlert(data.patientId);

            return docRef.id;
        });
    },

    getPatientHistory: async (patientId: string, limitCount: number = 15) => {
        return withErrorHandling(async () => {
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
        }, [] as MoodLog[]);
    },

    checkRiskAlert: async (patientId: string) => {
        return withErrorHandling(async () => {
            // Get last 3 logs
            const history = await moodService.getPatientHistory(patientId, 3);

            if (history.length < 3) return;

            const sum = history.reduce((acc, curr) => acc + curr.value, 0);
            const average = sum / history.length;

            // If average < 2 (mostly 1s and 2s), flag alert
            if (average < 2) {
                const userRef = doc(db, COLLECTIONS.USERS, patientId);
                await updateDoc(userRef, {
                    hasAlert: true
                });
            }
        }, undefined);
    },

    getConsecutiveMoodDays: async (patientId: string): Promise<number> => {
        return withErrorHandling(async () => {
            const history = await moodService.getPatientHistory(patientId, 30);
            if (history.length === 0) {
                return 0;
            }

            const normalizedDays = Array.from(new Set(history
                .map((entry) => toJsDate(entry.createdAt))
                .filter((date): date is Date => !!date)
                .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime())))
                .sort((a, b) => b - a);

            if (normalizedDays.length === 0) {
                return 0;
            }

            let streak = 1;
            for (let index = 1; index < normalizedDays.length; index += 1) {
                const previousDay = normalizedDays[index - 1];
                const currentDay = normalizedDays[index];
                const diffDays = (previousDay - currentDay) / (1000 * 60 * 60 * 24);

                if (diffDays === 1) {
                    streak += 1;
                } else {
                    break;
                }
            }

            return streak;
        }, 0);
    }
};
