import React from 'react';
import { Users, Calendar, FileText, AlertCircle, Clock } from 'lucide-react';
import { MOCK_GROUPS, MOCK_PATIENTS, MOCK_APPOINTMENTS } from '../../utils/seedData';
import { useAuth } from '../../contexts/AuthContext';

const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();

    // Filter data based on the current user
    // If it's the demo user (u1), they get the mock data.
    // New users will have no groups initially.
    const myGroups = MOCK_GROUPS.filter(g => g.facilitatorId === user?.id);
    const myGroupIds = myGroups.map(g => g.id);

    const myPatients = MOCK_PATIENTS.filter(p => p.groupId && myGroupIds.includes(p.groupId));
    const myAppointments = MOCK_APPOINTMENTS.filter(a => myGroupIds.includes(a.groupId));

    const activeGroups = myGroups.filter(g => g.status === 'active').length;
    const totalPatients = myPatients.length;
    const waitingList = myPatients.filter(p => p.status === 'waiting').length;

    // Filter appointments for "today" (mock logic: just take the first 2 for demo)
    const todaysAppointments = myAppointments.slice(0, 2);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-[#0054A6]">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                            +12% mês
                        </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Pacientes Ativos</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalPatients}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                            {activeGroups} ativos
                        </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Grupos Terapêuticos</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{myGroups.length}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded-lg">
                            Atenção
                        </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Fila de Espera</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{waitingList}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Widget */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Calendar size={20} className="text-[#0054A6]" />
                            Agenda de Hoje
                        </h3>
                        <button className="text-sm text-[#0054A6] font-medium hover:underline">
                            Ver calendário completo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {todaysAppointments.map(apt => (
                            <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className="flex-shrink-0 w-16 text-center">
                                    <div className="text-sm font-bold text-slate-900">
                                        {apt.date.getHours()}:{apt.date.getMinutes().toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {apt.date.getHours() + 1}:00
                                    </div>
                                </div>
                                <div className="w-1 bg-blue-200 self-stretch rounded-full"></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">
                                        {myGroups.find(g => g.id === apt.groupId)?.name || 'Sessão de Grupo'}
                                    </h4>
                                    <p className="text-sm text-slate-600 mt-1">{apt.topic}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            12 confirmados
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            60 min
                                        </span>
                                    </div>
                                </div>
                                {apt.meetLink && (
                                    <a
                                        href={apt.meetLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 bg-blue-100 text-[#0054A6] text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Entrar no Meet
                                    </a>
                                )}
                            </div>
                        ))}

                        {todaysAppointments.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                Nenhuma sessão agendada para hoje.
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications / Pending Reports */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-orange-500" />
                            Pendências
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-orange-700">Relatórios</span>
                                    <span className="text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">Urgente</span>
                                </div>
                                <p className="text-sm text-slate-700 font-medium">3 relatórios de evolução pendentes</p>
                                <button className="text-xs text-orange-700 font-bold mt-2 hover:underline">Resolver agora</button>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-600">Solicitações</span>
                                </div>
                                <p className="text-sm text-slate-700 font-medium">2 novos pacientes na fila de espera</p>
                                <button className="text-xs text-[#0054A6] font-bold mt-2 hover:underline">Ver lista</button>
                            </div>
                        </div>
                    </div>

                    {/* Reports Placeholder */}
                    <div className="bg-gradient-to-br from-[#0054A6] to-[#004080] p-6 rounded-2xl shadow-sm text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h3 className="font-bold">Produção do Mês</h3>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold">45</span>
                            <span className="text-sm text-blue-100 mb-1">atendimentos</span>
                        </div>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-xs text-blue-100 mt-2">Meta mensal: 60 atendimentos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
