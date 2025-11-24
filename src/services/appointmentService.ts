import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Appointment } from '../types/appointment';

const COLLECTION_NAME = 'appointments';

export const appointmentService = {
    // Get all appointments (optionally filtered by range or group - simplistic for now)
    getAll: async (): Promise<Appointment[]> => {
        try {
            // In a real app, we might want to filter by date range to avoid fetching too much
            const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to Date object or string if needed
                    // Here we ensure date is returned as string (ISO) for consistency with frontend usage
                    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
                } as Appointment;
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    },

    getById: async (id: string): Promise<Appointment | null> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
                } as Appointment;
            }
            return null;
        } catch (error) {
            console.error('Error fetching appointment:', error);
            return null;
        }
    },

    create: async (appointment: Omit<Appointment, 'id'>): Promise<string> => {
        try {
            // Ensure date is stored as Timestamp or ISO string. 
            // Storing as ISO string is easier for simple querying if we don't need complex date math on server
            // But Timestamp is better for sorting. Let's convert to ISO string for now to match other parts, 
            // or keep as is if it's already string.
            // Actually, let's store as string to avoid timezone issues for now, or Timestamp.
            // The type says Date | string.

            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...appointment,
                // If it's a Date object, convert to ISO string or keep as is (Firestore handles Date)
                // Let's store as ISO string for simplicity in this app
                date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<Appointment>): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const updateData = {
                ...data,
                updatedAt: serverTimestamp()
            };

            if (data.date && data.date instanceof Date) {
                updateData.date = data.date.toISOString();
            }

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }
};
