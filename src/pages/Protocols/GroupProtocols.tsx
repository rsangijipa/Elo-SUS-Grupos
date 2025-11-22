import React from 'react';
import { BookOpen, Clock, Users, ArrowRight, FileText } from 'lucide-react';

interface Protocol {
    id: string;
    title: string;
    description: string;
    sessions: number;
    type: 'closed' | 'continuous';
    tags: string[];
    color: string;
}

const PROTOCOLS: Protocol[] = [
    {
        id: 'pnct',
        title: 'Tabagismo (PNCT)',
        description: 'Programa Nacional de Controle do Tabagismo. Abordagem cognitivo-comportamental para cessação do fumo.',
        sessions: 4,
        type: 'closed',
        tags: ['PNCT', 'Adicção', 'Grupo Fechado'],
        color: 'bg-orange-100 text-orange-700'
    },
    {
        id: 'prenatal',
        title: 'Pré-Natal Psicológico',
        description: 'Acompanhamento gestacional com foco na prevenção de depressão pós-parto e fortalecimento do vínculo mãe-bebê.',
        sessions: 8,
        type: 'closed',
        tags: ['Gestantes', 'Prevenção', 'Vínculo'],
        color: 'bg-pink-100 text-pink-700'
    },
    {
        id: 'ansiedade',
        title: 'Ansiedade e Regulação Emocional',
        description: 'Grupo contínuo para desenvolvimento de estratégias de enfrentamento e técnicas de relaxamento.',
        sessions: 0, // Continuous
        type: 'continuous',
        tags: ['Saúde Mental', 'Contínuo', 'TCC'],
        color: 'bg-blue-100 text-blue-700'
    }
];

const GroupProtocols: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Protocolos de Grupo</h2>
                    <p className="text-slate-500 mt-1">Biblioteca de modelos baseados em evidências para o SUS.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {PROTOCOLS.map(protocol => (
                    <div key={protocol.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${protocol.color}`}>
                                {protocol.type === 'closed' ? 'Grupo Fechado' : 'Fluxo Contínuo'}
                            </div>
                            <button className="text-slate-400 hover:text-blue-600">
                                <BookOpen size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2">{protocol.title}</h3>
                        <p className="text-slate-600 text-sm mb-6 flex-grow">{protocol.description}</p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{protocol.sessions > 0 ? `${protocol.sessions} Sessões` : 'Contínuo'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users size={16} />
                                <span>10-15 Participantes</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {protocol.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <FileText size={18} />
                            Usar Modelo
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupProtocols;
