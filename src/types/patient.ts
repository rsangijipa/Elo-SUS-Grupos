export interface Patient {
    id?: string;
    name: string;
    birthDate: string; // ISO String or YYYY-MM-DD
    sexo?: 'M' | 'F' | 'Outro';
    cpf?: string;
    cns: string; // Cartão Nacional de Saúde (Required now per new flow)
    motherName: string; // Required for homonym distinction
    originUnit?: string; // UBS de Origem
    email?: string; // Added for user sync
    phone: string;
    status: 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout';
    groupId?: string;
    whatsappResponsavel?: string;
    nomeResponsavel?: string;
    unidadeSaudeId?: string;
    address?: string;
    neighborhood?: string;
    observacoes?: string;
    createdAt?: any;
    updatedAt?: any;
    hasAlert?: boolean; // Flag for emotional risk alert
    stats?: {
        loginStreak: number;
        lastLogin: any;
        totalSessions?: number;
    };
    achievements?: string[]; // Array of achievement IDs
}
