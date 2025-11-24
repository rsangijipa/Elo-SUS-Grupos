// import * as dateFns from 'date-fns';
// const { addDays, format, setHours, setMinutes } = dateFns;

// --- Interfaces ---

export interface Resource {
    id: string;
    title: string;
    type: 'pdf' | 'video';
    url: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'professional' | 'patient';
    avatar?: string;
    cpf?: string;

    // Professional specific
    crp?: string; // Conselho Regional de Psicologia
    specialty?: string;
    approach?: string; // Abordagem (TCC, Psicanálise, etc.)
    bio?: string;

    // Patient specific
    cns?: string; // Cartão Nacional de Saúde
    nextAppointment?: Date;
    recommendedVideo?: {
        title: string;
        videoId: string;
    };
    materials?: Resource[];
    emergencyContact?: string; // Name + Phone
    phone?: string;
    address?: string;
}

import { Group } from '../types/group';

export interface Patient {
    id: string;
    name: string;
    cns: string; // Cartão Nacional de Saúde
    birthDate: string;
    status: 'active' | 'waiting' | 'inactive';
    groupId?: string; // Linked to a Group
    cpf?: string;
    phone: string;
}

export interface Appointment {
    id: string;
    groupId: string;
    patientId?: string;
    type: 'group' | 'individual';
    date: Date;
    room: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    topic?: string;
    googleCalendarId?: string;
    meetLink?: string;
}

// --- Mock Data ---

const today = new Date();
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const setTime = (date: Date, hours: number, minutes: number) => {
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
};

export const MOCK_PROFESSIONAL: User = {
    id: 'u1',
    name: 'Dr. João Silva',
    email: 'joao.silva@elosus.saude.gov.br',
    role: 'professional',
    crp: '12/34567',
    approach: 'TCC - Terapia Cognitivo Comportamental',
    specialty: 'Psicologia Clínica',
    avatar: 'JS',
    bio: 'Especialista em terapia de grupo e saúde mental coletiva.'
};

export const MOCK_PATIENT: User = {
    id: 'p1',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    role: 'patient',
    cns: '700.1234.5678.9012',
    phone: '(11) 99999-8888',
    avatar: 'MO',
    nextAppointment: setTime(addDays(today, 2), 14, 0), // 2 days from now at 14:00
    recommendedVideo: {
        title: "Como lidar com a ansiedade",
        videoId: "dQw4w9WgXcQ"
    },
    materials: [
        { id: 'm1', title: 'Guia de Respiração.pdf', type: 'pdf', url: '#' },
        { id: 'm2', title: 'Diário de Emoções.pdf', type: 'pdf', url: '#' }
    ],
    emergencyContact: 'Carlos Oliveira (Marido) - (11) 98888-7777'
};

// Initial states for new users
export const INITIAL_PROFESSIONAL_STATE: Omit<User, 'id' | 'name' | 'email'> = {
    role: 'professional',
    crp: '',
    approach: '',
    specialty: 'Psicologia',
    bio: ''
};

export const INITIAL_PATIENT_STATE: Omit<User, 'id' | 'name' | 'email'> = {
    role: 'patient',
    cns: '',
    phone: '',
    materials: [],
    emergencyContact: ''
};

// Default export for backward compatibility if needed, but prefer named exports
export const MOCK_USER = MOCK_PROFESSIONAL;

export const MOCK_GROUPS: Group[] = [
    {
        id: 'g1',
        name: 'Grupo de Tabagismo (PNCT)',
        description: 'Apoio para cessação do tabagismo com abordagem cognitivo-comportamental.',
        schedule: 'Segundas, 14:00',
        room: 'Sala 04 - UBS Centro',
        status: 'active',
        facilitatorId: 'u1',
        protocol: 'TABAGISMO'
    },
    {
        id: 'g2',
        name: 'Grupo de Gestantes',
        description: 'Acompanhamento pré-natal psicológico e troca de experiências.',
        schedule: 'Quartas, 09:00',
        room: 'Auditório - UBS Centro',
        status: 'active',
        facilitatorId: 'u1',
        protocol: 'GESTANTE'
    },
    {
        id: 'g3',
        name: 'Regulação Emocional (Ansiedade)',
        description: 'Estratégias de coping para transtornos de ansiedade leve a moderada.',
        schedule: 'Sextas, 16:00',
        room: 'Sala 02 - CAPS II',
        status: 'active',
        facilitatorId: 'u1',
        protocol: 'ANSIEDADE_DEPRESSAO'
    },
    {
        id: 'g4',
        name: 'Famílias TEA',
        description: 'Suporte para familiares de crianças no espectro autista.',
        schedule: 'Terças, 18:00',
        room: 'Sala de Reuniões - CRAS',
        status: 'paused',
        facilitatorId: 'u1',
        protocol: 'STANDARD'
    }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'a1',
        groupId: 'g1',
        date: setTime(today, 14, 0), // Today 14:00
        room: 'Sala 04 - UBS Centro',
        status: 'scheduled',
        type: 'group',
        topic: 'Estratégias para lidar com a fissura',
        googleCalendarId: 'evt_123',
        meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
        id: 'a2',
        groupId: 'g2',
        date: setTime(addDays(today, 3), 9, 0), // In 3 days 09:00
        room: 'Auditório - UBS Centro',
        status: 'scheduled',
        type: 'group',
        topic: 'Mudanças emocionais na gestação'
    },
    {
        id: 'a3',
        groupId: 'g3',
        date: setTime(addDays(today, 5), 16, 0), // In 5 days 16:00
        room: 'Sala 02 - CAPS II',
        status: 'scheduled',
        type: 'group',
        topic: 'Técnicas de respiração diafragmática'
    },
    {
        id: 'a4',
        groupId: 'g1',
        date: setTime(addDays(today, 8), 14, 0), // Next week
        room: 'Sala 04 - UBS Centro',
        status: 'scheduled',
        type: 'group',
        topic: 'Prevenção de recaídas'
    }
];

export const DEMO_PATIENTS: Patient[] = Array.from({ length: 20 }, (_, i) => ({
    id: `p${i + 1}`,
    name: [
        'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Souza', 'Fernanda Lima',
        'Roberto Costa', 'Patricia Pereira', 'Lucas Ferreira', 'Juliana Alves', 'Marcos Rocha',
        'Camila Gomes', 'Ricardo Martins', 'Sandra Ribeiro', 'Paulo Barbosa', 'Beatriz Lopes',
        'Gabriel Dias', 'Larissa Castro', 'Felipe Moraes', 'Renata Cardoso', 'Thiago Nunes'
    ][i],
    cns: `700.${Math.floor(Math.random() * 10000)}.${Math.floor(Math.random() * 10000)}.${Math.floor(Math.random() * 10000)}`,
    birthDate: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
    status: i < 15 ? 'active' : 'waiting',
    groupId: i < 15 ? ['g1', 'g2', 'g3'][i % 3] : undefined,
    phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`
}));

// Alias for backward compatibility if needed, or just use DEMO_PATIENTS
export const MOCK_PATIENTS = DEMO_PATIENTS;

export const generateDemoData = () => {
    localStorage.setItem('elosus_patients', JSON.stringify(DEMO_PATIENTS));
    localStorage.setItem('elosus_groups', JSON.stringify(MOCK_GROUPS));
    localStorage.setItem('elosus_appointments', JSON.stringify(MOCK_APPOINTMENTS));
    localStorage.setItem('elosus_referrals', JSON.stringify([])); // Initialize empty referrals
    window.location.reload();
};
