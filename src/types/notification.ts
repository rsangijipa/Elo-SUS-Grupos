export interface Notification {
    id?: string;
    grupoId: string;
    pacienteId?: string; // Optional, if null it's for the whole group
    tipo: 'whatsapp' | 'email' | 'sms';
    status: 'enviada' | 'pendente' | 'falha';
    mensagem: string;
    dataEnvio: string;
    createdAt?: unknown;
}
