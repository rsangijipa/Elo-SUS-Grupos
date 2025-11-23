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
    metrics?: Record<string, any>; // For protocol-specific aggregated data
    protocolConfig?: {
        totalSessions?: number;
        materials?: string[];
    };
}
