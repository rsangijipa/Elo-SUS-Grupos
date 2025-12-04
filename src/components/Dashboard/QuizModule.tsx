import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../services/quizService';
import { QuizResult } from '../../types/quiz';
import { Brain, Lock, CheckCircle, AlertTriangle, ArrowRight, X, Heart, Shield } from 'lucide-react';
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

    // Answers state: boolean for mental health, number (1-4) for self-care
    const [answers, setAnswers] = useState<(boolean | number)[]>([]);
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
        setAnswers(new Array(questionCount).fill(type === 'mental-health' ? false : 0)); // 0 means unanswered for scale
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

    const handleSubmit = async () => {
        if (!user || !activeQuiz) return;

        // Validation for Self-Care (must answer all with > 0)
        if (activeQuiz === 'self-care' && answers.some(a => a === 0)) {
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

            {/* Quiz Modal */}
            {isModalOpen && activeQuiz && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {activeQuiz === 'mental-health' ? 'Avaliação de Saúde Mental' : 'Termômetro do Autocuidado'}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    {activeQuiz === 'mental-health' && <AlertTriangle size={14} className="text-amber-500" />}
                                    {activeQuiz === 'mental-health' ? 'Nota: Não substitui avaliação profissional.' : 'Avalie como você tem cuidado de si mesmo.'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {(activeQuiz === 'mental-health' ? MENTAL_HEALTH_QUESTIONS : SELF_CARE_QUESTIONS).map((q, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="font-medium text-slate-800 mb-3">{activeQuiz === 'mental-health' ? `${idx + 1}. ${q}` : q}</p>

                                    {activeQuiz === 'mental-health' ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAnswer(idx, true)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${answers[idx] === true
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                Sim
                                            </button>
                                            <button
                                                onClick={() => handleAnswer(idx, false)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${answers[idx] === false
                                                    ? 'bg-slate-600 text-white shadow-md'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                Não
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { val: 1, label: 'Nunca' },
                                                { val: 2, label: 'Às vezes' },
                                                { val: 3, label: 'Frequentemente' },
                                                { val: 4, label: 'Quase sempre' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.val}
                                                    onClick={() => handleAnswer(idx, opt.val)}
                                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${answers[idx] === opt.val
                                                        ? 'bg-green-600 text-white shadow-md'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 ${activeQuiz === 'mental-health'
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    }`}
                            >
                                {isSubmitting ? 'Enviando...' : (
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
        </div>
    );
};

export default QuizModule;
