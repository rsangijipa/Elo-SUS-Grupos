export type DependenceLevel = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Elevado' | 'Muito Elevado';

export type MotivationStage = 'pre-contemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance';

export interface FagerstromQuestion {
    id: string;
    question: string;
    options: { label: string; value: number }[];
    selectedOption?: number;
}

export interface TobaccoAnamnesis {
    id: string;
    patientId: string;
    date: string; // ISO Date

    smokingHistory: {
        startAge: number;
        dailyQuantity: number;
        type: 'industrial' | 'straw' | 'eletronic' | 'other';
        associatedTriggers: string[]; // e.g., 'coffee', 'alcohol', 'stress'
    };

    fagerstrom: {
        questions: FagerstromQuestion[];
        totalScore: number;
        dependenceLevel: DependenceLevel;
    };

    attemptsToQuit: {
        count: number;
        methodsUsed: string[];
        withdrawalSymptoms: string[];
    };

    comorbidities: {
        hypertension: boolean;
        diabetes: boolean;
        respiratory: boolean; // COPD, Asthma
        cardiac: boolean;
        psychiatric: boolean; // Depression, Anxiety
        other?: string;
    };

    monoximetry?: {
        co: number; // ppm
        hbco: number; // %
        lastCigaretteTime: string; // ISO Date
    };

    motivationStage: MotivationStage;
    notes?: string;
}

export const INITIAL_FAGERSTROM_QUESTIONS: FagerstromQuestion[] = [
    {
        id: 'q1',
        question: 'Quanto tempo após acordar você fuma o primeiro cigarro?',
        options: [
            { label: 'Dentro de 5 minutos', value: 3 },
            { label: 'Entre 6 e 30 minutos', value: 2 },
            { label: 'Entre 31 e 60 minutos', value: 1 },
            { label: 'Após 60 minutos', value: 0 }
        ]
    },
    {
        id: 'q2',
        question: 'Você acha difícil não fumar em locais proibidos?',
        options: [
            { label: 'Sim', value: 1 },
            { label: 'Não', value: 0 }
        ]
    },
    {
        id: 'q3',
        question: 'Qual o cigarro do dia que traz mais satisfação?',
        options: [
            { label: 'O primeiro da manhã', value: 1 },
            { label: 'Outros', value: 0 }
        ]
    },
    {
        id: 'q4',
        question: 'Quantos cigarros você fuma por dia?',
        options: [
            { label: 'Menos de 10', value: 0 },
            { label: 'De 11 a 20', value: 1 },
            { label: 'De 21 a 30', value: 2 },
            { label: 'Mais de 31', value: 3 }
        ]
    },
    {
        id: 'q5',
        question: 'Você fuma mais frequentemente pela manhã?',
        options: [
            { label: 'Sim', value: 1 },
            { label: 'Não', value: 0 }
        ]
    },
    {
        id: 'q6',
        question: 'Você fuma mesmo quando está doente e acamado?',
        options: [
            { label: 'Sim', value: 1 },
            { label: 'Não', value: 0 }
        ]
    }
];
