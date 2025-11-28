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
    createdAt: any; // Firestore Timestamp
    updatedAt?: any;
    // Additional fields used in AuthContext
    cpf?: string;
    cns?: string;
    unidadeSaudeId?: string;
    originalRole?: 'professional' | 'patient' | 'admin';
}
