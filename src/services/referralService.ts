import { Patient } from '../types/patient';

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

// Mock Referrals
const MOCK_REFERRALS: Referral[] = [
    {
        id: 'r1',
        patientId: 'p004',
        patientName: 'Diego Ramos Ferreira',
        originUnitName: 'NASF Zona Leste',
        referringProfessionalName: 'Dr. Silva',
        referringProfessionalRole: 'Psiquiatra',
        reason: 'Conflito Escolar / Agressividade',
        mainComplaint: 'Dificuldade de socialização na escola e episódios de raiva.',
        riskLevel: 'moderado',
        priority: 'normal',
        status: 'encaminhado',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
            { status: 'created', date: new Date().toISOString(), by: 'Dr. Silva' }
        ]
    },
    {
        id: 'r2',
        patientId: 'p018',
        patientName: 'Rafael Nunes Campos',
        originUnitName: 'UBS Cidade Alta',
        referringProfessionalName: 'Enf. Maria',
        referringProfessionalRole: 'Enfermeira',
        reason: 'Ansiedade Social',
        riskLevel: 'moderado',
        priority: 'normal',
        status: 'em_triagem',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updatedAt: new Date().toISOString(),
        timeline: [
            { status: 'created', date: new Date(Date.now() - 86400000).toISOString(), by: 'Enf. Maria' }
        ]
    }
];

export const referralService = {
    getAll: async (): Promise<Referral[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const stored = localStorage.getItem('elosus_referrals');
        if (stored) {
            return JSON.parse(stored);
        }
        localStorage.setItem('elosus_referrals', JSON.stringify(MOCK_REFERRALS));
        return MOCK_REFERRALS;
    },

    create: async (referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'timeline'>): Promise<Referral> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newReferral: Referral = {
            ...referralData,
            id: Math.random().toString(36).substr(2, 9),
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

        const current = await referralService.getAll();
        const updated = [newReferral, ...current];
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
        return newReferral;
    },

    updateStatus: async (id: string, status: Referral['status'], notes?: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const current = await referralService.getAll();
        const updated = current.map(r => {
            if (r.id === id) {
                return {
                    ...r,
                    status,
                    notes: notes || r.notes,
                    updatedAt: new Date().toISOString()
                };
            }
            return r;
        });
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
    },

    // New Methods for Workflow

    invitePatient: async (referralId: string, groupDetails: { groupId: string, professionalName: string }): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const current = await referralService.getAll();
        const updated = current.map(r => {
            if (r.id === referralId) {
                return {
                    ...r,
                    status: 'convidado' as const,
                    groupId: groupDetails.groupId,
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        ...r.timeline,
                        {
                            status: 'invited' as const,
                            date: new Date().toISOString(),
                            by: groupDetails.professionalName,
                            notes: `Convidado para o grupo ${groupDetails.groupId}`
                        }
                    ]
                };
            }
            return r;
        });
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
    },

    acceptInvite: async (referralId: string, patientName: string, userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1. Update Referral Status
        const currentReferrals = await referralService.getAll();
        let targetGroupId = '';

        const updatedReferrals = currentReferrals.map(r => {
            if (r.id === referralId) {
                targetGroupId = r.groupId || '';
                return {
                    ...r,
                    status: 'concluido' as const,
                    patientId: userId, // Link to the actual patient user
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        ...r.timeline,
                        {
                            status: 'accepted' as const,
                            date: new Date().toISOString(),
                            by: patientName
                        },
                        {
                            status: 'joined' as const,
                            date: new Date().toISOString(),
                            by: 'Sistema',
                            notes: 'Paciente ingressou no grupo'
                        }
                    ]
                };
            }
            return r;
        });
        localStorage.setItem('elosus_referrals', JSON.stringify(updatedReferrals));

        // 2. Add Patient to Group Participants (Mock Logic for localStorage)
        if (targetGroupId) {
            const storedGroups = localStorage.getItem('elosus_groups_v2');
            if (storedGroups) {
                const groups = JSON.parse(storedGroups);
                const updatedGroups = groups.map((g: any) => {
                    if (g.id === targetGroupId) {
                        const currentParticipants = g.participants || [];
                        if (!currentParticipants.includes(userId)) {
                            return {
                                ...g,
                                participants: [...currentParticipants, userId]
                            };
                        }
                    }
                    return g;
                });
                localStorage.setItem('elosus_groups_v2', JSON.stringify(updatedGroups));
            }
        }
    },

    declineInvite: async (referralId: string, reason: string, patientName: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const current = await referralService.getAll();
        const updated = current.map(r => {
            if (r.id === referralId) {
                return {
                    ...r,
                    status: 'rejeitado' as const,
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        ...r.timeline,
                        {
                            status: 'declined' as const,
                            date: new Date().toISOString(),
                            by: patientName,
                            notes: reason
                        }
                    ]
                };
            }
            return r;
        });
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
    },

    manualAcceptance: async (referralId: string, professionalName: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const current = await referralService.getAll();
        const updated = current.map(r => {
            if (r.id === referralId) {
                return {
                    ...r,
                    status: 'concluido' as const,
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        ...r.timeline,
                        {
                            status: 'accepted' as const,
                            date: new Date().toISOString(),
                            by: professionalName,
                            notes: 'Aceite manual realizado pelo profissional'
                        },
                        {
                            status: 'joined' as const,
                            date: new Date().toISOString(),
                            by: 'Sistema'
                        }
                    ]
                };
            }
            return r;
        });
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
    }
};

