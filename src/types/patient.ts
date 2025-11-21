export interface Patient {
    id?: string;
    nomeCompleto: string;
    dataNascimento: string; // YYYY-MM-DD
    sexo: 'M' | 'F' | 'Outro';
    cpf?: string;
    cns?: string;
    telefone: string;
    whatsappResponsavel?: string;
    nomeResponsavel?: string;
    unidadeSaudeId: string;
    observacoes?: string;
    createdAt?: any;
    updatedAt?: any;
}
