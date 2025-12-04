export interface Appointment {
    id: string;
    groupId: string;
    patientId?: string;
    type: 'group' | 'individual';
    date: Date | string; // Allow string for Firestore compatibility (ISO string)
    room: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    topic?: string;
    googleCalendarId?: string;
    meetLink?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt?: any;
}
