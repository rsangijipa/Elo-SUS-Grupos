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
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import type { Group } from '../types/group';
import { notificationService } from './notificationService';
import { withErrorHandling } from '../utils/errorHandler';

// Firestore production data uses the Portuguese collection name `grupos`.
const COLLECTION_NAME = COLLECTIONS.GROUPS;

export const groupService = {
    create: async (group: Omit<Group, 'id'>) => {
        return withErrorHandling(async () => {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...group,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return docRef.id;
        });
    },

    update: async (id: string, group: Partial<Group>) => {
        return withErrorHandling(async () => {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...group,
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
        }, [] as Group[]);
    },

    getById: async (id: string) => {
        return withErrorHandling(async () => {
            const docRef = doc(db, COLLECTION_NAME, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() } as Group;
            }
            return null;
        }, null);
    },

    getByTherapist: async (terapeutaId: string) => {
        return withErrorHandling(async () => {
            const q = query(collection(db, COLLECTION_NAME), where('terapeutaResponsavelId', '==', terapeutaId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Group));
        }, [] as Group[]);
    },

    addParticipant: async (groupId: string, patientId: string, unitAddress: string) => {
        return withErrorHandling(async () => {
            await runTransaction(db, async (transaction) => {
                const groupRef = doc(db, COLLECTION_NAME, groupId);
                const patientRef = doc(db, COLLECTIONS.USERS, patientId);

                const groupDoc = await transaction.get(groupRef);
                const patientDoc = await transaction.get(patientRef);

                if (!groupDoc.exists()) throw new Error('Grupo nao encontrado.');
                if (!patientDoc.exists()) throw new Error('Paciente nao encontrado.');

                const groupData = groupDoc.data();
                const participants = groupData.participants || [];

                if (!participants.includes(patientId)) {
                    // Territorial Logic
                    const updates: Record<string, any> = {
                        groupId: groupId,
                        currentGroupId: groupId,
                        status: 'active',
                        joinedAt: new Date().toISOString(),
                        updatedAt: serverTimestamp()
                    };

                    const patientData = patientDoc.data();
                    // Unit address is now passed as argument

                    if (patientData.address && unitAddress) {
                        const { MapService } = await import('./MapService');
                        const distance = await MapService.calculateDistance(
                            `${patientData.address}, ${patientData.neighborhood || ''}`,
                            unitAddress
                        );

                        if (distance !== null) {
                            const risk = MapService.analyzeTerritorialRisk(distance);
                            if (risk.level !== 'normal') {
                                // Add alerts to patient tags
                                const currentTags = patientData.territorialTags || [];
                                const newTags = [...new Set([...currentTags, ...risk.tags])];
                                updates.territorialTags = newTags;
                                updates.hasAlert = true; // Flag for UI
                            }
                        }
                    }

                    transaction.update(groupRef, {
                        participants: [...participants, patientId],
                        updatedAt: serverTimestamp()
                    });
                    transaction.update(patientRef, updates);
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
        });
    },

    removeParticipant: async (groupId: string, participantId: string, dischargeData?: any) => {
        return withErrorHandling(async () => {
            await runTransaction(db, async (transaction) => {
                const groupRef = doc(db, COLLECTION_NAME, groupId);
                const patientRef = doc(db, COLLECTIONS.USERS, participantId);

                const groupDoc = await transaction.get(groupRef);
                const patientDoc = await transaction.get(patientRef);

                if (!groupDoc.exists()) throw new Error('Grupo nao encontrado.');

                const groupData = groupDoc.data();
                const participants = groupData.participants || [];

                if (participants.includes(participantId)) {
                    transaction.update(groupRef, {
                        participants: participants.filter((id: string) => id !== participantId),
                        updatedAt: serverTimestamp()
                    });

                    // Only clear groupId if it matches the current group
                    if (patientDoc.exists()) {
                        const updates: any = {
                            updatedAt: serverTimestamp()
                        };

                        if (patientDoc.data().groupId === groupId) {
                            updates.groupId = null;
                        }

                        if (dischargeData) {
                            updates.status = dischargeData.status === 'SHARED_CARE' ? 'active' : (dischargeData.status.toLowerCase() || 'inactive');
                            updates.lastDischarge = {
                                ...dischargeData,
                                groupId,
                                groupName: groupData.name,
                                date: new Date().toISOString()
                            };
                        }

                        transaction.update(patientRef, updates);
                    }
                }
            });
        });
    },

    getParticipants: async (groupId: string) => {
        return withErrorHandling(async () => {
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

                const patientPromises = participantIds.map((id: string) => getDoc(doc(db, COLLECTIONS.USERS, id)));
                const patientSnaps = await Promise.all(patientPromises);

                return patientSnaps
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));
            }
            return [];
        }, [] as Array<Record<string, unknown>>);
    }
};
