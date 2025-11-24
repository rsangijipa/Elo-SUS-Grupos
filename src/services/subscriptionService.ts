import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Subscription {
    id?: string;
    grupoId: string;
    pacienteId: string;
    status: 'inscrito' | 'lista_espera' | 'concluido' | 'desistiu';
    dataInscricao: string;
    dataConclusao?: string;
    observacoes?: string;
    createdAt?: any;
    updatedAt?: any;
}

const COLLECTION_NAME = 'inscricoesGrupo';

export const subscriptionService = {
    create: async (subscription: Omit<Subscription, 'id'>) => {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...subscription,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    },

    update: async (id: string, subscription: Partial<Subscription>) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...subscription,
            updatedAt: serverTimestamp(),
        });
    },

    delete: async (id: string) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    },

    getByGroup: async (grupoId: string) => {
        const q = query(collection(db, COLLECTION_NAME), where('grupoId', '==', grupoId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
    },

    getByPatient: async (pacienteId: string) => {
        const q = query(collection(db, COLLECTION_NAME), where('pacienteId', '==', pacienteId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
    },

    checkSubscription: async (grupoId: string, pacienteId: string) => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('grupoId', '==', grupoId),
            where('pacienteId', '==', pacienteId)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }
};
