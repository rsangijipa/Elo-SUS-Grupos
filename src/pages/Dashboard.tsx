import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Database, AlertCircle, ArrowRight } from 'lucide-react';
import { seedDatabase } from '../utils/seedData';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/groupService';
import { patientService } from '../services/patientService';
import { sessionService } from '../services/sessionService';
import type { Group } from '../types/group';
import { GROUP_TYPES } from '../types/group';
import type { Patient } from '../types/patient';
import type { Session } from '../types/session';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';

const COLORS = ['#0054A6', '#0B8A4D', '#FFC857', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC = () => {
    const { user, userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeGroups: 0,
        totalPatients: 0,
        scheduledSessions: 0,
        waitingList: 0
    });
    const [groups, setGroups] = useState<Group[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [groupsByType, setGroupsByType] = useState<{ name: string, value: number }[]>([]);

    useEffect(() => {
        if (!authLoading && userProfile) {
            loadDashboardData();
        }
    }, [authLoading, userProfile]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            let fetchedGroups: Group[] = [];
            let fetchedPatients: Patient[] = [];

            if (userProfile?.role === 'terapeuta') {
                fetchedGroups = await groupService.getByTherapist(user!.uid);
            } else {
                fetchedGroups = await groupService.getAll(userProfile?.unidadeSaudeId);
                fetchedPatients = await patientService.getAll(userProfile?.unidadeSaudeId || '');
            }

            const activeGroupsCount = fetchedGroups.filter(g => g.ativo).length;

            const typeCount: Record<string, number> = {};
            fetchedGroups.forEach(g => {
                const typeName = GROUP_TYPES[g.tipoGrupo];
                typeCount[typeName] = (typeCount[typeName] || 0) + 1;
            });
            const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
            setGroupsByType(typeData);

            const allSessions = await sessionService.getUpcoming();
            const groupIds = new Set(fetchedGroups.map(g => g.id));
            const relevantSessions = allSessions.filter(s => groupIds.has(s.grupoId));
            setUpcomingSessions(relevantSessions.slice(0, 5));

            setGroups(fetchedGroups);
            setStats({
                activeGroups: activeGroupsCount,
                totalPatients: fetchedPatients.length,
                scheduledSessions: relevantSessions.length,
                waitingList: 0
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                    Carregando painel...
                </div>
            </div>
        );
    }

    const isTherapist = userProfile?.role === 'terapeuta';

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
                    <p className="text-slate-500 mt-1">
                        Acompanhe grupos ativos, pacientes atendidos e sua agenda de sessões.
                    </p>
                </div>
                <button
                    onClick={seedDatabase}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0054A6] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                    title="Gerar dados de demonstração"
                >
                    <Database size={16} />
                    Seed Data (Dev)
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Meus Grupos</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{groups.length}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-[#0054A6]">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-400">
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <ArrowRight size={12} /> Ativos
                        </span>
                        <span className="ml-1">na unidade</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Grupos Ativos</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeGroups}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-[#0B8A4D]">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Em andamento
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Sessões Agendadas</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.scheduledSessions}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl text-[#FFC857]">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Próximos 7 dias
                    </div>
                </div>

                {!isTherapist && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Pacientes</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPatients}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">
                            Cadastrados na unidade
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Sessions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Próximas Sessões</h3>
                    </div>
                    <div className="p-6">
                        {upcomingSessions.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Nenhuma sessão agendada.</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.map((session) => {
                                    const group = groups.find(g => g.id === session.grupoId);
                                    return (
                                        <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-14 text-center bg-white rounded-lg border border-slate-200 p-2 shadow-sm group-hover:border-blue-200 transition-colors">
                                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                        {new Date(session.data).toLocaleDateString('pt-BR', { month: 'short' })}
                                                    </span>
                                                    <span className="block text-xl font-bold text-slate-900">
                                                        {new Date(session.data).getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">{group?.titulo || 'Grupo Desconhecido'}</h4>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                        <Calendar size={14} />
                                                        {session.horarioInicio} - {session.salaOuLocal}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/grupos/${session.grupoId}`)}
                                                className="p-2 text-slate-400 hover:text-[#0054A6] hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Distribuição de Grupos</h3>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={groupsByType}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {groupsByType.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Avisos e Atividades</h3>
                </div>
                <div className="p-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-[#0054A6] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-[#0054A6]">
                                Bem-vindo ao novo sistema Elo SUS Grupos!
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                O sistema foi atualizado com uma nova interface mais moderna e intuitiva.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
