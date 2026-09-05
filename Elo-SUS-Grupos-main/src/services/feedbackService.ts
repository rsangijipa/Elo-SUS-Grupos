import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

export interface SessionFeedback {
    id?: string;
    patientId: string;
    sessionId: string;
    rating: 'sad' | 'neutral' | 'happy';
    tags: string[];
    comment?: string;
    createdAt?: any;
}

export const feedbackService = {
    /**
     * Submit a new feedback for a session
     */
    submitFeedback: async (groupId: string, feedback: SessionFeedback) => {
        try {
            const feedbackRef = collection(db, COLLECTIONS.GROUPS, groupId, 'feedback');
            await addDoc(feedbackRef, {
                ...feedback,
                createdAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    },

    /**
     * Check if patient has already given feedback for a specific session
     */
    hasGivenFeedback: async (groupId: string, sessionId: string, patientId: string): Promise<boolean> => {
        try {
            const feedbackRef = collection(db, COLLECTIONS.GROUPS, groupId, 'feedback');
            const q = query(
                feedbackRef,
                where('sessionId', '==', sessionId),
                where('patientId', '==', patientId),
                limit(1)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking feedback status:', error);
            return false;
        }
    }
};
