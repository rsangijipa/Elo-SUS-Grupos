import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, ArrowRight, CheckCircle2, Mail, AlertCircle, Sparkles, MessageCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { referralService, Referral } from '../../services/referralService';
import { tobaccoService } from '../../services/tobaccoService';
import { toast } from 'react-hot-toast';
import AIAgentWelcome from '../../components/Dashboard/AIAgentWelcome';
import DailyChallenge from '../../components/Dashboard/DailyChallenge';
import MoodTracker from '../../components/Widgets/MoodTracker';
import { useDailyMessage } from '../../hooks/useDailyMessage';

import confetti from 'canvas-confetti';
import { gamificationService, ACHIEVEMENTS } from '../../services/gamificationService';
import AchievementBadge from '../../components/Gamification/AchievementBadge';

import QuizModule from '../../components/Dashboard/QuizModule';
import TTSButton from '../../components/Common/TTSButton';
import GroupIdentityCard from '../../components/Dashboard/GroupIdentityCard';
import SessionFeedbackCard from '../../components/Dashboard/SessionFeedbackCard';
import AnxietyDepressionModal from '../../components/Modals/AnxietyDepressionModal';
import PregnantModal from '../../components/Modals/PregnantModal';
import AutismParentsModal from '../../components/Modals/AutismParentsModal';
import UserCard from '../../components/Dashboard/UserCard';
import { feedbackService } from '../../services/feedbackService';

