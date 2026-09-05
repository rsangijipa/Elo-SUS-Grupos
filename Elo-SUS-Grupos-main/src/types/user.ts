import type { FirestoreDate } from './shared';

export type UserRole = 'terapeuta' | 'coordenador' | 'administrador';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'professional' | 'patient' | 'admin';
    avatar?: string;
    phone?: string;
    address?: string;
    // Professional specific
    crp?: string;
    specialty?: string;
    approach?: string;
    bio?: string;
    // Patient specific
    emergencyContact?: string;
    nextAppointment?: Date;
    youtubePlaylistId?: string;
    createdAt: FirestoreDate;
    updatedAt?: FirestoreDate;
    // Additional fields used in AuthContext
    cpf?: string;
    cns?: string;
    unidadeSaudeId?: string;
    originalRole?: 'professional' | 'patient' | 'admin';
    // Extended Patient fields
    birthDate?: string;
    sexo?: 'M' | 'F' | 'Outro';
    neighborhood?: string;
    observacoes?: string;
    whatsappResponsavel?: string;
    nomeResponsavel?: string;
    status?: 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout';
    active?: boolean; // For system access control
    groupId?: string;
    currentGroupId?: string;

    // Gamification
    stats?: {
        loginStreak: number;
        lastLogin: FirestoreDate;
        totalSessions: number;
        completedChallenges?: number;
        lastChallengeDate?: FirestoreDate;
    };
    achievements?: string[]; // Array of unlocked achievement IDs

    // Health Screening (PHQ-2 + Anxiety)
    healthScreening?: {
        date: FirestoreDate;
        depressionAlert: boolean;
        anxietyAlert: boolean;
        score: number;
    };

    // Pregnant/Postpartum Screening
    pregnantScreening?: {
        date: FirestoreDate;
        riskLevel: 'none' | 'baby_blues' | 'depression' | 'emergency';
        score: number;
    };
}
