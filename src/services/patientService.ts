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
    getDoc,
    orderBy,
    startAt,
    endAt,
    limit,
    setDoc,
    type Query
} from 'firebase/firestore';
import { db } from './firebase';
import type { Patient } from '../types/patient';

const COLLECTION_NAME = 'users';

export const patientService = {
    create: async (patient: Omit<Patient, 'id'>) => {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...patient,
            role: 'patient',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    },

    createWithId: async (id: string, patient: Omit<Patient, 'id'>) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
            ...patient,
            role: 'patient',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    },

    update: async (id: string, patient: Partial<Patient>) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...patient,
            updatedAt: serverTimestamp(),
        });
    },

    delete: async (id: string) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    },

    getAll: async (unidadeSaudeId?: string) => {
        let q: Query = collection(db, COLLECTION_NAME);

        if (unidadeSaudeId) {
            q = query(collection(db, COLLECTION_NAME), where('role', '==', 'patient'), where('unidadeSaudeId', '==', unidadeSaudeId));
        } else {
            q = query(collection(db, COLLECTION_NAME), where('role', '==', 'patient'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Patient));
    },

    getById: async (id: string) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Patient;
        }
        return null;
    },

    searchPatients: async (searchTerm: string): Promise<Patient[]> => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const patientsRef = collection(db, COLLECTION_NAME);
        // Simple prefix search on name
        const q = query(
            patientsRef,
            where('role', '==', 'patient'),
            where('name', '>=', searchTerm),
            where('name', '<=', searchTerm + '\uf8ff'),
            limit(5)
        );

        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));
        } catch (error) {
            console.error("Error searching patients:", error);
            return [];
        }
    },

    searchPatientsByEmail: async (email: string): Promise<Patient[]> => {
        if (!email) return [];

        const patientsRef = collection(db, COLLECTION_NAME);
        const q = query(
            patientsRef,
            where('role', '==', 'patient'),
            where('email', '==', email),
            limit(1)
        );

        try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));
        } catch (error) {
            console.error("Error searching patient by email:", error);
            return [];
        }
    }
};
