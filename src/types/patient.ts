import type { FirestoreDate } from './shared';

export interface Patient {
    id?: string;
    name: string;
    birthDate: string; // ISO String or YYYY-MM-DD
    sexo?: 'M' | 'F' | 'Outro';
    cpf?: string;
    cns: string; // Cartão Nacional de Saúde (Required now per new flow)
    motherName: string; // Required for homonym distinction
    originUnit?: string; // UBS de Origem
    email?: string; // Added for user sync
    phone: string;
    status: 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout';
    groupId?: string;
    whatsappResponsavel?: string;
    nomeResponsavel?: string;
    unidadeSaudeId?: string;
    address?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    observacoes?: string;
    createdAt?: FirestoreDate;
    updatedAt?: FirestoreDate;
    hasAlert?: boolean; // Flag for emotional risk alert
    stats?: {
        loginStreak: number;
        lastLogin: FirestoreDate;
        totalSessions?: number;
    };
    achievements?: string[]; // Array of achievement IDs

    // Territorial Intelligence
    coordinates?: {
        lat: number;
        lng: number;
    };
    territorialTags?: string[];

    // AI Risk Analysis
    riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
    riskSummary?: string;
}
