import type { FirestoreDate } from './shared';

export type SessionStatus = 'prevista' | 'realizada' | 'cancelada' | 'adiada';

export interface Session {
    id?: string;
    grupoId: string;
    data: string; // YYYY-MM-DD
    horarioInicio: string; // HH:mm
    horarioFim: string; // HH:mm
    salaOuLocal: string;
    status: SessionStatus;
    temaDaSessao?: string;
    observacoesGerais?: string;
    createdAt?: FirestoreDate;
    updatedAt?: FirestoreDate;
}

export interface Attendance {
    id?: string;
    sessaoId: string;
    pacienteId: string;
    status: 'presente' | 'falta' | 'falta_justificada';
    justificativa?: string;
    observacoes?: string;
}
