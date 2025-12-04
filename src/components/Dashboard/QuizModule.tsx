import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { quizService } from '../../services/quizService';
import { QuizResult } from '../../types/quiz';
import { Brain, Lock, CheckCircle, AlertTriangle, ArrowRight, X, Heart, Shield, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MENTAL_HEALTH_QUESTIONS = [
    "Você tem tido dores de cabeça frequentemente?",
    "Tem tido falta de apetite?",
    "Você tem dormido mal?",
    "Você tem se assustado com facilidade?",
    "Tem tremores nas mãos?",
    "Você tem sentido nervosismo, tensão e/ou preocupação com frequência?",
    "Tem tido má digestão?",
    "Você está tendo dificuldade de pensar com clareza?",
    "Tem se sentido triste ultimamente?",
    "Você tem chorado mais do que de costume?",
    "Encontra dificuldades para realizar com satisfação suas atividades diárias?",
    "Ultimamente, você tem perdido o interesse pelas coisas?",
    "Sente cansaço o tempo todo?"
];

const SELF_CARE_QUESTIONS = [
    "😴 Como anda seu sono? (Dorme o suficiente?)",
    "🍽️ Sua alimentação está nutritiva? (Refeições regulares?)",
    "🚿🧼 Você cuida minimamente da sua rotina básica? (Higiene, ambiente?)",
    "🧘‍♀️ Você faz pausas de verdade ao longo do dia? (Sem telas?)",
    "🎨 Você tem praticado algum hobby ou momento de prazer?",
    "🤝 Você tem sentido conexão com alguém significativo?",
    "🗓️ Sua rotina tem minimamente uma ordem?",
    "🧠 Como está sua mente durante o dia? (Consegue se escutar?)",
    "🏃‍♂️ Seu corpo tem se movimentado?",
    "💛 Você faz algo intencionalmente por você? (Pequenos rituais?)"
];

type QuizType = 'mental-health' | 'self-care';

const QuizModule: React.FC = () => {
    const { user } = useAuth();
    const [mentalHealthResult, setMentalHealthResult] = useState<QuizResult | null>(null);
    const [selfCareResult, setSelfCareResult] = useState<QuizResult | null>(null);

    const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Answers state: boolean for mental health, number (1-4) for self-care, null for unanswered
    const [answers, setAnswers] = useState<(boolean | number | null)[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result Modal State
    const [showResultModal, setShowResultModal] = useState(false);
    const [currentResult, setCurrentResult] = useState<{ score: number, feedback: string, badge: string } | null>(null);

    useEffect(() => {
        if (user) {
            loadResults();
        }
    }, [user]);

    const loadResults = async () => {
        if (!user) return;
        const mhResult = await quizService.getQuizResultById(user.id, 'mental-health-general-13');
        const scResult = await quizService.getQuizResultById(user.id, 'self-care-smart');
        setMentalHealthResult(mhResult);
        setSelfCareResult(scResult);
    };

    const startQuiz = (type: QuizType) => {
        setActiveQuiz(type);
        const questionCount = type === 'mental-health' ? MENTAL_HEALTH_QUESTIONS.length : SELF_CARE_QUESTIONS.length;
        setAnswers(new Array(questionCount).fill(null)); // Initialize with null
        setIsModalOpen(true);
    };

    const handleAnswer = (index: number, value: boolean | number) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const calculateMentalHealthRisk = (score: number): 'low' | 'moderate' | 'high' => {
        if (score <= 5) return 'low';
        if (score <= 9) return 'moderate';
        return 'high';
    };

    const getSelfCareFeedback = (score: number) => {
        if (score >= 32) return "🌟 Autocuidado Fluido: Você navega a rotina com leveza e intenção. Continue assim!";
        if (score >= 24) return "⭐ Autocuidado Médio: Boas práticas, mas algumas áreas pedem mais carinho.";
        if (score >= 16) return "✴️ Autocuidado Intermitente: Estilo 'quando dá'. Pequenos ajustes farão diferença.";
        return "⚠️ Sinal Amarelo: Hora de recalibrar. Seu corpo pede socorro silencioso. Peça apoio.";
    };

    const speakText = (text: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rv = (window as any).responsiveVoice;
        if (rv) {
            rv.cancel(); // Stop previous
            rv.speak(text, "Brazilian Portuguese Female", { rate: 1.1 });
        }
    };

    // Stop speech when modal closes
    useEffect(() => {
        if (!isModalOpen) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rv = (window as any).responsiveVoice;
            if (rv) rv.cancel();
        }
    }, [isModalOpen]);

    const handleSubmit = async () => {
        if (!user || !activeQuiz) return;

        // Validation: Check if any answer is null (unanswered)
        if (answers.some(a => a === null || a === 0)) {
            toast.error('Por favor, responda todas as perguntas.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (activeQuiz === 'mental-health') {
                // Ensure answers are treated as booleans for this quiz
                const booleanAnswers = answers.map(a => !!a);
                const score = booleanAnswers.filter(a => a === true).length;
                const riskLevel = calculateMentalHealthRisk(score);

                const result: Omit<QuizResult, 'id' | 'createdAt'> = {
                    quizId: 'mental-health-general-13',
                    score,
                    totalQuestions: MENTAL_HEALTH_QUESTIONS.length,
                    answers: booleanAnswers,
                    riskLevel,
                    suggestedReferral: riskLevel === 'high' ? 'anxiety-depression-group' : undefined
                };

                await quizService.saveQuizResult(user.id, result);

                // Unlock Achievement
                await updateDoc(doc(db, 'users', user.id), {
                    achievements: arrayUnion('mind_explorer')
                });

                toast.success('Avaliação concluída! Medalha desbloqueada.');
            } else {
                // Self-Care Logic
                // Ensure answers are treated as numbers
                const numberAnswers = answers.map(a => Number(a));
                const score = numberAnswers.reduce((acc, curr) => acc + curr, 0);
                const feedback = getSelfCareFeedback(score);

                const result: Omit<QuizResult, 'id' | 'createdAt'> = {
                    quizId: 'self-care-smart',
                    score,
                    totalQuestions: SELF_CARE_QUESTIONS.length * 4, // Max score is 40
                    answers: numberAnswers,
                    feedback
                };

                await quizService.saveQuizResult(user.id, result);

                // Unlock Achievement
                await updateDoc(doc(db, 'users', user.id), {
                    achievements: arrayUnion('self_guardian')
                });

                setCurrentResult({
                    score,
                    feedback,
                    badge: "Guardião de Si"
                });
                setShowResultModal(true);
            }

            setIsModalOpen(false);
            loadResults();
        } catch (error) {
            toast.error('Erro ao salvar avaliação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-500"></div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="text-purple-500" />
                        Jornada de Autoconhecimento
                    </h2>
                </div>

                {/* Quiz List */}
                <div className="space-y-3">
                    {/* Mental Health Quiz */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-purple-200 transition-colors">
                        <div>
                            <h3 className="font-bold text-slate-700">Avaliação Geral de Saúde Mental</h3>
                            <p className="text-sm text-slate-500">13 perguntas rápidas • ~2 min</p>
                        </div>
                        {mentalHealthResult ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-100 px-3 py-1 rounded-full">
                                <CheckCircle size={14} />
                                Concluído
                            </span>
                        ) : (
                            <button
                                onClick={() => startQuiz('mental-health')}
                                className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                            >
                                Começar
                            </button>
                        )}
                    </div>

                    {/* Self Care Quiz */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-green-200 transition-colors">
                        <div>
                            <h3 className="font-bold text-slate-700">Termômetro do Autocuidado</h3>
                            <p className="text-sm text-slate-500">10 perguntas de reflexão • ~3 min</p>
                        </div>
                        {selfCareResult ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-100 px-3 py-1 rounded-full">
                                <CheckCircle size={14} />
                                Concluído
                            </span>
                        ) : (
                            <button
                                onClick={() => startQuiz('self-care')}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                            >
                                Começar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quiz Modal (Immersive Overlay) */}
            {isModalOpen && activeQuiz && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-lg rounded-[2rem] shadow-2xl bg-white px-6 py-8 flex flex-col min-h-screen md:min-h-0 md:h-auto md:max-h-[90vh] border border-slate-100">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900">
                                    {activeQuiz === 'mental-health' ? 'Avaliação de Saúde Mental' : 'Termômetro do Autocuidado'}
                                </h3>
                                <p className="text-xs md:text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    {activeQuiz === 'mental-health' && <AlertTriangle size={12} className="text-amber-500" />}
                                    {activeQuiz === 'mental-health' ? 'Nota: Não substitui avaliação profissional.' : 'Avalie como você tem cuidado de si mesmo.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400 hover:text-slate-600" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${activeQuiz === 'mental-health' ? 'bg-purple-600' : 'bg-green-600'
                                    }`}
                                style={{ width: `${(answers.filter(a => a !== null && a !== 0).length / answers.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Questions */}
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {(activeQuiz === 'mental-health' ? MENTAL_HEALTH_QUESTIONS : SELF_CARE_QUESTIONS).map((q, idx) => (
                                <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <p className="text-base md:text-lg font-medium text-slate-800 mb-3 leading-snug flex items-start gap-2">
                                        <span className="text-slate-300 font-bold">{idx + 1}.</span>
                                        <span className="flex-1">{q}</span>
                                        <button
                                            onClick={() => speakText(q)}
                                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                                            title="Ouvir pergunta"
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    </p>

                                    {activeQuiz === 'mental-health' ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAnswer(idx, true)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm md:text-base font-bold transition-all border ${answers[idx] === true
                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-md scale-[1.01]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50'
                                                    }`}
                                            >
                                                Sim
                                            </button>
                                            <button
                                                onClick={() => handleAnswer(idx, false)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm md:text-base font-bold transition-all border ${answers[idx] === false
                                                    ? 'bg-slate-600 border-slate-600 text-white shadow-md scale-[1.01]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                Não
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {[
                                                { val: 1, label: 'Nunca', emoji: '🌑' },
                                                { val: 2, label: 'Às vezes', emoji: '🌓' },
                                                { val: 3, label: 'Frequentemente', emoji: '🌔' },
                                                { val: 4, label: 'Quase sempre', emoji: '🌕' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.val}
                                                    onClick={() => handleAnswer(idx, opt.val)}
                                                    className={`py-2 px-1 rounded-xl text-[10px] md:text-xs font-bold transition-all border flex flex-col items-center gap-1 ${answers[idx] === opt.val
                                                        ? 'bg-green-600 border-green-600 text-white shadow-md scale-[1.01]'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-green-200 hover:bg-green-50'
                                                        }`}
                                                >
                                                    <span className="text-lg md:text-xl">{opt.emoji}</span>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end sticky bottom-0 bg-white/95 backdrop-blur-xl">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-6 py-3 text-white text-sm md:text-base font-bold rounded-xl transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${activeQuiz === 'mental-health'
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    }`}
                            >
                                {isSubmitting ? 'Processando...' : (
                                    <>
                                        Concluir Avaliação
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Modal (Self-Care) */}
            {showResultModal && currentResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-400 to-green-500"></div>
                        <button
                            onClick={() => setShowResultModal(false)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative pt-12 px-8 pb-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 text-green-500 animate-bounce-slow">
                                <Shield size={48} />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Parabéns!</h2>
                            <p className="text-slate-500 mb-6">Você completou o Termômetro do Autocuidado.</p>

                            <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                                <div className="text-4xl font-bold text-green-600 mb-2">{currentResult.score}/40</div>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                    {currentResult.feedback}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
                                🏆 Nova Medalha: {currentResult.badge}
                            </div>

                            <button
                                onClick={() => setShowResultModal(false)}
                                className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuizModule;
