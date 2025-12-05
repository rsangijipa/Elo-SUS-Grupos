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

export type DischargeStatus = 'ACTIVE' | 'DISCHARGED' | 'DROPOUT' | 'TRANSFERRED' | 'SHARED_CARE';
export type DischargeType = 'IMPROVEMENT' | 'REFERRAL' | 'ABANDONMENT' | 'SHARED_CARE';

export interface Enrollment {
    id: string; // Unique enrollment ID
    patientId: string;
    groupId: string;
    status: DischargeStatus;
    joinDate: string; // ISO Date
    endDate?: string; // ISO Date
    dischargeType?: DischargeType;
    dischargeReason?: string;
    cidCodeSecondary?: string; // Override group CID if patient has specific comorbidity
    destinationUnit?: string; // If referral
}
