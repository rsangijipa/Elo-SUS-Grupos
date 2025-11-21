import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import { Session } from '../../types/session';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Agenda de Sessões</h2>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Hoje
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                        Nova Sessão
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-medium text-gray-700">Próximos Encontros</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando agenda...</div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Nenhuma sessão agendada para os próximos dias.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sessions.map((session) => (
                            <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-shrink-0 w-16 text-center bg-blue-50 rounded-lg border border-blue-100 p-2">
                                    <span className="block text-xs text-blue-600 uppercase font-bold">
                                        {format(parseISO(session.data), 'MMM', { locale: ptBR })}
                                    </span>
                                    <span className="block text-xl font-bold text-blue-800">
                                        {format(parseISO(session.data), 'dd')}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${session.status === 'realizada' ? 'bg-green-100 text-green-800' :
                                                session.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {session.horarioInicio} - {session.horarioFim}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 truncate">
                                        {session.temaDaSessao || 'Sessão de Grupo Terapêutico'}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {session.salaOuLocal}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            Grupo ID: {session.grupoId.substring(0, 8)}...
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 flex gap-2">
                                    <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md border border-transparent hover:border-blue-100">
                                        Detalhes
                                    </button>
                                    <button className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md border border-transparent hover:border-green-100">
                                        Lista de Presença
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
