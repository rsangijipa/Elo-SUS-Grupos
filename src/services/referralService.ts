import { Patient } from '../types/patient';

export interface Referral {
    id: string;
    patientId: string;
    patientName: string;
    originUnit: string; // e.g., "UBS Centro"
    reason: string; // e.g., "Tabagismo", "Ansiedade"
    riskLevel: 'baixo' | 'moderado' | 'alto';
    status: 'encaminhado' | 'em_triagem' | 'aprovado' | 'rejeitado';
    createdAt: string;
    notes?: string;
}

// Mock Referrals
const MOCK_REFERRALS: Referral[] = [
    {
        id: 'r1',
        patientId: 'p004',
        patientName: 'Diego Ramos Ferreira',
        originUnit: 'NASF Zona Leste',
        reason: 'Conflito Escolar / Agressividade',
        riskLevel: 'moderado',
        status: 'encaminhado',
        createdAt: new Date().toISOString()
    },
    {
        id: 'r2',
        patientId: 'p018',
        patientName: 'Rafael Nunes Campos',
        originUnit: 'UBS Cidade Alta',
        reason: 'Ansiedade Social',
        riskLevel: 'moderado',
        status: 'em_triagem',
        createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
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

    create: async (referral: Omit<Referral, 'id' | 'createdAt' | 'status'>): Promise<Referral> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newReferral: Referral = {
            ...referral,
            id: Math.random().toString(36).substr(2, 9),
            status: 'encaminhado',
            createdAt: new Date().toISOString()
        };

        const current = await referralService.getAll();
        const updated = [newReferral, ...current];
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
        return newReferral;
    },

    updateStatus: async (id: string, status: Referral['status'], notes?: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const current = await referralService.getAll();
        const updated = current.map(r => r.id === id ? { ...r, status, notes: notes || r.notes } : r);
        localStorage.setItem('elosus_referrals', JSON.stringify(updated));
    }
};
