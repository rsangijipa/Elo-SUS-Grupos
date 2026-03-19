import {
    collection,
    addDoc,
    getCountFromServer,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { QuizResult } from '../types/quiz';
import { COLLECTIONS } from '../constants/collections';
import { withErrorHandling } from '../utils/errorHandler';

export const quizService = {
    saveQuizResult: async (userId: string, result: Omit<QuizResult, 'id' | 'createdAt'>) => {
        return withErrorHandling(async () => {
            const docRef = await addDoc(collection(db, `users/${userId}/quiz_results`), {
                ...result,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        });
    },

    getLatestQuizResult: async (userId: string): Promise<QuizResult | null> => {
        return withErrorHandling(async () => {
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
        }, null);
    },

    getQuizResultById: async (userId: string, quizId: string): Promise<QuizResult | null> => {
        return withErrorHandling(async () => {
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
        }, null);
    },

    getCompletedCount: async (userId: string): Promise<number> => {
        return withErrorHandling(async () => {
            const countSnapshot = await getCountFromServer(collection(db, COLLECTIONS.USERS, userId, 'quiz_results'));
            return countSnapshot.data().count;
        }, 0);
    }
};
