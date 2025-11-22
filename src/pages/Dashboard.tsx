import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Clock,
    TrendingUp
} from 'lucide-react';
import {
    MOCK_GROUPS,
    MOCK_PATIENTS,
    MOCK_APPOINTMENTS,
    type Appointment
} from '../utils/seedData';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Dashboard State
    const [stats, setStats] = useState({
        activeGroups: 0,
        totalPatients: 0,
        waitingList: 0,
        attendanceRate: 78 // Mocked for now
    });
    const [nextAppointments, setNextAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        // Simulate data loading calculation
        setTimeout(() => {
            // Calculate KPIs from Seed Data
            const activeGroups = MOCK_GROUPS.filter(g => g.status === 'active').length;
            const totalPatients = MOCK_PATIENTS.length;
            const waitingList = MOCK_PATIENTS.filter(p => p.status === 'waiting').length;

            // Filter and Sort Appointments (Future only)
            const now = new Date();
            const upcoming = MOCK_APPOINTMENTS
                .filter(app => new Date(app.date) > now)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 4); // Take top 4

            setStats({
                activeGroups,
                totalPatients,
                waitingList,
                attendanceRate: 78
            });
            setNextAppointments(upcoming);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium">Carregando indicadores...</p>
                </div>
            </div>
        );
    }

    const getGroupName = (id: string) => MOCK_GROUPS.find(g => g.id === id)?.name || 'Grupo Desconhecido';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
                    <p className="text-slate-500 mt-1">
                        Olá, <span className="font-semibold text-blue-700">{user?.name}</span>. Aqui está o resumo da sua unidade hoje.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1">
                        <Clock size={12} /> {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Grupos Ativos</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.activeGroups}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-1 rounded-md">
                        <TrendingUp size={12} className="mr-1" /> +2 novos este mês
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pacientes Atendidos</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPatients}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Total cadastrado na unidade
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Fila de Espera</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.waitingList}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-amber-600 font-medium bg-amber-50 w-fit px-2 py-1 rounded-md">
                        Alta demanda
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Taxa de Presença</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.attendanceRate}%</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Média dos últimos 30 dias
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Agenda (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Calendar size={20} className="text-blue-600" /> Próximos Encontros
                            </h3>
                            <button onClick={() => navigate('/schedule')} className="text-sm text-blue-600 hover:underline font-medium">
                                Ver agenda completa
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {nextAppointments.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    Nenhum agendamento próximo.
                                </div>
                            ) : (
                                nextAppointments.map(app => (
                                    <div key={app.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/groups/${app.groupId}`)}>
                                        <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-2 shadow-sm group-hover:border-blue-300 transition-colors">
                                            <span className="text-xs font-bold text-slate-400 uppercase">
                                                {new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                            </span>
                                            <span className="text-xl font-bold text-slate-800">
                                                {new Date(app.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                {getGroupName(app.groupId)}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} /> {app.room}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Alerts (1/3 width) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <AlertCircle size={20} className="text-amber-500" /> Pendências Clínicas
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <p className="text-sm font-bold text-amber-800 mb-1">Evoluções Pendentes</p>
                                <p className="text-xs text-amber-700">
                                    Você tem 3 evoluções de pacientes do "Grupo Tabagismo" para preencher.
                                </p>
                                <button className="mt-3 text-xs font-bold text-amber-800 hover:underline">Resolver agora</button>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-sm font-bold text-blue-800 mb-1">Aviso da Coordenação</p>
                                <p className="text-xs text-blue-700">
                                    O fechamento do BPA mensal ocorrerá no dia 20. Verifique seus registros.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
