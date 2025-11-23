export type UserRole = 'professional' | 'patient' | 'admin';

export type GroupStatus = 'active' | 'waiting' | 'paused' | 'completed';

export interface SupportMessage {
    name: string;
    surname: string;
    email: string;
    message: string;
    timestamp: number;
}

export interface SupportPayload extends SupportMessage {
    userId?: string; // Optional, if logged in
}
