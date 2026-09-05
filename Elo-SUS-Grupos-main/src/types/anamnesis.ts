export interface Assessment {
    id: string;
    type: 'fagerstrom' | 'anxiety' | 'depression' | 'other';
    score: number;
    result: string; // e.g., "Dependência Elevada"
    date: string;
    details?: unknown; // Specific answers
}

export interface Anamnesis {
    id: string;
    referralId: string;
    patientId: string;
    professionalId: string;
    date: string;
    mainComplaint: string;
    history: string;
    riskAssessment: string;
    assessments: Assessment[];
    notes?: string;
}
