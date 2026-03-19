import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy,
    limit,
    type QueryConstraint
} from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import type { Session, Attendance } from '../types/session';
import type { FirestoreDate } from '../types/shared';

const SESSIONS_COLLECTION = COLLECTIONS.SESSIONS;
const ATTENDANCE_COLLECTION = 'presencasSessao';

export interface SessionRecord {
    id?: string;
    groupId: string;
    date: string;
    attendance: Record<string, 'present' | 'absent' | 'justified'>;
    evolution: string;
    checklist: Record<string, boolean>;
    facilitatorId: string;
    createdAt?: FirestoreDate;
    updatedAt?: FirestoreDate;
}

export const sessionService = {
    create: async (session: Omit<Session, 'id'>) => {
        const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
            ...session,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    },

    update: async (id: string, session: Partial<Session>) => {
        const docRef = doc(db, SESSIONS_COLLECTION, id);
        await updateDoc(docRef, {
            ...session,
            updatedAt: serverTimestamp(),
        });
    },

    upsert: async (session: SessionRecord): Promise<SessionRecord> => {
        const existing = await sessionService.getByGroupAndDate(session.groupId, session.date);
        let sessionId = existing?.id;

        if (sessionId) {
            await updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
                ...session,
                updatedAt: serverTimestamp()
            });
        } else {
            const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
                ...session,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            sessionId = docRef.id;
        }

        const savedSnapshot = await getDoc(doc(db, SESSIONS_COLLECTION, sessionId));

        return {
            id: savedSnapshot.id,
            ...savedSnapshot.data()
        } as SessionRecord;
    },

    getByGroupAndDate: async (groupId: string, date: string): Promise<SessionRecord | null> => {
        const constraints: QueryConstraint[] = [
            where('groupId', '==', groupId),
            where('date', '==', date),
            limit(1)
        ];
        const q = query(collection(db, SESSIONS_COLLECTION), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        } as SessionRecord;
    },

    getByGroup: async (grupoId: string) => {
        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where('grupoId', '==', grupoId),
            orderBy('data', 'asc'),
            orderBy('horarioInicio', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
    },

    getUpcoming: async (limitCount = 10) => {
        // This requires a composite index in Firestore (status + data) or just client-side filtering for MVP
        // For MVP, let's fetch all future sessions
        const today = new Date().toISOString().split('T')[0];
        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where('data', '>=', today),
            orderBy('data', 'asc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
    },

    // Attendance
    recordAttendance: async (attendance: Omit<Attendance, 'id'>) => {
        // Check if exists first? Or just add?
        // Ideally we should update if exists.
        const q = query(
            collection(db, ATTENDANCE_COLLECTION),
            where('sessaoId', '==', attendance.sessaoId),
            where('pacienteId', '==', attendance.pacienteId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, ATTENDANCE_COLLECTION, docId), attendance);
            return docId;
        } else {
            const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), attendance);
            return docRef.id;
        }
    },

    getAttendanceBySession: async (sessaoId: string) => {
        const q = query(collection(db, ATTENDANCE_COLLECTION), where('sessaoId', '==', sessaoId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
    },

    generateSessions: async (group: {
        id: string;
        dataInicio: string;
        dataFimPrevista?: string;
        diaSemanaPadrao: number;
        horarioInicioPadrao: string;
        duracaoMinutos: number;
        periodicidade: 'semanal' | 'quinzenal' | 'mensal' | string;
    }) => {
        const sessions: Omit<Session, 'id'>[] = [];
        const currentDate = new Date(group.dataInicio + 'T00:00:00');
        const endDate = group.dataFimPrevista ? new Date(group.dataFimPrevista + 'T00:00:00') : new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate()); // Default 3 months

        // Adjust start date to match the preferred day of week
        while (currentDate.getDay() !== group.diaSemanaPadrao) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        while (currentDate <= endDate) {
            // Calculate end time
            const [hours, minutes] = group.horarioInicioPadrao.split(':').map(Number);
            const startTime = new Date(currentDate);
            startTime.setHours(hours, minutes);

            const endTime = new Date(startTime.getTime() + group.duracaoMinutos * 60000);
            const horarioFim = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

            sessions.push({
                grupoId: group.id,
                data: currentDate.toISOString().split('T')[0],
                horarioInicio: group.horarioInicioPadrao,
                horarioFim: horarioFim,
                salaOuLocal: 'Sala de Grupo (Padrão)', // Placeholder
                status: 'prevista',
                temaDaSessao: '',
                observacoesGerais: ''
            });

            // Increment date based on periodicity
            if (group.periodicidade === 'semanal') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (group.periodicidade === 'quinzenal') {
                currentDate.setDate(currentDate.getDate() + 14);
            } else if (group.periodicidade === 'mensal') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else {
                break; // Safety break
            }
        }

        // Batch write would be better, but for now loop is fine
        for (const session of sessions) {
            await sessionService.create(session);
        }

        return sessions.length;
    }
};
