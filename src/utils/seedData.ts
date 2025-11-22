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
    emergencyContact?: {
        name: string;
        phone: string;
        relation: string;
    };
    phone?: string;
    address?: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    schedule: string; // e.g., "Segundas, 14h"
    room: string;
    status: 'active' | 'completed' | 'paused';
    facilitatorId: string;
}

export interface Patient {
    id: string;
    name: string;
    cns: string; // Cartão Nacional de Saúde
    birthDate: string;
    status: 'active' | 'waiting' | 'inactive';
    groupId?: string; // Linked to a Group
    phone: string;
}

export interface Appointment {
    id: string;
    groupId: string;
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
    emergencyContact: {
        name: 'Carlos Oliveira',
        phone: '(11) 98888-7777',
        relation: 'Marido'
    }
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
    emergencyContact: {
        name: '',
        phone: '',
        relation: ''
    }
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
        facilitatorId: 'u1'
    },
    {
        id: 'g2',
        name: 'Grupo de Gestantes',
        description: 'Acompanhamento pré-natal psicológico e troca de experiências.',
        schedule: 'Quartas, 09:00',
        room: 'Auditório - UBS Centro',
        status: 'active',
        facilitatorId: 'u1'
    },
    {
        id: 'g3',
        name: 'Regulação Emocional (Ansiedade)',
        description: 'Estratégias de coping para transtornos de ansiedade leve a moderada.',
        schedule: 'Sextas, 16:00',
        room: 'Sala 02 - CAPS II',
        status: 'active',
        facilitatorId: 'u1'
    },
    {
        id: 'g4',
        name: 'Famílias TEA',
        description: 'Suporte para familiares de crianças no espectro autista.',
        schedule: 'Terças, 18:00',
        room: 'Sala de Reuniões - CRAS',
        status: 'paused',
        facilitatorId: 'u1'
    }
];

export const MOCK_PATIENTS: Patient[] = [
    { id: 'p1', name: 'Maria Aparecida Santos', cns: '700.1234.5678.9012', birthDate: '1980-05-12', status: 'active', groupId: 'g1', phone: '(11) 99999-1111' },
    { id: 'p2', name: 'José Carlos Oliveira', cns: '700.2345.6789.0123', birthDate: '1975-08-20', status: 'active', groupId: 'g1', phone: '(11) 98888-2222' },
    { id: 'p3', name: 'Ana Beatriz Souza', cns: '700.3456.7890.1234', birthDate: '1992-03-15', status: 'active', groupId: 'g2', phone: '(11) 97777-3333' },
    { id: 'p4', name: 'Carlos Eduardo Lima', cns: '700.4567.8901.2345', birthDate: '1988-11-30', status: 'waiting', groupId: 'g3', phone: '(11) 96666-4444' },
    { id: 'p5', name: 'Fernanda Costa', cns: '700.5678.9012.3456', birthDate: '1995-07-08', status: 'waiting', groupId: 'g3', phone: '(11) 95555-5555' },
    { id: 'p6', name: 'Roberto Almeida', cns: '700.6789.0123.4567', birthDate: '1960-01-25', status: 'active', groupId: 'g1', phone: '(11) 94444-6666' },
    { id: 'p7', name: 'Luciana Pereira', cns: '700.7890.1234.5678', birthDate: '1985-09-10', status: 'active', groupId: 'g2', phone: '(11) 93333-7777' },
    { id: 'p8', name: 'Paulo Mendes', cns: '700.8901.2345.6789', birthDate: '1990-12-05', status: 'waiting', groupId: 'g1', phone: '(11) 92222-8888' },
    { id: 'p9', name: 'Juliana Rocha', cns: '700.9012.3456.7890', birthDate: '1998-04-22', status: 'active', groupId: 'g3', phone: '(11) 91111-9999' },
    { id: 'p10', name: 'Marcos Vinícius', cns: '700.0123.4567.8901', birthDate: '2000-06-18', status: 'waiting', groupId: 'g4', phone: '(11) 90000-0000' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'a1',
        groupId: 'g1',
        date: setTime(today, 14, 0), // Today 14:00
        room: 'Sala 04 - UBS Centro',
        status: 'scheduled',
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
        topic: 'Mudanças emocionais na gestação'
    },
    {
        id: 'a3',
        groupId: 'g3',
        date: setTime(addDays(today, 5), 16, 0), // In 5 days 16:00
        room: 'Sala 02 - CAPS II',
        status: 'scheduled',
        topic: 'Técnicas de respiração diafragmática'
    },
    {
        id: 'a4',
        groupId: 'g1',
        date: setTime(addDays(today, 8), 14, 0), // Next week
        room: 'Sala 04 - UBS Centro',
        status: 'scheduled',
        topic: 'Prevenção de recaídas'
    }
];
