import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, AlertCircle, Clock, ClipboardList, Plus, X, CheckCircle2, Filter, Search, ChevronRight, User } from 'lucide-react';
import { MOCK_GROUPS, DEMO_PATIENTS, MOCK_APPOINTMENTS } from '../../utils/seedData';
import { useAuth } from '../../contexts/AuthContext';
import { referralService, Referral } from '../../services/referralService';
import TobaccoInsightsWidget from '../../components/Widgets/TobaccoInsightsWidget';
import TobaccoAnamnesisForm from '../Protocols/Tobacco/TobaccoAnamnesisForm';

const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'visao-geral' | 'triagem'>('visao-geral');
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [filterOrigin, setFilterOrigin] = useState<string>('all');

    // Referral Form State
    const [referralForm, setReferralForm] = useState({
        patientName: '',
        originUnitName: '',
        referringProfessionalName: '',
        referringProfessionalRole: '',
        reason: '',
        mainComplaint: '',
        riskLevel: 'baixo' as 'baixo' | 'moderado' | 'alto',
        priority: 'normal' as 'normal' | 'urgente'
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
                originUnitName: referralForm.originUnitName,
                referringProfessionalName: referralForm.referringProfessionalName,
                referringProfessionalRole: referralForm.referringProfessionalRole,
                reason: referralForm.reason,
                mainComplaint: referralForm.mainComplaint,
                riskLevel: referralForm.riskLevel,
                priority: referralForm.priority
            });
            await loadReferrals();
            setShowReferralModal(false);
            setReferralForm({
                patientName: '', originUnitName: '', referringProfessionalName: '',
                referringProfessionalRole: '', reason: '', mainComplaint: '',
                riskLevel: 'baixo', priority: 'normal'
            });
            alert('Paciente encaminhado com sucesso!');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openTriage = (referral: Referral) => {
        setSelectedReferral(referral);
        setShowAnamnesisModal(true);
    };

    const handleAnamnesisSave = async (data: any) => {
        if (!selectedReferral) return;

        if (window.confirm('Deseja salvar a triagem e convidar o paciente para o grupo?')) {
            // In a real app, we would select the group here. For now, picking the first available or a mock one.
            const targetGroup = MOCK_GROUPS.find(g => g.protocol === 'TABAGISMO') || MOCK_GROUPS[0];

            await referralService.invitePatient(selectedReferral.id, {
                groupId: targetGroup.id,
                professionalName: user?.name || 'Profissional'
            });

            setShowAnamnesisModal(false);
            setSelectedReferral(null);
            loadReferrals();
            alert('Triagem salva e convite enviado com sucesso!');
        }
    };

    const handleManualAcceptance = async (referralId: string) => {
        if (window.confirm('Confirmar entrada manual deste paciente no grupo?')) {
            await referralService.manualAcceptance(referralId, user?.name || 'Profissional');
            loadReferrals();
        }
    };

    // Filter data based on the current user
    const myGroups = MOCK_GROUPS.filter(g => g.facilitatorId === user?.id);
    const myGroupIds = myGroups.map(g => g.id);
    const myPatients = DEMO_PATIENTS.filter((p: any) => p.group && myGroups.some(g => g.name.includes(p.group)));
    const myAppointments = MOCK_APPOINTMENTS.filter(a => myGroupIds.includes(a.groupId));

    const activeGroups = myGroups.filter(g => g.status === 'active').length;
    const totalPatients = myPatients.length;
    const waitingList = myPatients.filter(p => p.status === 'waiting').length;
    const todaysAppointments = myAppointments.slice(0, 2);

    // Filter Referrals
    const filteredReferrals = referrals.filter(r => {
        if (filterRisk !== 'all' && r.riskLevel !== filterRisk) return false;
        if (filterOrigin !== 'all' && r.originUnitName !== filterOrigin) return false;
        return true;
    });

    const uniqueOrigins = Array.from(new Set(referrals.map(r => r.originUnitName)));

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
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <ClipboardList size={20} className="text-blue-600" />
                                Pacientes em Triagem
                            </h3>
                            <p className="text-sm text-slate-500">Gerencie os encaminhamentos recebidos da rede.</p>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Filter size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <select
                                    value={filterRisk}
                                    onChange={(e) => setFilterRisk(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="all">Todos os Riscos</option>
                                    <option value="alto">Alto Risco</option>
                                    <option value="moderado">Médio Risco</option>
                                    <option value="baixo">Baixo Risco</option>
                                </select>
                            </div>
                            <div className="relative">
                                <select
                                    value={filterOrigin}
                                    onChange={(e) => setFilterOrigin(e.target.value)}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="all">Todas as Origens</option>
                                    {uniqueOrigins.map(origin => (
                                        <option key={origin} value={origin}>{origin}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Paciente</th>
                                    <th className="px-6 py-4">Origem</th>
                                    <th className="px-6 py-4">Motivo / Queixa</th>
                                    <th className="px-6 py-4">Risco</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReferrals.map((referral) => (
                                    <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{referral.patientName}</div>
                                            <div className="text-xs text-slate-400">Desde {new Date(referral.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{referral.originUnitName}</div>
                                            <div className="text-xs text-slate-500">{referral.referringProfessionalName}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={referral.mainComplaint}>
                                            <div className="font-medium text-slate-700">{referral.reason}</div>
                                            <div className="text-xs text-slate-500 truncate">{referral.mainComplaint || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${referral.riskLevel === 'alto' ? 'bg-red-100 text-red-700' :
                                                referral.riskLevel === 'moderado' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {referral.riskLevel}
                                            </span>
                                            {referral.priority === 'urgente' && (
                                                <span className="ml-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500 text-white">
                                                    Urgente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${referral.status === 'encaminhado' ? 'bg-blue-100 text-blue-700' :
                                                referral.status === 'convidado' ? 'bg-purple-100 text-purple-700' :
                                                    referral.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {referral.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {referral.status === 'encaminhado' && (
                                                    <button
                                                        onClick={() => openTriage(referral)}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                                                    >
                                                        Realizar Triagem
                                                    </button>
                                                )}
                                                {referral.status === 'convidado' && (
                                                    <button
                                                        onClick={() => handleManualAcceptance(referral.id)}
                                                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors"
                                                        title="Confirmar entrada manual"
                                                    >
                                                        Aceite Manual
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReferrals.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={32} className="opacity-20" />
                                                <p>Nenhum encaminhamento encontrado com os filtros atuais.</p>
                                            </div>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ClipboardList size={20} className="text-blue-600" />
                                Encaminhar Paciente
                            </h3>
                            <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReferral} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Dados do Paciente</h4>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Nome Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={referralForm.patientName}
                                            onChange={e => setReferralForm({ ...referralForm, patientName: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="Nome do paciente"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Unidade de Origem</label>
                                        <select
                                            required
                                            value={referralForm.originUnitName}
                                            onChange={e => setReferralForm({ ...referralForm, originUnitName: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                                        >
                                            <option value="">Selecione a unidade...</option>
                                            <option value="UBS Centro">UBS Centro</option>
                                            <option value="UBS Jardim das Palmeiras">UBS Jardim das Palmeiras</option>
                                            <option value="CAPS II">CAPS II</option>
                                            <option value="CAPS AD">CAPS AD</option>
                                            <option value="NASF">NASF</option>
                                            <option value="Hospital Municipal">Hospital Municipal</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Profissional Solicitante</h4>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Nome do Profissional</label>
                                        <input
                                            type="text"
                                            required
                                            value={referralForm.referringProfessionalName}
                                            onChange={e => setReferralForm({ ...referralForm, referringProfessionalName: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Cargo / Função</label>
                                        <input
                                            type="text"
                                            required
                                            value={referralForm.referringProfessionalRole}
                                            onChange={e => setReferralForm({ ...referralForm, referringProfessionalRole: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="Ex: Médico, Enfermeiro, Psicólogo"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Dados Clínicos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Motivo do Encaminhamento</label>
                                        <select
                                            required
                                            value={referralForm.reason}
                                            onChange={e => setReferralForm({ ...referralForm, reason: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                                        >
                                            <option value="">Selecione o motivo...</option>
                                            <option value="Tabagismo">Tabagismo</option>
                                            <option value="Ansiedade">Ansiedade / Depressão</option>
                                            <option value="Gestante">Pré-natal / Gestante</option>
                                            <option value="Uso de Substâncias">Uso de Substâncias</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Prioridade</label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value="normal"
                                                    checked={referralForm.priority === 'normal'}
                                                    onChange={() => setReferralForm({ ...referralForm, priority: 'normal' })}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-slate-700">Normal</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value="urgente"
                                                    checked={referralForm.priority === 'urgente'}
                                                    onChange={() => setReferralForm({ ...referralForm, priority: 'urgente' })}
                                                    className="text-red-600 focus:ring-red-500"
                                                />
                                                <span className="text-sm text-red-700 font-bold">Urgente</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Queixa Principal / Observações</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={referralForm.mainComplaint}
                                        onChange={e => setReferralForm({ ...referralForm, mainComplaint: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                        placeholder="Descreva brevemente o caso e o motivo do encaminhamento..."
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
                                                className={`py-3 rounded-xl text-sm font-bold capitalize border transition-all ${referralForm.riskLevel === risk
                                                    ? risk === 'alto' ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100' : risk === 'moderado' ? 'bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-100' : 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {risk}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        * Alto risco: Ideação suicida, risco de agressão, vulnerabilidade social extrema.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReferralModal(false)}
                                    className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                >
                                    {loading ? 'Enviando...' : 'Confirmar Encaminhamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Anamnesis Modal */}
            {showAnamnesisModal && selectedReferral && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[95vh] md:h-auto md:max-h-[95vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ClipboardList size={20} className="text-blue-600" />
                                    Triagem: {selectedReferral.patientName}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Encaminhado por {selectedReferral.referringProfessionalName} ({selectedReferral.originUnitName})
                                </p>
                            </div>
                            <button onClick={() => setShowAnamnesisModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <TobaccoAnamnesisForm
                                patientId={selectedReferral.patientId}
                                onSave={handleAnamnesisSave}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDashboard;
