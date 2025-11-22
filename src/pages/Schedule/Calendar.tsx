import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Users, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import type { Session } from '../../types/session';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Calendar: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await sessionService.getUpcoming();
            setSessions(data);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Agenda de Sessões</h2>
                    <p className="text-slate-500 mt-1">
                        Visualize e gerencie os próximos encontros dos grupos.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm transition-colors">
                        Hoje
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0054A6] text-white rounded-lg hover:bg-[#004080] font-medium shadow-sm transition-colors">
                        <CalendarIcon size={18} />
                        Nova Sessão
                    </button>
                </div>
            </div>

            {/* Calendar List Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon size={20} className="text-[#0054A6]" />
                        Próximos Encontros
                    </h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0054A6] rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500">Carregando agenda...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="text-slate-300" size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">Nenhuma sessão agendada para os próximos dias.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sessions.map((session) => (
                            <div key={session.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-6 group">
                                {/* Date Badge */}
                                <div className="flex-shrink-0 w-16 text-center bg-white rounded-xl border border-slate-200 p-2 shadow-sm group-hover:border-blue-200 transition-colors">
                                    <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        {format(parseISO(session.data), 'MMM', { locale: ptBR })}
                                    </span>
                                    <span className="block text-2xl font-bold text-slate-900">
                                        {format(parseISO(session.data), 'dd')}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${session.status === 'realizada' ? 'bg-emerald-50 text-emerald-700' :
                                                session.status === 'cancelada' ? 'bg-red-50 text-red-700' :
                                                    'bg-amber-50 text-amber-700'
                                            }`}>
                                            {session.status}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                            <Clock size={14} />
                                            {session.horarioInicio} - {session.horarioFim}
                                        </span>
                                    </div>

                                    <h4 className="text-lg font-bold text-slate-900 truncate group-hover:text-[#0054A6] transition-colors">
                                        {session.temaDaSessao || 'Sessão de Grupo Terapêutico'}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={16} className="text-slate-400" />
                                            {session.salaOuLocal}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users size={16} className="text-slate-400" />
                                            Grupo ID: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{session.grupoId.substring(0, 8)}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0054A6] hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-100 transition-all">
                                        Detalhes
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#0054A6] hover:bg-[#004080] rounded-lg shadow-sm transition-all">
                                        Lista de Presença <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
