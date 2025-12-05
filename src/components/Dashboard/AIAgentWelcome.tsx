import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motivationalQuotes } from '../../data/motivationalQuotes';
import TTSButton from '../Common/TTSButton';
import { patientService } from '../../services/patientService';
import { getCleanName } from '../../utils/stringUtils';
import { AlertTriangle, Calendar, Activity, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIAgentWelcomeProps {
    role: 'patient' | 'professional';
}

const AIAgentWelcome: React.FC<AIAgentWelcomeProps> = ({ role }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [analyzing, setAnalyzing] = useState(true);
    const [riskCount, setRiskCount] = useState(0);
    const [totalPatients, setTotalPatients] = useState(0);

    // Sanitização de Nome (cleanName logic)
    const cleanName = useMemo(() => {
        return getCleanName(user?.name);
    }, [user?.name]);

    const lastName = useMemo(() => {
        if (!user?.name) return '';
        const parts = user.name.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    }, [user?.name]);

    // Data Fetching for Professional Mode
    useEffect(() => {
        const fetchData = async () => {
            if (role === 'professional') {
                try {
                    // Fetch all patients to count risks
                    // Optimization: In a real large app, this should be a specific count query
                    const patients = await patientService.getAll();
                    const risks = patients.filter(p => p.hasAlert).length;
                    setRiskCount(risks);
                    setTotalPatients(patients.length);
                } catch (error) {
                    console.error("Error fetching patient data for AI Agent:", error);
                    // Fallback/Mock if error
                    setRiskCount(3);
                }
            }
        };

        fetchData();

        // Simulate AI "Thinking"
        const timer = setTimeout(() => {
            setAnalyzing(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [role]);

    // Content Logic
    const { quote, avatarUrl, insight } = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        const randomAvatarIndex = Math.floor(Math.random() * 4) + 1;

        const insights = [
            `Vi que sua energia está ótima hoje, ${cleanName}!`,
            `Parabéns! Você completou 3 dias seguidos de autocuidado.`,
            `Que tal ouvir um áudio relaxante hoje?`,
            `Sua jornada tem sido inspiradora. Continue assim!`
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];

        return {
            quote: motivationalQuotes[randomIndex],
            avatarUrl: `/avatar${randomAvatarIndex}.png`,
            insight: randomInsight
        };
    }, [cleanName]);

    // Render Logic
    const isPatient = role === 'patient';

    // Theme Configuration
    const theme = isPatient ? {
        gradient: 'from-[#7A5CFF] to-[#FFB7D5]',
        shadow: 'shadow-purple-200',
        textColor: 'text-indigo-900',
        highlight: 'text-purple-600',
        iconColor: 'text-purple-500'
    } : {
        gradient: 'from-[#4E8FFF] to-[#1E2A40]',
        shadow: 'shadow-blue-200',
        textColor: 'text-slate-800',
        highlight: 'text-blue-700',
        iconColor: 'text-blue-600'
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl ${theme.shadow}`}>
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} animate-gradient-xy opacity-90`}
                style={{ backgroundSize: '400% 400%', animation: 'gradient-xy 15s ease infinite' }}></div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]"></div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                    {/* Animation Effects */}
                    {analyzing ? (
                        <div className="absolute inset-0 rounded-full bg-white/50 animate-ping"></div>
                    ) : (
                        isPatient ? (
                            <div className="absolute inset-0 rounded-full bg-purple-400/30 blur-xl animate-pulse"></div>
                        ) : (
                            <div className="absolute -inset-4 rounded-full border border-blue-400/30 animate-[ping_3s_linear_infinite] opacity-40"></div>
                        )
                    )}

                    <img
                        src={avatarUrl}
                        alt="AI Agent"
                        className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl transform transition-transform duration-700 ${analyzing ? 'scale-95 grayscale' : 'scale-100 hover:scale-105'}`}
                    />

                    {/* Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${analyzing ? 'bg-yellow-400 animate-bounce' : 'bg-green-400'}`}></div>
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-left w-full">
                    {analyzing ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-8 w-48 bg-gray-300/50 rounded-lg mx-auto md:mx-0"></div>
                            <div className="h-4 w-full max-w-md bg-gray-300/30 rounded mx-auto md:mx-0"></div>
                            <div className="h-4 w-2/3 bg-gray-300/30 rounded mx-auto md:mx-0"></div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <h2 className={`text-2xl md:text-3xl font-bold ${theme.textColor} mb-2 flex flex-col md:flex-row items-center gap-2`}>
                                {isPatient ? (
                                    <>
                                        <span>Olá,</span>
                                        <span className={theme.highlight}>{cleanName}</span>
                                        <Sparkles className="w-6 h-6 text-yellow-500 animate-spin-slow" />
                                    </>
                                ) : (
                                    <>
                                        <span>Olá, Dr(a).</span>
                                        <span className={theme.highlight}>{lastName || cleanName}</span>
                                    </>
                                )}
                            </h2>

                            {/* Body */}
                            <div className="relative">
                                {isPatient ? (
                                    // Patient Content
                                    <div className="space-y-2">
                                        <div className="bg-white/50 p-3 rounded-xl inline-block backdrop-blur-sm border border-white/40">
                                            <p className="text-gray-800 font-medium flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-purple-500" />
                                                {insight}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2 mt-2 justify-center md:justify-start">
                                            <p className="text-gray-600 italic text-sm md:text-base">"{quote}"</p>
                                            <TTSButton text={`${insight} Frase do dia: ${quote}`} size={18} color={theme.iconColor} />
                                        </div>
                                    </div>
                                ) : (
                                    // Professional Content
                                    <div className="space-y-4">
                                        <div className="bg-white/60 p-4 rounded-xl backdrop-blur-md border border-blue-100 shadow-sm">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Activity className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-semibold text-gray-800">Resumo de Inteligência</h3>
                                            </div>

                                            {riskCount > 0 ? (
                                                <p className="text-gray-700">
                                                    Atenção: <strong className="text-red-600">{riskCount} situações</strong> de risco detectadas requerem sua revisão hoje.
                                                </p>
                                            ) : (
                                                <p className="text-gray-700 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    Tudo operando normalmente com seus {totalPatients} pacientes.
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            <button
                                                onClick={() => navigate('/patients?filter=risk')}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <AlertTriangle className="w-4 h-4" />
                                                Ver Riscos
                                            </button>
                                            <button
                                                onClick={() => navigate('/schedule')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Agenda Hoje
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes gradient-xy {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AIAgentWelcome;
