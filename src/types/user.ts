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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: any; // Firestore Timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt?: any;
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

    // Gamification
    stats?: {
        loginStreak: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastLogin: any; // Firestore Timestamp or Date
        totalSessions: number;
        completedChallenges?: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastChallengeDate?: any; // Firestore Timestamp or Date
    };
    achievements?: string[]; // Array of unlocked achievement IDs

    // Health Screening (PHQ-2 + Anxiety)
    healthScreening?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        date: any; // Firestore Timestamp
        depressionAlert: boolean;
        anxietyAlert: boolean;
        score: number;
    };

    // Pregnant/Postpartum Screening
    pregnantScreening?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        date: any; // Firestore Timestamp
        riskLevel: 'none' | 'baby_blues' | 'depression' | 'emergency';
        score: number;
    };
}
