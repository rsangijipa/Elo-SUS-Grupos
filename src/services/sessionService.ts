import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase_config';
import type { Session, Attendance } from '../types/session';

const SESSIONS_COLLECTION = 'sessoesGrupo';
const ATTENDANCE_COLLECTION = 'presencasSessao';

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

    getUpcoming: async (_limitCount = 10) => {
        // This requires a composite index in Firestore (status + data) or just client-side filtering for MVP
        // For MVP, let's fetch all future sessions
        const today = new Date().toISOString().split('T')[0];
        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where('data', '>=', today),
            orderBy('data', 'asc')
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

    generateSessions: async (group: any) => {
        const sessions: Omit<Session, 'id'>[] = [];
        let currentDate = new Date(group.dataInicio + 'T00:00:00');
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
