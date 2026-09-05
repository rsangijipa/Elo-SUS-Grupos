import { Brain, Cigarette, Baby, Activity } from 'lucide-react';
import { GroupProtocol } from '../types/group';

export interface ProtocolConfig {
    id: GroupProtocol;
    name: string;
    description: string;
    icon: any;
    defaultDuration: number; // in weeks
    color: string;
    themeColor: string; // Hex for UI accents
}

export const PROTOCOLS: Record<GroupProtocol, ProtocolConfig> = {
    STANDARD: {
        id: 'STANDARD',
        name: 'Grupo Padrão',
        description: 'Grupo terapêutico geral com evolução padrão.',
        icon: Activity,
        defaultDuration: 12,
        color: 'bg-blue-500',
        themeColor: '#3B82F6'
    },
    TABAGISMO: {
        id: 'TABAGISMO',
        name: 'Controle do Tabagismo (PNCT)',
        description: 'Protocolo clínico do INCA para cessação do tabagismo com teste de Fagerström.',
        icon: Cigarette,
        defaultDuration: 4,
        color: 'bg-orange-500',
        themeColor: '#F97316'
    },
    GESTANTE: {
        id: 'GESTANTE',
        name: 'Grupo de Gestantes',
        description: 'Acompanhamento pré-natal e saúde mental materna.',
        icon: Baby,
        defaultDuration: 9,
        color: 'bg-pink-500',
        themeColor: '#EC4899'
    },
    ANSIEDADE_DEPRESSAO: {
        id: 'ANSIEDADE_DEPRESSAO',
        name: 'Ansiedade e Depressão',
        description: 'Terapia cognitivo-comportamental em grupo.',
        icon: Brain,
        defaultDuration: 8,
        color: 'bg-purple-500',
        themeColor: '#A855F7'
    }
};
