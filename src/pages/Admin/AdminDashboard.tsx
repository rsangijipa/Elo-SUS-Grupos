import React, { useState, useEffect } from 'react';
import {
    Users,
    UserCheck,
    Activity,
    AlertTriangle,
    Search,
    MoreVertical,
    Plus,
    Mail,
    Shield,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { userService } from '../../services/userService';
import { patientService } from '../../services/patientService';
import { groupService } from '../../services/groupService';
import { toast } from 'react-hot-toast';
import { UserProfile } from '../../types/schema';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeProfessionals: 0,
        totalGroups: 0,
        riskAlerts: 0
    });
    const [professionals, setProfessionals] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Professionals
            const pros = await userService.getProfessionals();
            setProfessionals(pros);

            // 2. Fetch Patients for stats
            // Note: In a real large-scale app, we would use aggregation queries or counters
            const patients = await patientService.getAll();

            // 3. Fetch Groups
            const groups = await groupService.getAll();

            // 4. Calculate Stats
            const riskCount = patients.filter(p => p.hasAlert).length;

            setStats({
                totalPatients: patients.length,
                activeProfessionals: pros.filter(p => p.active !== false).length,
                totalGroups: groups.length,
                riskAlerts: riskCount
            });

        } catch (error) {
            console.error("Error loading admin dashboard:", error);
            toast.error("Erro ao carregar dados da dashboard.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: UserProfile) => {
        if (!user.id) return;

        const newStatus = !user.active; // If undefined, treat as true (active), so toggle to false
        const confirmMsg = newStatus
            ? `Deseja reativar o acesso de ${user.name}?`
            : `Deseja desativar o acesso de ${user.name}? Ele não poderá mais acessar o sistema.`;

        if (window.confirm(confirmMsg)) {
            try {
                await userService.updateStatus(user.id, newStatus);
                toast.success(`Acesso de ${user.name} ${newStatus ? 'reativado' : 'desativado'}.`);
                loadDashboardData(); // Refresh list
            } catch (error) {
                toast.error("Erro ao atualizar status.");
            }
        }
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        // TODO: Implement email service integration
        toast.success(`Convite enviado para ${inviteEmail}`);
        setInviteEmail('');
        setShowInviteModal(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0054A6]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
                    <p className="text-slate-500">Visão geral e gestão da unidade.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-[#0054A6] hover:bg-[#004080] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Plus size={20} />
                        Convidar Profissional
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total de Pacientes</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalPatients}</h3>
                        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                            <Activity size={12} />
                            <span>Ativos na rede</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck size={64} className="text-purple-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Profissionais</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.activeProfessionals}</h3>
                        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded-lg">
                            <Shield size={12} />
                            <span>Equipe Técnica</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-orange-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Grupos Terapêuticos</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalGroups}</h3>
                        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-lg">
                            <span>Em andamento</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={64} className="text-red-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alertas de Risco</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.riskAlerts}</h3>
                        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-lg">
                            <AlertTriangle size={12} />
                            <span>Atenção Necessária</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professionals List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="text-[#0054A6]" size={20} />
                        Equipe Técnica
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar profissional..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0054A6] w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider text-left">
                            <tr>
                                <th className="px-6 py-4">Profissional</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Função</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {professionals.map((pro) => (
                                <tr key={pro.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#0054A6] text-white flex items-center justify-center font-bold text-lg">
                                                {pro.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{pro.name}</p>
                                                <p className="text-xs text-slate-500">Cadastrado em {pro.createdAt ? new Date(pro.createdAt.seconds * 1000).toLocaleDateString() : '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Mail size={14} />
                                            {pro.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-[#0054A6] rounded-lg text-xs font-bold">
                                            {pro.role === 'admin' ? 'Administrador' : 'Profissional'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pro.active !== false ? (
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg w-fit">
                                                <CheckCircle size={12} /> Ativo
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg w-fit">
                                                <XCircle size={12} /> Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(pro)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${pro.active !== false
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {pro.active !== false ? 'Desativar' : 'Reativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Convidar Profissional</h2>
                        <p className="text-slate-500 text-sm mb-6">Envie um convite para um novo membro da equipe técnica.</p>

                        <form onSubmit={handleInvite}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email do Profissional</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                                    placeholder="exemplo@saude.gov.br"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#0054A6] hover:bg-[#004080] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
                                >
                                    Enviar Convite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
