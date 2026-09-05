import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    collectionGroup,
    Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import { withErrorHandling } from '../utils/errorHandler';

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
    createdAt?: Timestamp | null;
}

export const attendanceService = {
    saveSession: async (groupId: string, session: Omit<Session, 'id' | 'createdAt'>) => {
        return withErrorHandling(async () => {
            const sessionsRef = collection(db, COLLECTIONS.GROUPS, groupId, COLLECTIONS.SESSIONS);
            const docRef = await addDoc(sessionsRef, {
                ...session,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        });
    },

    getSessions: async (groupId: string) => {
        return withErrorHandling(async () => {
            const sessionsRef = collection(db, COLLECTIONS.GROUPS, groupId, COLLECTIONS.SESSIONS);
            const q = query(sessionsRef, orderBy('date', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Session));
        }, [] as Session[]);
    },

    hasRegularAttendance: async (patientId: string): Promise<boolean> => {
        return withErrorHandling(async () => {
            const snapshot = await getDocs(collectionGroup(db, COLLECTIONS.SESSIONS));
            const groupedStats = new Map<string, { total: number; present: number }>();

            snapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data() as Session;
                const attendance = data.attendanceList?.[patientId];
                if (!attendance) {
                    return;
                }

                const groupId = docSnapshot.ref.parent.parent?.id;
                if (!groupId) {
                    return;
                }

                const current = groupedStats.get(groupId) || { total: 0, present: 0 };
                current.total += 1;
                if (attendance.status === 'present') {
                    current.present += 1;
                }
                groupedStats.set(groupId, current);
            });

            return Array.from(groupedStats.values()).some((group) => group.total > 0 && group.present / group.total >= 0.8);
        }, false);
    }
};
