export interface UserProfile {
    uid: string;
    id: string; // Alias for uid
    name: string;
    email: string;
    role: 'patient' | 'professional' | 'admin';
    avatar?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
    phoneNumberVerified?: boolean;

    // Professional specific
    crp?: string;
    specialty?: string;
    approach?: string;
    bio?: string;

    // Patient specific
    cns?: string;
    motherName?: string;
    originUnit?: string;
    emergencyContact?: string;
    address?: string;
    neighborhood?: string;
    unidadeSaudeId?: string;
    status?: 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout';
    observacoes?: string;
    birthDate?: string;
    sexo?: 'M' | 'F' | 'Outro';
    phone?: string;
    originalRole?: 'patient' | 'professional' | 'admin';
    whatsappResponsavel?: string;
    nomeResponsavel?: string;
    active?: boolean;
    currentGroupId?: string;
    youtubePlaylistId?: string;

    // Gamification & Stats
    stats?: {
        xp: number;
        level: number;
        completedChallenges: number;
        streakDays: number;
        loginStreak?: number;
        lastLogin?: any;
        totalSessions?: number;
        lastChallengeDate?: any;
    };

    achievements?: string[];

    // Health Screenings
    healthScreening?: {
        date: any;
        depressionAlert: boolean;
        anxietyAlert: boolean;
        score: number;
    };
    pregnantScreening?: {
        date: any;
        riskLevel: 'none' | 'baby_blues' | 'depression' | 'emergency';
        score: number;
    };

    createdAt: Date | any;
    updatedAt?: Date | any;
}

export interface MoodLog {
    id: string;
    userId: string;
    mood: 1 | 2 | 3 | 4 | 5; // 1=Péssimo, 5=Ótimo
    tags: string[]; // ex: ['sono', 'trabalho']
    note?: string;
    aiAnalysis?: {
        riskFlag: boolean;
        sentiment: 'positive' | 'negative' | 'neutral';
    };
    createdAt: Date | any;
}

export interface GroupSession {
    id: string;
    groupId: string;
    topic: string;
    date: string; // ISO or Timestamp
    status: 'scheduled' | 'completed' | 'canceled';
    attendance: string[]; // Array of present userIds
}
