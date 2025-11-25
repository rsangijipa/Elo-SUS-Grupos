import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, ArrowRight, CheckCircle2, Mail, AlertCircle, X, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { referralService, Referral } from '../../services/referralService';
import { MOCK_GROUPS } from '../../utils/seedData';

export default function PatientDashboard() {
    const { user } = useAuth();
    const { groups } = useData();
    const navigate = useNavigate();
    const [invites, setInvites] = useState<Referral[]>([]);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedInvite, setSelectedInvite] = useState<Referral | null>(null);

    // Anamnesis State
    const [anamnesisStep, setAnamnesisStep] = useState(0); // 0 = Intro, 1 = Questions
    const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string>>({});
    const [anamnesisError, setAnamnesisError] = useState<string | null>(null);

    useEffect(() => {
        loadInvites();
    }, [user]);

    const loadInvites = async () => {
        if (!user) return;
        const allReferrals = await referralService.getAll();

        // Filter by user.id
        const myInvites = allReferrals.filter(r => r.status === 'convidado' && (r.patientId === user.id || r.patientId === 'new'));
        setInvites(myInvites);
    };

    const handleAcceptClick = (invite: Referral) => {
        setSelectedInvite(invite);
        setAnamnesisStep(0);
        setAnamnesisAnswers({});
        setAnamnesisError(null);
        setShowAcceptModal(true);
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnamnesisAnswers(prev => ({ ...prev, [questionId]: value }));
        if (anamnesisError) setAnamnesisError(null);
    };

    const validateAnamnesis = () => {
        const requiredQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
        const missing = requiredQuestions.filter(q => !anamnesisAnswers[q]);

        if (missing.length > 0) {
            setAnamnesisError('Por favor, responda todas as perguntas para continuar.');
            return false;
        }
        return true;
    };

    const confirmAcceptance = async () => {
        if (!selectedInvite) return;

        if (!validateAnamnesis()) return;

        await referralService.acceptInvite(selectedInvite.id, user?.name || 'Paciente', user?.id || 'unknown');

        // Show success feedback
        alert('Anamnese salva com sucesso! Você agora faz parte do grupo.');

        setShowAcceptModal(false);
        setSelectedInvite(null);
        loadInvites();
        navigate(0);
    };

    // Filter groups where the patient is a participant
    const myGroups = groups.filter(g => g.participants?.includes(user?.id || ''));

    // Calculate attendance (mock logic for now)
    const getAttendanceStatus = (groupId: string) => {
        const attendanceRate = 85;
        if (attendanceRate >= 75) return { color: 'bg-green-500', text: 'text-green-600', label: 'Presença Excelente', rate: attendanceRate };
        if (attendanceRate >= 70) return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Atenção à Frequência', rate: attendanceRate };
        return { color: 'bg-red-500', text: 'text-red-600', label: 'Risco de Desligamento', rate: attendanceRate };
    };

    // Fagerström Questions
    const questions = [
        {
            id: 'q1',
            text: '1. Quanto tempo após acordar você fuma o primeiro cigarro?',
            options: [
                { label: 'Dentro de 5 minutos', value: '3' },
                { label: 'Entre 6 e 30 minutos', value: '2' },
                { label: 'Entre 31 e 60 minutos', value: '1' },
                { label: 'Após 60 minutos', value: '0' }
            ]
        },
        {
            id: 'q2',
            text: '2. Você acha difícil não fumar em locais proibidos?',
            options: [
                { label: 'Sim', value: '1' },
                { label: 'Não', value: '0' }
            ]
        },
        {
            id: 'q3',
            text: '3. Qual o cigarro do dia que traz mais satisfação?',
            options: [
                { label: 'O primeiro da manhã', value: '1' },
                { label: 'Outros', value: '0' }
            ]
        },
        {
            id: 'q4',
            text: '4. Quantos cigarros você fuma por dia?',
            options: [
                { label: 'Menos de 10', value: '0' },
                { label: 'De 11 a 20', value: '1' },
                { label: 'De 21 a 30', value: '2' },
                { label: 'Mais de 31', value: '3' }
            ]
        },
        {
            id: 'q5',
            text: '5. Você fuma mais frequentemente pela manhã?',
            options: [
                { label: 'Sim', value: '1' },
                { label: 'Não', value: '0' }
            ]
        },
        {
            id: 'q6',
            text: '6. Você fuma mesmo quando está doente?',
            options: [
                { label: 'Sim', value: '1' },
                { label: 'Não', value: '0' }
            ]
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#6C4FFE] to-[#8B5CF6] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                        {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-blue-100 text-lg max-w-xl">
                        Hoje é um ótimo dia para cuidar de você. <span className="font-bold bg-white/20 px-2 py-0.5 rounded-lg">{myGroups.length} grupos</span> ativos.
                    </p>
                </div>
            </div>

            {/* Next Appointment Card */}
            {myGroups.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#6C4FFE]"></div>
                    <div className="p-4 bg-purple-50 rounded-full text-[#6C4FFE]">
                        <Calendar size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">Próximo Encontro</h3>
                        <p className="text-slate-500">Sua jornada continua em breve.</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-1">
                        <div className="text-2xl font-bold text-[#6C4FFE]">Quarta-feira, 14:00</div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={16} />
                            Sala 04 - UBS Centro
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-[#6C4FFE] text-white font-bold rounded-xl hover:bg-[#5b41d9] transition-colors shadow-lg shadow-purple-200">
                        Ver Detalhes
                    </button>
                </div>
            )}

            {/* Pending Invites Section */}
            {invites.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Mail className="text-orange-500" />
                        Convites Pendentes
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{invites.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {invites.map(invite => {
                            // Find group details if available
                            const group = MOCK_GROUPS.find(g => g.id === invite.groupId);
                            return (
                                <div key={invite.id} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                                Novo Convite
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-800 mt-2">
                                                {group?.name || 'Grupo Terapêutico'}
                                            </h3>
                                            <p className="text-sm text-slate-500">Encaminhado por {invite.referringProfessionalName || 'Profissional'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                                        <div className="flex items-center gap-3 text-sm text-slate-700">
                                            <Calendar size={18} className="text-slate-400" />
                                            <span className="font-medium">{group?.schedule || 'Horário a definir'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-700">
                                            <MapPin size={18} className="text-slate-400" />
                                            <span className="font-medium">{group?.room || 'Local a definir'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-700">
                                            <AlertCircle size={18} className="text-slate-400" />
                                            <span className="font-medium">Comparecer semanalmente por 4 encontros</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAcceptClick(invite)}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200"
                                        >
                                            Quero participar
                                        </button>
                                        <button className="px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                            Tenho dúvidas
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Groups Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-[#6C4FFE]" />
                    Meus Grupos Ativos
                </h2>

                {myGroups.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
                            <Calendar size={48} className="relative z-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum grupo ativo no momento</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Você ainda não está participando de nenhum grupo terapêutico. Aguarde o convite do seu profissional de saúde ou entre em contato com a unidade.
                        </p>
                        <button className="px-6 py-2 text-[#6C4FFE] font-bold hover:bg-purple-50 rounded-xl transition-colors">
                            Entrar em contato com a unidade
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myGroups.map(group => {
                            const status = getAttendanceStatus(group.id);
                            return (
                                <div
                                    key={group.id}
                                    onClick={() => navigate(`/groups/${group.id}`)}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    {/* Status Strip */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.color}`}></div>

                                    <div className="flex justify-between items-start mb-4 pl-2">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                {group.protocol || 'Geral'}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#6C4FFE] transition-colors">
                                                {group.name}
                                            </h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {group.status === 'active' ? 'Em Andamento' : 'Aguardando'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 pl-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar size={16} className="text-[#6C4FFE]" />
                                            <span>{group.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin size={16} className="text-[#6C4FFE]" />
                                            <span>{group.room}</span>
                                        </div>
                                    </div>

                                    {/* Smart Attendance Bar */}
                                    <div className="pl-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-slate-500">Frequência</span>
                                            <span className={`text-xs font-bold ${status.text}`}>{status.rate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${status.color}`}
                                                style={{ width: `${status.rate}%` }}
                                            ></div>
                                        </div>
                                        <p className={`text-[10px] mt-1 font-medium ${status.text}`}>
                                            {status.label}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                                        <button className="text-sm font-bold text-[#6C4FFE] flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Ver Detalhes <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Acceptance Modal - Refined */}
            {showAcceptModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={24} />
                                    Anamnese – Grupo de Tabagismo
                                </h3>
                                <p className="text-sm text-slate-500">Responda para finalizar sua inscrição</p>
                            </div>
                            <button onClick={() => setShowAcceptModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-slate-50/30">

                            {/* Intro Step */}
                            {anamnesisStep === 0 && (
                                <div className="space-y-6 text-center py-8">
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4">
                                        <FileText size={48} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-800">Bem-vindo ao Grupo!</h4>
                                    <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                        Para que a equipe possa te ajudar da melhor forma, precisamos entender um pouco mais sobre seus hábitos.
                                        <br /><br />
                                        Vamos responder a um breve questionário (Teste de Fagerström) para avaliar seu grau de dependência de nicotina.
                                    </p>
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setAnamnesisStep(1)}
                                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                                        >
                                            Começar Anamnese <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Questionnaire Step */}
                            {anamnesisStep === 1 && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm mb-6">
                                        <p className="font-bold flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Importante
                                        </p>
                                        <p>Todas as perguntas são obrigatórias para garantir uma avaliação precisa.</p>
                                    </div>

                                    <div className="space-y-8">
                                        {questions.map((q) => (
                                            <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                                <p className="font-bold text-slate-800 mb-4 text-lg">{q.text} <span className="text-red-500">*</span></p>
                                                <div className="space-y-3">
                                                    {q.options.map((opt) => (
                                                        <label
                                                            key={opt.label}
                                                            className={`
                                                                flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all
                                                                ${anamnesisAnswers[q.id] === opt.value
                                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                                    : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                                ${anamnesisAnswers[q.id] === opt.value ? 'border-blue-600' : 'border-slate-300'}
                                                            `}>
                                                                {anamnesisAnswers[q.id] === opt.value && (
                                                                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                                                                )}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                name={q.id}
                                                                value={opt.value}
                                                                checked={anamnesisAnswers[q.id] === opt.value}
                                                                onChange={() => handleAnswerChange(q.id, opt.value)}
                                                                className="hidden"
                                                            />
                                                            <span className="text-slate-700 font-medium">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-white flex flex-col gap-3">
                            {anamnesisError && (
                                <div className="text-red-500 text-sm font-bold text-center animate-pulse">
                                    {anamnesisError}
                                </div>
                            )}

                            {anamnesisStep === 1 && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowAcceptModal(false)}
                                        className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmAcceptance}
                                        className="flex-[2] py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                    >
                                        Salvar e Continuar <CheckCircle2 size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
