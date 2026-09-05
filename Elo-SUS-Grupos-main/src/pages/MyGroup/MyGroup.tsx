import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CineTerapia from '../../components/MyGroup/CineTerapia';
import GroupChat from '../../components/MyGroup/GroupChat';
import FeedbackBox from '../../components/MyGroup/FeedbackBox';
import { useSettings } from '../../contexts/SettingsContext';
import { useData } from '../../contexts/DataContext';
import { attendanceService, Session } from '../../services/attendanceService';
import { format, addDays, getDay, nextDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MyGroup: React.FC = () => {
    const { user } = useAuth();
    const { unitAddress } = useSettings();
    const { groups } = useData();

    const [group, setGroup] = useState<any>(null);
    const [history, setHistory] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.currentGroupId && groups.length > 0) {
            const currentGroup = groups.find(g => g.id === user.currentGroupId);
            setGroup(currentGroup);
        }
    }, [user, groups]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (group?.id) {
                try {
                    const sessions = await attendanceService.getSessions(group.id);
                    setHistory(sessions);
                } catch (error) {
                    console.error("Error fetching sessions:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!user?.currentGroupId) {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [group]);

    const handleJoinDebugGroup = async () => {
        try {
            const groups = await import('../../services/groupService').then(m => m.groupService.getAll());
            if (groups.length > 0) {
                const targetGroup = groups[0];
                if (user?.id) {
                    await import('../../services/groupService').then(m => m.groupService.addParticipant(targetGroup.id, user.id, unitAddress));
                    window.location.reload(); // Force reload to update context
                }
            } else {
                alert('Nenhum grupo encontrado para entrar.');
            }
        } catch (error) {
            console.error('Erro ao entrar no grupo:', error);
            alert('Erro ao entrar no grupo.');
        }
    };

    // Helper to estimate next session based on schedule string (simple heuristic)
    const getNextSessionDate = (scheduleString: string): Date | null => {
        if (!scheduleString) return null;

        const weekDays: Record<string, number> = {
            'domingo': 0, 'segunda': 1, 'terça': 2, 'terc': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6,
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6
        };

        const lowerSchedule = scheduleString.toLowerCase();
        let targetDay = -1;

        for (const [dayName, dayIndex] of Object.entries(weekDays)) {
            if (lowerSchedule.includes(dayName)) {
                targetDay = dayIndex;
                break;
            }
        }

        if (targetDay !== -1) {
            const today = startOfDay(new Date());
            // If today is the day, assume next week if it's already late? For simplicity, assume next occurrence including today if not passed.
            // Using date-fns nextDay - returns next instance.
            // logic: if today == targetDay, show today? 
            const dayOfToday = getDay(today);
            if (dayOfToday === targetDay) return today;
            // map internal day index (0-6) to date-fns Day type (0-6) - it matches
            return nextDay(today, targetDay as any);
        }
        return null; // Could not parse
    };

    // Prepare Timeline Data
    const timelineItems = [
        // Past Sessions
        ...history.map(session => ({
            id: session.id || session.date,
            date: format(new Date(session.date), 'dd/MM'),
            title: session.topic || 'Encontro Realizado',
            status: 'completed' as const
        })).slice(0, 3), // Show last 3

        // Next Session (Estimated)
        ...(group ? [{
            id: 'next',
            date: getNextSessionDate(group.schedule) ? format(getNextSessionDate(group.schedule)!, 'dd/MM') : 'Em Breve',
            title: 'Próximo Encontro',
            status: 'next' as const
        }] : []),

        // Future Placeholder
        { id: 'future', date: '---', title: 'Encerramento do Ciclo', status: 'future' as const }
    ];

    if (!user?.currentGroupId && !loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Você ainda não participa de um grupo</h2>
                    <p className="text-slate-500 mb-6">Entre em contato com sua unidade de saúde ou entre em um grupo de demonstração.</p>
                    <button
                        onClick={handleJoinDebugGroup}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 w-full transition-colors"
                    >
                        Entrar no Grupo de Teste
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FC] pb-20 md:pb-8">
            {/* 1. HERO SECTION */}
            <div className="bg-gradient-to-r from-[#7A5CFF] to-[#4E8FFF] text-white pt-8 pb-16 px-6 md:px-12 rounded-b-[3rem] shadow-lg relative overflow-hidden">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-3 border border-white/10">
                                <Users size={14} />
                                <span>Grupo Ativo</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{group?.name || 'Carregando...'}</h1>
                            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    {group?.schedule || 'Dia a definir'}
                                </span>
                                {group?.room && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        {group.room} (UBS Central)
                                    </span>
                                )}
                            </div>
                        </div>

                        <button className="bg-white text-[#7A5CFF] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                            <Users size={20} />
                            Carteirinha do Grupo
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
                {/* 2. CINE TERAPIA MODULE */}
                <CineTerapia />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: TIMELINE & WIDGET */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* TIMELINE SECTION */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <MapPin className="text-[#7A5CFF]" />
                                Nossa Caminhada
                            </h2>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {timelineItems.length > 0 ? (
                                        timelineItems.map((session, index) => (
                                            <div key={session.id || index} className="relative pl-12 group">
                                                {/* Status Dot */}
                                                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${session.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    session.status === 'next' ? 'bg-[#7A5CFF] text-white ring-4 ring-[#7A5CFF]/20' :
                                                        'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {session.status === 'completed' ? <CheckCircle2 size={18} /> :
                                                        session.status === 'next' ? <Clock size={18} className="animate-pulse" /> :
                                                            <Lock size={16} />}
                                                </div>

                                                {/* Content Card */}
                                                <div className={`p-4 rounded-2xl transition-all ${session.status === 'next'
                                                    ? 'bg-gradient-to-r from-[#7A5CFF]/5 to-purple-50 border border-[#7A5CFF]/20 shadow-md'
                                                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                                                    }`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-xs font-bold ${session.status === 'next' ? 'text-[#7A5CFF]' : 'text-slate-400'
                                                            }`}>
                                                            {session.date}
                                                        </span>
                                                        {session.status === 'next' && (
                                                            <span className="text-[10px] bg-[#7A5CFF] text-white px-2 py-0.5 rounded-full font-bold">
                                                                Próximo Encontro
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className={`font-bold ${session.status === 'completed' ? 'text-slate-600 line-through decoration-slate-300' :
                                                        session.status === 'next' ? 'text-[#7A5CFF] text-lg' :
                                                            'text-slate-500'
                                                        }`}>
                                                        {session.title}
                                                    </h3>
                                                    {session.status === 'next' && (
                                                        <p className="text-xs text-slate-500 mt-2">
                                                            Prepare seu diário de emoções!
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-500">
                                            Aguardando início das atividades.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* GAMIFICATION WIDGET (Mobile Only - Desktop is Sidebar) */}
                        <div className="lg:hidden">
                            <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                                <h3 className="font-bold text-lg mb-1">Meta da Turma</h3>
                                <p className="text-white/90 text-sm mb-4">Presença coletiva</p>

                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/20" />
                                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white" strokeDasharray="175.9" strokeDashoffset="26.4" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">85%</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-white/90 leading-relaxed">
                                            Faltam apenas 5% para desbloquearmos o material bônus sobre "Mindfulness"!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: CHAT & WIDGETS */}
                    <div className="space-y-8">
                        {/* GAMIFICATION WIDGET (Desktop) */}
                        <div className="hidden lg:block bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                            <h3 className="font-bold text-lg mb-1">Meta da Turma</h3>
                            <p className="text-white/90 text-sm mb-4">Presença coletiva</p>

                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/20" />
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white" strokeDasharray="175.9" strokeDashoffset="26.4" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">85%</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-white/90 leading-relaxed">
                                        Faltam apenas 5% para desbloquearmos o material bônus!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CHAT MODULE */}
                        <GroupChat groupId={user?.currentGroupId} />
                    </div>
                </div>

                {/* 3. FEEDBACK MODULE (Footer) */}
                <div className="mt-12 mb-8">
                    <FeedbackBox />
                </div>
            </div>
        </div>
    );
};

export default MyGroup;
