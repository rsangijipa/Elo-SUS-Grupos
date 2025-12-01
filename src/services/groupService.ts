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
    runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import type { Group } from '../types/group';
import { notificationService } from './notificationService';

const COLLECTION_NAME = 'grupos';

export const groupService = {
    create: async (group: Omit<Group, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...group,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro em create:", error);
            throw error;
        }
    },

    update: async (id: string, group: Partial<Group>) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...group,
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
                return { id: snapshot.id, ...snapshot.data() } as Group;
            }
            return null;
        } catch (error) {
            console.error("Erro em getById:", error);
            throw error;
        }
    },

    getByTherapist: async (terapeutaId: string) => {
        try {
            const q = query(collection(db, COLLECTION_NAME), where('terapeutaResponsavelId', '==', terapeutaId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Group));
        } catch (error) {
            console.error("Erro em getByTherapist:", error);
            throw error;
        }
    },

    addParticipant: async (groupId: string, patientId: string) => {
        try {
            await runTransaction(db, async (transaction) => {
                const groupRef = doc(db, COLLECTION_NAME, groupId);
                const patientRef = doc(db, 'users', patientId);

                const groupDoc = await transaction.get(groupRef);
                const patientDoc = await transaction.get(patientRef);

                if (!groupDoc.exists()) throw new Error("Group does not exist!");
                if (!patientDoc.exists()) throw new Error("Patient does not exist!");

                const groupData = groupDoc.data();
                const participants = groupData.participants || [];

                if (!participants.includes(patientId)) {
                    transaction.update(groupRef, {
                        participants: [...participants, patientId],
                        updatedAt: serverTimestamp()
                    });
                    transaction.update(patientRef, {
                        groupId: groupId,
                        updatedAt: serverTimestamp()
                    });
                }
            });

            // Send notification after successful transaction
            // We need group name, so let's fetch it quickly or pass it. 
            // Fetching is safer to ensure we have data.
            const groupSnap = await getDoc(doc(db, COLLECTION_NAME, groupId));
            const groupName = groupSnap.exists() ? groupSnap.data().name : 'Grupo';

            await notificationService.sendNotification(patientId, {
                title: 'Novo Grupo',
                message: `Olá! O psicólogo adicionou você ao grupo ${groupName}. Clique para acessar.`,
                type: 'group_invite',
                link: `/groups/${groupId}`
            });

        } catch (e) {
            console.error("Transaction failed: ", e);
            throw e;
        }
    },

    removeParticipant: async (groupId: string, participantId: string) => {
        try {
            await runTransaction(db, async (transaction) => {
                const groupRef = doc(db, COLLECTION_NAME, groupId);
                const patientRef = doc(db, 'users', participantId);

                const groupDoc = await transaction.get(groupRef);
                const patientDoc = await transaction.get(patientRef);

                if (!groupDoc.exists()) throw new Error("Group does not exist!");

                const groupData = groupDoc.data();
                const participants = groupData.participants || [];

                if (participants.includes(participantId)) {
                    transaction.update(groupRef, {
                        participants: participants.filter((id: string) => id !== participantId),
                        updatedAt: serverTimestamp()
                    });

                    // Only clear groupId if it matches the current group
                    if (patientDoc.exists() && patientDoc.data().groupId === groupId) {
                        transaction.update(patientRef, {
                            groupId: null, // or deleteField()
                            updatedAt: serverTimestamp()
                        });
                    }
                }
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            throw e;
        }
    },

    getParticipants: async (groupId: string) => {
        try {
            const groupRef = doc(db, COLLECTION_NAME, groupId);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                const data = groupSnap.data();
                const participantIds = data.participants || [];

                if (participantIds.length === 0) return [];

                // Firestore 'in' query supports up to 10 items. For more, we need multiple queries or document gets.
                // For simplicity and scalability, we'll fetch individual docs since we have IDs.
                // Or use 'in' batches if we expect < 30 participants usually.
                // Let's use Promise.all with getDoc for now as it's straightforward.

                const patientPromises = participantIds.map((id: string) => getDoc(doc(db, 'users', id)));
                const patientSnaps = await Promise.all(patientPromises);

                return patientSnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));
            }
            return [];
        } catch (error) {
            console.error("Erro em getParticipants:", error);
            throw error;
        }
    }
};
