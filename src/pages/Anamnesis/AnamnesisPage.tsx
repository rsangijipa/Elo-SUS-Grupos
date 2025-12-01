import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tobaccoService } from '../../services/tobaccoService';
import { referralService } from '../../services/referralService';
import { toast } from 'react-hot-toast';
import { FileText, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const AnamnesisPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pendingInviteId = searchParams.get('pendingInvite');

    const [step, setStep] = useState(0); // 0 = Intro, 1 = Questions
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        if (error) setError(null);
    };

    const validateAnamnesis = () => {
        const requiredQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
        const missing = requiredQuestions.filter(q => !answers[q]);

        if (missing.length > 0) {
            setError('Por favor, responda todas as perguntas para continuar.');
            return false;
        }
        return true;
    };

    const calculateScore = () => {
        return Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
    };

    const getDependenceLevel = (score: number) => {
        if (score <= 2) return 'Muito Baixo';
        if (score <= 4) return 'Baixo';
        if (score === 5) return 'Médio';
        if (score <= 7) return 'Elevado';
        return 'Muito Elevado';
    };

    const handleSubmit = async () => {
        if (!validateAnamnesis() || !user) return;

        setIsSubmitting(true);
        try {
            const score = calculateScore();
            const dependenceLevel = getDependenceLevel(score);

            const anamnesisData = {
                patientId: user.id,
                patientName: user.name,
                fagerstrom: {
                    answers,
                    totalScore: score,
                    dependenceLevel
                },
                type: 'tobacco'
            };

            // 1. Save Anamnesis
            await tobaccoService.saveAnamnesis(anamnesisData);

            // 2. If pending invite, accept it
            if (pendingInviteId) {
                await referralService.acceptInvite(pendingInviteId, user.name, user.id);
                toast.success('Anamnese salva! Você foi adicionado ao grupo com sucesso.');
            } else {
                toast.success('Anamnese salva com sucesso!');
            }

            // 3. Redirect to Dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error('Error saving anamnesis:', error);
            toast.error('Erro ao salvar anamnese. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <FileText size={32} />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Anamnese de Tabagismo</h1>
                            <p className="text-blue-100 max-w-lg mx-auto">
                                Responda ao questionário abaixo para completar seu perfil e ingressar no grupo terapêutico.
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        {step === 0 ? (
                            <div className="text-center space-y-8 py-8">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-800">Bem-vindo(a), {user?.name?.split(' ')[0]}!</h2>
                                    <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
                                        Para oferecermos o melhor tratamento possível, precisamos entender seu nível de dependência de nicotina.
                                        Este questionário é rápido e fundamental para o seu progresso.
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 max-w-xl mx-auto text-left">
                                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <AlertCircle size={20} />
                                        Sobre o Teste de Fagerström
                                    </h3>
                                    <ul className="space-y-2 text-blue-800 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                            São apenas 6 perguntas de múltipla escolha.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                            Suas respostas são confidenciais e usadas apenas pela equipe de saúde.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                            É necessário completar para entrar no grupo.
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                                >
                                    Iniciar Questionário <ChevronRight size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-6">
                                    {questions.map((q) => (
                                        <div key={q.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                                            <p className="font-bold text-slate-800 mb-4 text-lg">{q.text} <span className="text-red-500">*</span></p>
                                            <div className="space-y-3">
                                                {q.options.map((opt) => (
                                                    <label
                                                        key={opt.label}
                                                        className={`
                                                            flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all bg-white
                                                            ${answers[q.id] === opt.value
                                                                ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm'
                                                                : 'border-slate-200 hover:border-slate-300'}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                            ${answers[q.id] === opt.value ? 'border-blue-600' : 'border-slate-300'}
                                                        `}>
                                                            {answers[q.id] === opt.value && (
                                                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            value={opt.value}
                                                            checked={answers[q.id] === opt.value}
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

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                                        <AlertCircle size={20} />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-[2] py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                Finalizar e Enviar <CheckCircle2 size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnamnesisPage;
