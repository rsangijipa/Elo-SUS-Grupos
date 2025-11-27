export interface Patient {
    id?: string;
    name: string;
    birthDate: string; // ISO String or YYYY-MM-DD
    sexo?: 'M' | 'F' | 'Outro';
    cpf?: string;
    cns?: string;
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
}
