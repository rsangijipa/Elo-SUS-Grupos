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
    startAfter,
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
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...patient,
                role: 'patient',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro em create:", error);
            throw error;
        }
    },

    createWithId: async (id: string, patient: Omit<Patient, 'id'>) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await setDoc(docRef, {
                ...patient,
                role: 'patient',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } catch (error) {
            console.error("Erro em createWithId:", error);
            throw error;
        }
    },

    update: async (id: string, patient: Partial<Patient>) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...patient,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Erro em update:", error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Erro em delete:", error);
            throw error;
        }
    },

    getAll: async (unidadeSaudeId?: string) => {
        try {
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
        } catch (error) {
            console.error("Erro em getAll:", error);
            throw error;
        }
    },

    getById: async (id: string) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() } as Patient;
            }
            return null;
        } catch (error) {
            console.error("Erro em getById:", error);
            throw error;
        }
    },

    searchPatients: async (searchTerm: string): Promise<Patient[]> => {
        if (!searchTerm || searchTerm.length < 2) return [];

        try {
            // Fetch all patients to perform client-side case-insensitive filtering
            // Note: For large datasets, this should be replaced by a dedicated search service (e.g., Algolia) or a normalized 'name_lower' field in Firestore.
            const q = query(collection(db, COLLECTION_NAME), where('role', '==', 'patient'));
            const snapshot = await getDocs(q);

            const lowerTerm = searchTerm.toLowerCase();
            const allPatients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));

            return allPatients
                .filter(p => p.name.toLowerCase().includes(lowerTerm))
                .slice(0, 5);
        } catch (error) {
            console.error("Error searching patients:", error);
            throw error;
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
            throw error;
        }
    },

    getPatientsPaginated: async (lastDoc?: any, limitCount: number = 20) => {
        try {
            let q = query(
                collection(db, COLLECTION_NAME),
                where('role', '==', 'patient'),
                orderBy('name'),
                limit(limitCount)
            );

            if (lastDoc) {
                q = query(
                    collection(db, COLLECTION_NAME),
                    where('role', '==', 'patient'),
                    orderBy('name'),
                    startAfter(lastDoc),
                    limit(limitCount)
                );
            }

            const snapshot = await getDocs(q);
            const patients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));

            return {
                patients,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        } catch (error) {
            console.error("Error fetching paginated patients:", error);
            throw error;
        }
    }
};
