import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    serverTimestamp,
    arrayUnion,
    runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient } from '../types/patient';
import { tobaccoService } from './tobaccoService';

const COLLECTION_NAME = 'referrals';

export interface ReferralTimelineEvent {
    status: 'created' | 'triaged' | 'invited' | 'accepted' | 'declined' | 'joined';
    date: string;
    by: string; // User ID or Name
    notes?: string;
}

export interface Referral {
    id: string;
    patientId: string;
    patientName: string;
    patientCns?: string;

    // Origin Details
    originUnitId?: string;
    originUnitName: string; // e.g., "UBS Centro", "CAPS AD"
    referringProfessionalName: string;
    referringProfessionalRole: string; // e.g., "Médico", "Enfermeiro"

    // Clinical Details
    reason: string; // e.g., "Tabagismo", "Ansiedade"
    mainComplaint?: string; // Motivo detalhado
    diagnosis?: string;
    riskLevel: 'baixo' | 'moderado' | 'alto';
    priority: 'normal' | 'urgente';

    // Status & Flow
    status: 'encaminhado' | 'em_triagem' | 'convidado' | 'aprovado' | 'rejeitado' | 'concluido';
    createdAt: string;
    updatedAt: string;

    // Links
    anamnesisId?: string;
    groupId?: string; // The group they are invited to or joined

    timeline: ReferralTimelineEvent[];
    notes?: string;
}

export const referralService = {
    getAll: async (): Promise<Referral[]> => {
        try {
            const q = query(collection(db, COLLECTION_NAME));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Referral));
        } catch (error) {
            console.error('Error fetching referrals:', error);
            throw error;
        }
    },

    create: async (referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'timeline'>): Promise<Referral> => {
        try {
            const newReferralData = {
                ...referralData,
                status: 'encaminhado',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                timeline: [
                    {
                        status: 'created',
                        date: new Date().toISOString(),
                        by: referralData.referringProfessionalName || 'Sistema'
                    }
                ]
            };

            const docRef = await addDoc(collection(db, COLLECTION_NAME), newReferralData);
            return { id: docRef.id, ...newReferralData } as Referral;
        } catch (error) {
            console.error("Erro em create:", error);
            throw error;
        }
    },

    updateStatus: async (id: string, status: Referral['status'], notes?: string): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                status,
                notes: notes || undefined, // Only update if provided
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Erro em updateStatus:", error);
            throw error;
        }
    },

    // New Methods for Workflow

    invitePatient: async (referralId: string, groupDetails: { groupId: string, professionalName: string }): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, referralId);

            // We need to get the current timeline to append
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) throw new Error('Referral not found');

            const currentData = docSnap.data() as Referral;

            await updateDoc(docRef, {
                status: 'convidado',
                groupId: groupDetails.groupId,
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...currentData.timeline,
                    {
                        status: 'invited',
                        date: new Date().toISOString(),
                        by: groupDetails.professionalName,
                        notes: `Convidado para o grupo ${groupDetails.groupId}`
                    }
                ]
            });
        } catch (error) {
            console.error("Erro em invitePatient:", error);
            throw error;
        }
    },

    acceptInvite: async (referralId: string, patientName: string, userId: string): Promise<void> => {
        try {
            // 1. Fetch Referral to get Group ID
            const referralRef = doc(db, COLLECTION_NAME, referralId);
            const referralSnap = await getDoc(referralRef);
            if (!referralSnap.exists()) throw new Error('Referral not found');
            const referralData = referralSnap.data() as Referral;

            if (!referralData.groupId) throw new Error('No group linked to referral');

            // 2. Fetch Group to get Protocol
            const groupRef = doc(db, 'grupos', referralData.groupId);
            const groupSnap = await getDoc(groupRef);
            if (!groupSnap.exists()) throw new Error('Group not found');
            const groupData = groupSnap.data();

            // 3. Gatekeeper: Check Requirements based on Protocol
            if (groupData.protocol === 'TABAGISMO') {
                const hasAnamnesis = await tobaccoService.checkAnamnesis(userId);
                if (!hasAnamnesis) {
                    throw new Error('REQ_ANAMNESE');
                }
            }
            // TODO: Add checks for GESTANTE, ANSIEDADE_DEPRESSAO, etc.

            await runTransaction(db, async (transaction) => {
                // Re-read inside transaction for consistency (optional but good practice)
                const tReferralDoc = await transaction.get(referralRef);
                if (!tReferralDoc.exists()) throw new Error("Referral does not exist!");

                // ... rest of transaction

                if (!tReferralDoc.exists()) {
                    throw new Error("Referral does not exist!");
                }

                const referralData = tReferralDoc.data() as Referral;
                const targetGroupId = referralData.groupId;

                if (!targetGroupId) {
                    throw new Error("No group linked to this referral invite.");
                }

                // 1. Update Referral
                transaction.update(referralRef, {
                    status: 'concluido',
                    patientId: userId, // Link to the actual patient user
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        ...referralData.timeline,
                        {
                            status: 'accepted',
                            date: new Date().toISOString(),
                            by: patientName
                        },
                        {
                            status: 'joined',
                            date: new Date().toISOString(),
                            by: 'Sistema',
                            notes: 'Paciente ingressou no grupo'
                        }
                    ]
                });

                // 2. Add Patient to Group Participants
                const groupRef = doc(db, 'grupos', targetGroupId);
                // Use arrayUnion to add unique value
                transaction.update(groupRef, {
                    participants: arrayUnion(userId)
                });
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            throw e;
        }
    },

    declineInvite: async (referralId: string, reason: string, patientName: string): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, referralId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) throw new Error('Referral not found');
            const currentData = docSnap.data() as Referral;

            await updateDoc(docRef, {
                status: 'rejeitado',
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...currentData.timeline,
                    {
                        status: 'declined',
                        date: new Date().toISOString(),
                        by: patientName,
                        notes: reason
                    }
                ]
            });
        } catch (error) {
            console.error("Erro em declineInvite:", error);
            throw error;
        }
    },

    manualAcceptance: async (referralId: string, professionalName: string): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, referralId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) throw new Error('Referral not found');
            const currentData = docSnap.data() as Referral;

            await updateDoc(docRef, {
                status: 'concluido',
                updatedAt: new Date().toISOString(),
                timeline: [
                    ...currentData.timeline,
                    {
                        status: 'accepted',
                        date: new Date().toISOString(),
                        by: professionalName,
                        notes: 'Aceite manual realizado pelo profissional'
                    },
                    {
                        status: 'joined',
                        date: new Date().toISOString(),
                        by: 'Sistema'
                    }
                ]
            });
        } catch (error) {
            console.error("Erro em manualAcceptance:", error);
            throw error;
        }
    }
};


