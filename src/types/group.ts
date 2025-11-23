export type GroupProtocol = 'STANDARD' | 'TABAGISMO' | 'GESTANTE' | 'ANSIEDADE_DEPRESSAO';

export type GroupStatus = 'active' | 'completed' | 'archived' | 'planned' | 'paused';

export interface Group {
    id: string;
    name: string;
    description: string;
    facilitatorId: string;
    schedule: string;
    room: string;
    protocol: GroupProtocol;
    status: GroupStatus;
    participants?: string[]; // List of patient IDs
    metrics?: Record<string, any>; // For protocol-specific aggregated data
    protocolConfig?: {
        totalSessions?: number;
        materials?: string[];
    };
}
