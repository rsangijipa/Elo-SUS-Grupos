export const COLLECTIONS = {
    USERS: 'users',
    PATIENTS: 'patients',
    GROUPS: 'grupos',
    MATERIALS: 'materials',
    SESSIONS: 'sessions',
    APPOINTMENTS: 'appointments',
    NOTIFICATIONS: 'notifications',
    HEALTH_CHECK: '_health_check'
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
