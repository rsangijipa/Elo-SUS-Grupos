import {
    collection,
    addDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface AttendanceRecord {
    status: 'present' | 'absent' | 'excused';
    notes?: string;
}

export interface Session {
    id?: string;
    date: string; // ISO Date string
    topic?: string;
    attendanceList: {
        [patientId: string]: AttendanceRecord;
    };
    createdAt?: any;
}

export const attendanceService = {
    saveSession: async (groupId: string, session: Omit<Session, 'id' | 'createdAt'>) => {
        const sessionsRef = collection(db, 'grupos', groupId, 'sessions');
        const docRef = await addDoc(sessionsRef, {
            ...session,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    getSessions: async (groupId: string) => {
        const sessionsRef = collection(db, 'grupos', groupId, 'sessions');
        const q = query(sessionsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Session));
    }
};
