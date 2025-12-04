import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Calendar, FileText, AlertCircle, Clock, ClipboardList, Filter, Search, ChevronRight, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { referralService, Referral } from '../../services/referralService';
import TobaccoInsightsWidget from '../../components/Widgets/TobaccoInsightsWidget';
import TobaccoAnamnesisForm from '../Protocols/Tobacco/TobaccoAnamnesisForm';
import HealthRadar from '../../components/Dashboard/HealthRadar';
import { moodService, MoodLog } from '../../services/moodService';

const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();
    const { groups, patients, appointments } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'visao-geral' | 'triagem'>('visao-geral');
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [moodMap, setMoodMap] = useState<Record<string, MoodLog | null>>({});

    const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [filterOrigin, setFilterOrigin] = useState<string>('all');



    const [isLoadingData, setIsLoadingData] = useState(true);

    // Skeleton Component
    const DashboardSkeleton = () => (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between gap-4">
                <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
                <div className="h-10 w-40 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                ))}
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
                <div className="space-y-6">
                    <div className="h-48 bg-slate-200 rounded-2xl"></div>
                    <div className="h-48 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        const init = async () => {
            setIsLoadingData(true);
            try {
                await loadReferrals();
            } catch (error) {
                console.error("Failed to load referrals:", error);
                toast.error("Erro ao carregar encaminhamentos.");
            } finally {
                setIsLoadingData(false);
            }
        };
        init();
    }, []);

    // Load Mood Data for Health Radar
    useEffect(() => {
        const loadMoods = async () => {
            if (patients.length === 0) return;

            const newMoodMap: Record<string, MoodLog | null> = {};
            // Optimization: In a real app with many patients, we would need a better strategy or backend aggregation
            // For now, we fetch latest mood for each patient in parallel
            const promises = patients.map(async (p) => {
                if (!p.id) return;
                try {
                    const history = await moodService.getPatientHistory(p.id, 1);
                    newMoodMap[p.id] = history.length > 0 ? history[0] : null;
                } catch (e) {
                    console.error(`Failed to load mood for ${p.id}`, e);
                    newMoodMap[p.id] = null;
                }
            });

            await Promise.all(promises);
            setMoodMap(newMoodMap);
        };

        loadMoods();
    }, [patients]);

    const loadReferrals = async () => {
        const data = await referralService.getAll();
        setReferrals(data);
    };



    const openTriage = (referral: Referral) => {
        setSelectedReferral(referral);
        setShowAnamnesisModal(true);
    };

    const handleAnamnesisSave = async (data: unknown) => {
        if (!selectedReferral) return;

        if (window.confirm('Deseja salvar a triagem e convidar o paciente para o grupo?')) {
            try {
                // Select a suitable group
                const targetGroup = groups.find(g => g.protocol === 'TABAGISMO') || groups[0];

                if (!targetGroup) {
                    toast.error('Nenhum grupo disponível para convite.');
                    return;
                }

                await referralService.invitePatient(selectedReferral.id, {
                    groupId: targetGroup.id,
                    professionalName: user?.name || 'Profissional'
                });

                setShowAnamnesisModal(false);
                setSelectedReferral(null);
                loadReferrals();
                toast.success('Triagem salva e convite enviado com sucesso!');
            } catch (error) {
                console.error("Erro ao salvar triagem:", error);
                toast.error("Erro ao processar convite. Tente novamente.");
            }
        }
    };

    const handleManualAcceptance = async (referralId: string) => {
        if (window.confirm('Confirmar entrada manual deste paciente no grupo?')) {
            await referralService.manualAcceptance(referralId, user?.name || 'Profissional');
            loadReferrals();
            toast.success('Paciente aceito manualmente.');
        }
    };

    // Filter data based on the current user
    const myGroups = groups.filter(g => g.facilitatorId === user?.id);
    const myGroupIds = myGroups.map(g => g.id);
    // Filter patients that belong to my groups
    // Note: This logic assumes patients have a 'group' field or we check group participants.
    // The original mock logic was: p.group && myGroups.some(g => g.name.includes(p.group))
    // Real logic: check if patient ID is in any of myGroups.participants
    const myPatients = patients.filter(p =>
        myGroups.some(g => (g.participants || []).includes(p.id || ''))
    );
    const myAppointments = appointments.filter(a => myGroupIds.includes(a.groupId));

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

    if (isLoadingData) return <DashboardSkeleton />;

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

            </div>

            {activeTab === 'visao-geral' ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            onClick={() => navigate('/patients')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300"
                        >
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

                        <div
                            onClick={() => navigate('/groups')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300"
                        >
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

                        <div
                            onClick={() => navigate('/patients')}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300"
                        >
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

                    {/* Health Radar (Cross-Data Intelligence) */}
                    <div className="w-full">
                        <HealthRadar patients={myPatients} moodMap={moodMap} />
                    </div>

                    {/* Insights Widget */}
                    <div className="w-full">
                        <TobaccoInsightsWidget />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Calendar Widget */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar size={20} className="text-[#0054A6]" />
                                    Agenda de Hoje
                                </h3>
                                <button
                                    onClick={() => navigate('/schedule')}
                                    className="text-sm text-[#0054A6] font-medium hover:underline"
                                >
                                    Ver calendário completo
                                </button>
                            </div>

                            <div className="space-y-4">
                                {todaysAppointments.map(apt => {
                                    const aptDate = new Date(apt.date);
                                    return (
                                        <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <div className="text-sm font-bold text-slate-900">
                                                    {aptDate.getHours()}:{aptDate.getMinutes().toString().padStart(2, '0')}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {aptDate.getHours() + 1}:00
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
                                    );
                                })}

                                {todaysAppointments.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        Nenhuma sessão agendada para hoje.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notifications / Pending Reports */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
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
                                        <button
                                            onClick={() => navigate('/reports')}
                                            className="text-xs text-orange-700 font-bold mt-2 hover:underline"
                                        >
                                            Resolver agora
                                        </button>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-600">Solicitações</span>
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium">2 novos pacientes na fila de espera</p>
                                        <button
                                            onClick={() => navigate('/patients')}
                                            className="text-xs text-[#0054A6] font-bold mt-2 hover:underline"
                                        >
                                            Ver lista
                                        </button>
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
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
                                                <button
                                                    onClick={() => navigate(`/patients/${referral.patientId === 'new' ? '' : referral.patientId}`)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
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



            {/* Anamnesis Modal */}
            {showAnamnesisModal && selectedReferral && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4 animate-fade-in">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
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
