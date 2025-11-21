import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckCircle, Database, AlertCircle } from 'lucide-react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
                // Therapist View: Fetch only their groups
                fetchedGroups = await groupService.getByTherapist(user!.uid);
                // For patients, we ideally filter by those in their groups, but for now fetching all for the unit or just count
                // Let's just show total patients in the system for now or 0 if we want to be strict
                // fetchedPatients = await patientService.getAll(userProfile.unidadeSaudeId); 
            } else {
                // Admin/Coordinator View: Fetch all
                fetchedGroups = await groupService.getAll(userProfile?.unidadeSaudeId);
                fetchedPatients = await patientService.getAll(userProfile?.unidadeSaudeId || '');
            }

            // Calculate stats
            const activeGroupsCount = fetchedGroups.filter(g => g.ativo).length;

            // Group by type for chart
            const typeCount: Record<string, number> = {};
            fetchedGroups.forEach(g => {
                const typeName = GROUP_TYPES[g.tipoGrupo];
                typeCount[typeName] = (typeCount[typeName] || 0) + 1;
            });
            const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
            setGroupsByType(typeData);

            // Sessions (Mocking "upcoming" for now as sessionService.getUpcoming fetches all)
            // In a real scenario, we'd filter by the fetched groups
            const allSessions = await sessionService.getUpcoming();
            const groupIds = new Set(fetchedGroups.map(g => g.id));
            const relevantSessions = allSessions.filter(s => groupIds.has(s.grupoId));
            setUpcomingSessions(relevantSessions.slice(0, 5)); // Top 5

            setGroups(fetchedGroups);
            setStats({
                activeGroups: activeGroupsCount,
                totalPatients: fetchedPatients.length, // This might be 0 for therapists if we didn't fetch
                scheduledSessions: relevantSessions.length,
                waitingList: 0 // Placeholder
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;
    }

    const isTherapist = userProfile?.role === 'terapeuta';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Olá, {userProfile?.displayName || 'Usuário'}
                    </h2>
                    <p className="text-gray-500">
                        {isTherapist ? 'Painel do Terapeuta' : 'Painel Administrativo'}
                    </p>
                </div>
                <button
                    onClick={seedDatabase}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 border border-purple-200"
                    title="Gerar dados de demonstração"
                >
                    <Database size={14} />
                    Seed Data
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-md p-3 bg-blue-500">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Meus Grupos</dt>
                                <dd className="text-lg font-medium text-gray-900">{groups.length}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-md p-3 bg-green-500">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Grupos Ativos</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.activeGroups}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-md p-3 bg-purple-500">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Sessões Agendadas</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.scheduledSessions}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                {!isTherapist && (
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md p-3 bg-yellow-500">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pacientes</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalPatients}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Próximas Sessões</h3>
                    {upcomingSessions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhuma sessão agendada.</p>
                    ) : (
                        <div className="space-y-4">
                            {upcomingSessions.map((session) => {
                                const group = groups.find(g => g.id === session.grupoId);
                                return (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-12 text-center bg-white rounded border border-gray-200 p-1">
                                                <span className="block text-xs text-gray-500">
                                                    {new Date(session.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                                </span>
                                                <span className="block text-lg font-bold text-gray-900">
                                                    {new Date(session.data).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{group?.titulo || 'Grupo Desconhecido'}</h4>
                                                <p className="text-sm text-gray-500">{session.horarioInicio} - {session.salaOuLocal}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/grupos/${session.grupoId}`)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Ver Grupo
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Charts (Only for Admin/Coordinator or if Therapist wants to see their group distribution) */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Grupos</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={groupsByType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {groupsByType.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Notifications (Placeholder for now) */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Avisos e Atividades</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                            <div>
                                <p className="text-sm text-blue-700">
                                    Bem-vindo ao novo sistema Elo SUS Grupos!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