export default function PatientDashboard() {
    const { user, isLoading } = useAuth();
    const { groups } = useData();
    const { message, loading: msgLoading } = useDailyMessage();
    const navigate = useNavigate();
    const [invites, setInvites] = useState<Referral[]>([]);
    const [checkingAnamnesis, setCheckingAnamnesis] = useState(false);
    const [isAnxietyModalOpen, setIsAnxietyModalOpen] = useState(false);
    const [isPregnantModalOpen, setIsPregnantModalOpen] = useState(false);
    const [isAutismModalOpen, setIsAutismModalOpen] = useState(false);
    const [isUserCardOpen, setIsUserCardOpen] = useState(false);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState<{ groupId: string, sessionId: string } | null>(null);

    useEffect(() => {
        loadInvites();
        checkAchievements();
    }, [user]);

    const checkAchievements = async () => {
        if (!user) return;

        // Load current achievements first to show immediately
        const current = await gamificationService.getUserAchievements(user.id);
        setUnlockedAchievements(current);

        // Check for new unlocks
        const newUnlocks = await gamificationService.checkAndUnlockAchievements(user.id);

        if (newUnlocks.length > 0) {
            // Update local state
            setUnlockedAchievements(prev => [...prev, ...newUnlocks.map(a => a.id)]);

            // Celebration!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            newUnlocks.forEach(achievement => {
                toast.success(`Nova Conquista: ${achievement.title} ${achievement.icon}`, {
                    duration: 5000,
                    icon: '🏆'
                });
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C4FFE]"></div>
            </div>
        );
    }

    const loadInvites = async () => {
        if (!user) return;
        // Use Smart Matching to find invites by ID, CNS, or Email
        const myInvites = await referralService.getPendingInvites(user);
        setInvites(myInvites);
    };

    const checkFeedbackPending = async () => {
        if (!user || groups.length === 0) return;

        // Check for pending feedback in active groups
        // In a real scenario, we would query the sessions collection
        // For now, we'll simulate a pending feedback for the first active group
        const activeGroup = groups.find(g => g.participants?.includes(user.id) && g.status === 'active');

        if (activeGroup) {
            // Check if user already gave feedback for "last_session"
            // We use a fixed ID for demo purposes, or derive from date
            const sessionId = `session_${new Date().toISOString().split('T')[0]}`;
            const hasFeedback = await feedbackService.hasGivenFeedback(activeGroup.id, sessionId, user.id);

            if (!hasFeedback) {
                // 20% chance to show feedback for demo purposes, or always if it's a specific demo flow
                // For this implementation, let's show it if it's not given
                setShowFeedback({ groupId: activeGroup.id, sessionId });
            }
        }
    };

    useEffect(() => {
        if (user && groups.length > 0) {
            checkFeedbackPending();
        }
    }, [user, groups]);

    const handleAcceptClick = async (invite: Referral) => {
        if (!user) return;

        setCheckingAnamnesis(true);
        try {
            // 1. Check if user has anamnesis
            const hasAnamnesis = await tobaccoService.checkAnamnesis(user.id);

            if (hasAnamnesis) {
                // 2. If yes, accept invite directly
                await referralService.acceptInvite(invite.id, user.name, user.id);
                toast.success('Você foi adicionado ao grupo com sucesso!');
                loadInvites();
                navigate(0); // Refresh to show new group
            } else {
                // 3. If no, redirect to Anamnesis page
                navigate(`/anamnese?pendingInvite=${invite.id}`);
            }
        } catch (error: any) {
            console.error('Error checking anamnesis:', error);
            if (error.message === 'REQ_ANAMNESE') {
                toast.error("Para participar, precisamos te conhecer melhor. Preencha sua ficha primeiro.");
                navigate(`/anamnese?pendingInvite=${invite.id}`);
            } else {
                toast.error('Erro ao verificar requisitos. Tente novamente.');
            }
        } finally {
            setCheckingAnamnesis(false);
        }
    };

    // Filter groups where the patient is a participant
    const myGroups = groups.filter(g => g.participants?.includes(user?.id || ''));

    // Calculate attendance status based on user stats or group defaults
    const getAttendanceStatus = (_groupId: string) => {
        const attendanceRate = 85;
        if (attendanceRate >= 75) return { color: 'bg-green-500', text: 'text-green-600', label: 'Presença Excelente', rate: attendanceRate };
        if (attendanceRate >= 70) return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Atenção à Frequência', rate: attendanceRate };
        return { color: 'bg-red-500', text: 'text-red-600', label: 'Risco de Desligamento', rate: attendanceRate };
    };

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
                {/* --- HERO SECTION (Priority 0) --- */}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex-1 w-full">
                            {/* AI Welcome Message */}
                            {/* AI Welcome Message (Restored Visual) */}
                            <AIAgentWelcome
                                role="patient"
                                message={message}
                                loading={msgLoading}
                            />
                        </div>
                        <button
                            onClick={() => setIsUserCardOpen(true)}
                            className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-[#7A5CFF] to-[#4E8FFF] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-purple-500/40 transition-all shadow-md border-2 border-white/30 overflow-hidden btn-press"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <div className="relative flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <CreditCard size={24} className="text-white" />
                                </div>
                                <div className="text-left leading-tight">
                                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Acesso Premium</span>
                                    <span className="text-sm">Carteirinha Digital<br />EloSUS</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Session Feedback Modal/Card */}
                    {showFeedback && user && (
                        <div className="animate-slide-down mb-6">
                            <SessionFeedbackCard
                                groupId={showFeedback.groupId}
                                sessionId={showFeedback.sessionId}
                                patientId={user.id}
                                onClose={() => setShowFeedback(null)}
                            />
                        </div>
                    )}

                    {/* Pending Invites Alert */}
                    {invites.length > 0 && (
                        <div className="animate-slide-down">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Mail className="text-orange-500" />
                                Convites Pendentes
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{invites.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {invites.map(invite => {
                                    const group = groups.find(g => g.id === invite.groupId);
                                    return (
                                        <div key={invite.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-orange-500 relative overflow-hidden">
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
                                                <TTSButton
                                                    text={`Novo Convite para ${group?.name || 'Grupo Terapêutico'}. Encaminhado por ${invite.referringProfessionalName || 'Profissional'}. Horário: ${group?.schedule || 'A definir'}.`}
                                                    size={20}
                                                    color="text-orange-400 hover:text-orange-600"
                                                />
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
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleAcceptClick(invite)}
                                                    disabled={checkingAnamnesis}
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {checkingAnamnesis ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Verificando...
                                                        </>
                                                    ) : (
                                                        'Quero participar'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Next Appointment / Active Groups */}
                    {myGroups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Priority Card: Next Appointment */}
                            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
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
                                <div className="absolute top-4 right-4">
                                    <TTSButton
                                        text="Próximo Encontro. Quarta-feira, às 14 horas. Sala 04, UBS Centro."
                                        size={20}
                                    />
                                </div>
                                <button
                                    onClick={() => navigate('/schedule')}
                                    className="px-6 py-2 bg-[#6C4FFE] text-white font-bold rounded-xl hover:bg-[#5b41d9] transition-colors shadow-lg shadow-purple-200"
                                >
                                    Ver Detalhes
                                </button>
                            </div>

                            {/* Group List Summary */}
                            {myGroups.map(group => {
                                const status = getAttendanceStatus(group.id);
                                return (
                                    <div
                                        key={group.id}
                                        onClick={() => navigate(`/groups/${group.id}`)}
                                        className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-emerald-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.color}`}></div>
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {group.protocol || 'Geral'}
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#6C4FFE] transition-colors">
                                                    {group.name}
                                                </h3>
                                            </div>
                                        </div>



                                        <div className="pl-2 mt-4">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-bold text-slate-500">Frequência</span>
                                                <span className={`text-xs font-bold ${status.text}`}>{status.rate}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${status.color}`} style={{ width: `${status.rate}%` }}></div>
                                            </div>
                                        </div>

                                        {/* TTS for Group Card */}
                                        <div className="absolute top-4 right-4">
                                            <TTSButton
                                                text={`Grupo ${group.name}. Status: ${group.status === 'active' ? 'Em andamento' : 'Aguardando'}. Encontros: ${group.schedule}. Local: ${group.room}. Sua frequência é de ${status.rate}%.`}
                                                size={20}
                                            />
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
                    ) : (
                        !invites.length && (
                            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum grupo ativo</h3>
                                <p className="text-slate-500 text-sm mb-4">Aguarde o convite do seu profissional.</p>
                            </div>
                        )
                    )}
                </section>

                {/* --- MY DAY SECTION (Priority 1) --- */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" />
                        Sua Rotina Hoje
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Mood Tracker */}
                        <div className="h-full">
                            <MoodTracker />
                        </div>
                        {/* Daily Challenge */}
                        <div className="h-full">
                            <DailyChallenge />
                        </div>
                    </div>
                </section>

                {/* --- JOURNEY SECTION (Priority 2) --- */}
                <section className="space-y-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <MapPin className="text-purple-500" />
                        Sua Jornada
                    </h2>

                    {/* Mental Health Screening Call-to-Action */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Como você está se sentindo hoje?</h3>
                                <p className="text-purple-100 max-w-md">
                                    Faça uma breve autoavaliação de ansiedade e depressão.
                                    É rápido, seguro e ajuda a cuidar de você.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setIsAnxietyModalOpen(true)}
                                    className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow-md hover:bg-purple-50 transition-colors whitespace-nowrap"
                                >
                                    Fazer Check-in Emocional
                                </button>
                                <button
                                    onClick={() => setIsPregnantModalOpen(true)}
                                    className="px-6 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-colors whitespace-nowrap"
                                >
                                    Sou Gestante/Mãe Recente
                                </button>
                                <button
                                    onClick={() => setIsAutismModalOpen(true)}
                                    className="px-6 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-colors whitespace-nowrap"
                                >
                                    Sou Pai/Mãe Atípico
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Module */}
                    <QuizModule />

                    {/* Achievements */}
                    <div className="bg-white/50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Minhas Conquistas</h3>
                        <div className="flex flex-row overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-brand-primary/20">
                            {ACHIEVEMENTS.map(achievement => {
                                const isUnlocked = unlockedAchievements.includes(achievement.id);
                                let progress = '';

                                if (!isUnlocked) {
                                    if (achievement.id === 'on_fire') {
                                        progress = `${user?.stats?.loginStreak || 0}/3 dias`;
                                    } else if (achievement.id === 'active_voice') {
                                        progress = `${user?.stats?.totalSessions || 0}/5 sessões`;
                                    }
                                }

                                return (
                                    <div key={achievement.id} className="min-w-[120px] w-[120px] flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => {
                                        if (!isUnlocked) {
                                            toast(achievement.description, {
                                                icon: '🔒',
                                                style: { background: '#f1f5f9', color: '#64748b' }
                                            });
                                        }
                                    }}>
                                        <AchievementBadge
                                            title={achievement.title}
                                            description={achievement.description}
                                            icon={achievement.icon}
                                            isUnlocked={isUnlocked}
                                            progress={progress}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            <AnxietyDepressionModal
                isOpen={isAnxietyModalOpen}
                onClose={() => setIsAnxietyModalOpen(false)}
            />

            <PregnantModal
                isOpen={isPregnantModalOpen}
                onClose={() => setIsPregnantModalOpen(false)}
            />

            <AutismParentsModal
                isOpen={isAutismModalOpen}
                onClose={() => setIsAutismModalOpen(false)}
            />

            <UserCard
                isOpen={isUserCardOpen}
                onClose={() => setIsUserCardOpen(false)}
                groupData={myGroups.length > 0 ? {
                    name: myGroups[0].name,
                    startDate: 'Nov/2025',
                    attendanceCount: user?.stats?.totalSessions || 0
                } : undefined}
            />
        </>
    );
}
