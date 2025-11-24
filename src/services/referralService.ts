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

    // Origin Details
    originUnitId?: string;
    originUnitName: string; // e.g., "UBS Centro", "CAPS AD"
    referringProfessionalName: string;
    referringProfessionalRole: string; // e.g., "Médico", "Enfermeiro"

    // Clinical Details
    reason: string; // e.g., "Tabagismo", "Ansiedade"
    mainComplaint?: string; // Motivo detalhado
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
            return [];
        }
    },

    create: async (referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'timeline'>): Promise<Referral> => {
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
    },

    updateStatus: async (id: string, status: Referral['status'], notes?: string): Promise<void> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            notes: notes || undefined, // Only update if provided
            updatedAt: new Date().toISOString()
        });
    },

    // New Methods for Workflow

    invitePatient: async (referralId: string, groupDetails: { groupId: string, professionalName: string }): Promise<void> => {
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
    },

    acceptInvite: async (referralId: string, patientName: string, userId: string): Promise<void> => {
        try {
            await runTransaction(db, async (transaction) => {
                const referralRef = doc(db, COLLECTION_NAME, referralId);
                const referralDoc = await transaction.get(referralRef);

                if (!referralDoc.exists()) {
                    throw new Error("Referral does not exist!");
                }

                const referralData = referralDoc.data() as Referral;
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
    },

    manualAcceptance: async (referralId: string, professionalName: string): Promise<void> => {
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
    }
};


