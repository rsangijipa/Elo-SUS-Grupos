import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, AlertCircle, Clock, ClipboardList, Plus, X, CheckCircle2 } from 'lucide-react';
import { MOCK_GROUPS, DEMO_PATIENTS, MOCK_APPOINTMENTS } from '../../utils/seedData';
import { useAuth } from '../../contexts/AuthContext';
import { referralService, Referral } from '../../services/referralService';
import TobaccoInsightsWidget from '../../components/Widgets/TobaccoInsightsWidget';

const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'visao-geral' | 'triagem'>('visao-geral');
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Referral Form State
    const [referralForm, setReferralForm] = useState({
        patientName: '',
        originUnit: '',
        reason: '',
        riskLevel: 'baixo' as 'baixo' | 'moderado' | 'alto'
    });

    useEffect(() => {
        loadReferrals();
    }, []);

    const loadReferrals = async () => {
        const data = await referralService.getAll();
        setReferrals(data);
    };

    const handleCreateReferral = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await referralService.create({
                patientId: 'new', // Mock ID
                patientName: referralForm.patientName,
                originUnit: referralForm.originUnit,
                reason: referralForm.reason,
                riskLevel: referralForm.riskLevel
            });
            await loadReferrals();
            setShowReferralModal(false);
            setReferralForm({ patientName: '', originUnit: '', reason: '', riskLevel: 'baixo' });
            alert('Paciente encaminhado com sucesso!');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReferral = async (id: string) => {
        if (window.confirm('Deseja aprovar este paciente para o grupo?')) {
            await referralService.updateStatus(id, 'aprovado');
            loadReferrals();
        }
    };

    // Filter data based on the current user
    const myGroups = MOCK_GROUPS.filter(g => g.facilitatorId === user?.id);
    const myGroupIds = myGroups.map(g => g.id);
    const myPatients = DEMO_PATIENTS.filter((p: any) => p.group && myGroups.some(g => g.name.includes(p.group))); // Adjusted logic for DEMO_PATIENTS structure
    const myAppointments = MOCK_APPOINTMENTS.filter(a => myGroupIds.includes(a.groupId));

    const activeGroups = myGroups.filter(g => g.status === 'active').length;
    const totalPatients = myPatients.length;
    const waitingList = myPatients.filter(p => p.status === 'waiting').length;
    const todaysAppointments = myAppointments.slice(0, 2);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('visao-geral')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'visao-geral' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('triagem')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'triagem' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Triagem
                        {referrals.filter(r => r.status === 'encaminhado').length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {referrals.filter(r => r.status === 'encaminhado').length}
                            </span>
                        )}
                    </button>
                </div>
                <button
                    onClick={() => setShowReferralModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 text-sm"
                >
                    <Plus size={18} />
                    Encaminhar Paciente
                </button>
            </div>

            {activeTab === 'visao-geral' ? (
                <>
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

                    {/* Insights Widget */}
                    <div className="w-full">
                        <TobaccoInsightsWidget />
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
                </>
            ) : (
                /* Triagem Tab Content */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ClipboardList size={20} className="text-blue-600" />
                            Pacientes em Triagem
                        </h3>
                        <p className="text-sm text-slate-500">Gerencie os encaminhamentos recebidos da rede.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Paciente</th>
                                    <th className="px-6 py-4">Origem</th>
                                    <th className="px-6 py-4">Motivo</th>
                                    <th className="px-6 py-4">Risco</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {referrals.map((referral) => (
                                    <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{referral.patientName}</td>
                                        <td className="px-6 py-4">{referral.originUnit}</td>
                                        <td className="px-6 py-4">{referral.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${referral.riskLevel === 'alto' ? 'bg-red-100 text-red-700' :
                                                referral.riskLevel === 'moderado' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {referral.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${referral.status === 'encaminhado' ? 'bg-blue-100 text-blue-700' :
                                                referral.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {referral.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {referral.status === 'encaminhado' && (
                                                <button
                                                    onClick={() => handleApproveReferral(referral.id)}
                                                    className="text-emerald-600 hover:text-emerald-800 font-bold text-xs flex items-center gap-1 ml-auto"
                                                >
                                                    <CheckCircle2 size={14} /> Aprovar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {referrals.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            Nenhum encaminhamento encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Referral Modal */}
            {showReferralModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ClipboardList size={20} className="text-blue-600" />
                                Encaminhar Paciente
                            </h3>
                            <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReferral} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Nome do Paciente</label>
                                <input
                                    type="text"
                                    required
                                    value={referralForm.patientName}
                                    onChange={e => setReferralForm({ ...referralForm, patientName: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Unidade de Origem</label>
                                <select
                                    required
                                    value={referralForm.originUnit}
                                    onChange={e => setReferralForm({ ...referralForm, originUnit: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                                >
                                    <option value="">Selecione a unidade...</option>
                                    <option value="UBS Centro">UBS Centro</option>
                                    <option value="UBS Jardim das Palmeiras">UBS Jardim das Palmeiras</option>
                                    <option value="CAPS II">CAPS II</option>
                                    <option value="NASF">NASF</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Motivo do Encaminhamento</label>
                                <input
                                    type="text"
                                    required
                                    value={referralForm.reason}
                                    onChange={e => setReferralForm({ ...referralForm, reason: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Ex: Tabagismo, Ansiedade..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Classificação de Risco</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['baixo', 'moderado', 'alto'].map((risk) => (
                                        <button
                                            key={risk}
                                            type="button"
                                            onClick={() => setReferralForm({ ...referralForm, riskLevel: risk as any })}
                                            className={`py-2 rounded-lg text-sm font-bold capitalize border transition-all ${referralForm.riskLevel === risk
                                                ? risk === 'alto' ? 'bg-red-50 border-red-200 text-red-700' : risk === 'moderado' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            {risk}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? 'Enviando...' : 'Confirmar Encaminhamento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDashboard;
