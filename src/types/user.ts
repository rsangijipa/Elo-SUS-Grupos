export type UserRole = 'terapeuta' | 'coordenador' | 'administrador';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    unidadeSaudeId?: string;
    createdAt: any; // Firestore Timestamp
    updatedAt?: any;
}
