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
    getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Group } from '../types/group';

const COLLECTION_NAME = 'grupos';

export const groupService = {
    create: async (group: Omit<Group, 'id'>) => {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...group,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    },

    update: async (id: string, group: Partial<Group>) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...group,
            updatedAt: serverTimestamp(),
        });
    },

    delete: async (id: string) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    },

    getAll: async (unidadeSaudeId?: string) => {
        let q = collection(db, COLLECTION_NAME);

        if (unidadeSaudeId) {
            // @ts-ignore
            q = query(collection(db, COLLECTION_NAME), where('unidadeSaudeId', '==', unidadeSaudeId));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Group));
    },

    getById: async (id: string) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Group;
        }
        return null;
    },

    getByTherapist: async (terapeutaId: string) => {
        const q = query(collection(db, COLLECTION_NAME), where('terapeutaResponsavelId', '==', terapeutaId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Group));
    }
};
