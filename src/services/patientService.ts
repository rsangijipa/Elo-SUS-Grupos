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
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import type { Patient } from '../types/patient';
import { withErrorHandling } from '../utils/errorHandler';

const COLLECTION_NAME = COLLECTIONS.PATIENTS;

const buildAddressLabel = (patient: Partial<Patient>) => {
    const baseAddress = [patient.street, patient.number, patient.complement].filter(Boolean).join(', ');
    const fallbackAddress = patient.address || '';
    const districtAddress = [patient.neighborhood, patient.city, patient.state, patient.zipCode].filter(Boolean).join(', ');
    return [baseAddress || fallbackAddress, districtAddress].filter(Boolean).join(', ');
};

export const patientService = {
    create: async (patient: Omit<Patient, 'id'>) => {
        return withErrorHandling(async () => {
            let coordinates = null;
            const fullAddress = buildAddressLabel(patient);
            if (fullAddress) {
                const { MapService } = await import('./MapService'); // Dynamic import to avoid cycles or load issues
                coordinates = await MapService.getCoordinates(fullAddress);
            }

            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...patient,
                address: patient.address || [patient.street, patient.number, patient.complement].filter(Boolean).join(', '),
                coordinates: coordinates || undefined,
                role: 'patient',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return docRef.id;
        });
    },

    createWithId: async (id: string, patient: Omit<Patient, 'id'>) => {
        return withErrorHandling(async () => {
            // Geocoding logic if address is present
            let coordinates = null;
            const fullAddress = buildAddressLabel(patient);
            if (fullAddress) {
                const { MapService } = await import('./MapService');
                coordinates = await MapService.getCoordinates(fullAddress);
            }

            const docRef = doc(db, COLLECTION_NAME, id);
            await setDoc(docRef, {
                ...patient,
                address: patient.address || [patient.street, patient.number, patient.complement].filter(Boolean).join(', '),
                coordinates: coordinates || undefined,
                role: 'patient',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });
        });
    },

    update: async (id: string, patient: Partial<Patient>) => {
        return withErrorHandling(async () => {
            const updates: Record<string, unknown> = { ...patient };

            // Re-geocode if address changes
            const fullAddress = buildAddressLabel(patient);
            if (fullAddress) {
                const { MapService } = await import('./MapService');
                const coordinates = await MapService.getCoordinates(fullAddress);
                if (coordinates) {
                    updates.coordinates = coordinates;
                }
                updates.address = patient.address || [patient.street, patient.number, patient.complement].filter(Boolean).join(', ');
            }

            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });
        });
    },

    delete: async (id: string) => {
        return withErrorHandling(async () => {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
        });
    },

    getAll: async (unidadeSaudeId?: string) => {
        return withErrorHandling(async () => {
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
        }, [] as Patient[]);
    },

    getById: async (id: string) => {
        return withErrorHandling(async () => {
            const docRef = doc(db, COLLECTION_NAME, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() } as Patient;
            }
            return null;
        }, null);
    },

    searchPatients: async (searchTerm: string): Promise<Patient[]> => {
        if (!searchTerm || searchTerm.length < 2) return [];

        return withErrorHandling(async () => {
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
        }, [] as Patient[]);
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

        return withErrorHandling(async () => {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));
        }, [] as Patient[]);
    },

    getPatientsPaginated: async (lastDoc?: unknown, limitCount: number = 20): Promise<{ patients: Patient[]; lastDoc?: unknown }> => {
        return withErrorHandling(async () => {
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
                lastDoc: snapshot.docs[snapshot.docs.length - 1] as unknown
            };
        }, { patients: [] as Patient[], lastDoc: null });
    }
};
