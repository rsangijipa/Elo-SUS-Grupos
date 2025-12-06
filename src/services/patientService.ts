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
            let coordinates = null;
            if (patient.address) {
                const { MapService } = await import('./MapService'); // Dynamic import to avoid cycles or load issues
                coordinates = await MapService.getCoordinates(`${patient.address}, ${patient.neighborhood || ''}`);
            }

            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...patient,
                coordinates: coordinates || undefined,
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
            // Geocoding logic if address is present
            let coordinates = null;
            if (patient.address) {
                const { MapService } = await import('./MapService');
                coordinates = await MapService.getCoordinates(`${patient.address}, ${patient.neighborhood || ''}`);
            }

            const docRef = doc(db, COLLECTION_NAME, id);
            await setDoc(docRef, {
                ...patient,
                coordinates: coordinates || undefined,
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
            let updates: any = { ...patient };

            // Re-geocode if address changes
            if (patient.address) {
                const { MapService } = await import('./MapService');
                const coordinates = await MapService.getCoordinates(`${patient.address}, ${patient.neighborhood || ''}`);
                if (coordinates) {
                    updates.coordinates = coordinates;
                }
            }

            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...updates,
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
            // Scalable Firestore Search (Prefix Search)
            // Note: This is case-sensitive. For case-insensitive, we strictly need a 'name_lower' field in DB.
            // As a fallback for this phase, we assume the user types matching case or we'd rely on 'name_lower' field implementation later.
            // However, the request asked for this specifically:
            const q = query(
                collection(db, COLLECTION_NAME),
                where('role', '==', 'patient'),
                orderBy('name'),
                startAt(searchTerm),
                endAt(searchTerm + '\uf8ff'),
                limit(20)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));
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
