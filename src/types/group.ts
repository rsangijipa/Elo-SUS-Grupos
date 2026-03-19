export type GroupProtocol = 'STANDARD' | 'TABAGISMO' | 'GESTANTE' | 'ANSIEDADE_DEPRESSAO';

export type GroupStatus = 'active' | 'completed' | 'archived' | 'planned' | 'paused' | 'closed';

export interface Group {
    id: string;
    name: string;
    description: string;
    facilitatorId: string;
    schedule: string;
    room: string;
    protocol: GroupProtocol;
    status: GroupStatus;
    cidCode?: string; // CID-10 Principal do Grupo
    participants?: string[]; // List of patient IDs
    metrics?: Record<string, string | number | boolean>;
    protocolConfig?: {
        totalSessions?: number;
        materials?: string[];
    };
    maxParticipants?: number;
}
