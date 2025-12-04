import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { QuizResult } from '../types/quiz';

export const quizService = {
    saveQuizResult: async (userId: string, result: Omit<QuizResult, 'id' | 'createdAt'>) => {
        try {
            const docRef = await addDoc(collection(db, `users/${userId}/quiz_results`), {
                ...result,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error saving quiz result:", error);
            throw error;
        }
    },

    getLatestQuizResult: async (userId: string): Promise<QuizResult | null> => {
        try {
            const q = query(
                collection(db, `users/${userId}/quiz_results`),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as QuizResult;
        } catch (error) {
            console.error("Error fetching quiz result:", error);
            return null;
        }
    },

    getQuizResultById: async (userId: string, quizId: string): Promise<QuizResult | null> => {
        try {
            const q = query(
                collection(db, `users/${userId}/quiz_results`),
                where('quizId', '==', quizId),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as QuizResult;
        } catch (error) {
            console.error(`Error fetching quiz result for ${quizId}:`, error);
            return null;
        }
    }
};
