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
                    <h2 className="text-2xl font-bold text-[#0054A6]">Protocolos de Grupo</h2>
                    <p className="text-slate-500 mt-1">Biblioteca de modelos baseados em evidências para o SUS.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {PROTOCOLS.map(protocol => (
                    <div key={protocol.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group relative overflow-hidden">
                        {/* Decorative Gradient Line */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${protocol.id === 'pnct' ? 'bg-orange-400' :
                            protocol.id === 'prenatal' ? 'bg-[#F5A3D3]' :
                                'bg-[#0054A6]'
                            }`}></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${protocol.type === 'closed'
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-blue-50 text-[#0054A6]'
                                }`}>
                                {protocol.type === 'closed' ? 'Grupo Fechado' : 'Fluxo Contínuo'}
                            </div>
                            <button className="text-slate-300 hover:text-[#0054A6] transition-colors">
                                <BookOpen size={22} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#0054A6] transition-colors">{protocol.title}</h3>
                        <p className="text-slate-600 text-sm mb-8 flex-grow leading-relaxed">{protocol.description}</p>

                        <div className="flex items-center gap-6 text-sm text-slate-500 mb-8">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-slate-400" />
                                <span className="font-medium">{protocol.sessions > 0 ? `${protocol.sessions} Sessões` : 'Contínuo'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-slate-400" />
                                <span className="font-medium">10-15 Participantes</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {protocol.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 bg-[#F6F8FE] text-slate-600 text-xs rounded-lg font-bold border border-slate-100">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <button className="w-full py-3.5 bg-[#0054A6] text-white font-bold rounded-xl hover:bg-[#004080] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 group-hover:scale-[1.02]">
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
