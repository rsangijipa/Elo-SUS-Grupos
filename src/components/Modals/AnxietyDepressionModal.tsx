import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Volume2, HeartHandshake } from 'lucide-react';
import TTSButton from '../Common/TTSButton';
import ModalContent from '../Auth/ModalContent';

interface AnxietyDepressionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUESTIONS = [
    {
        id: 1,
        text: "Nas últimas duas semanas, você teve pouco interesse ou prazer em fazer as coisas?",
        type: 'depression'
    },
    {
        id: 2,
        text: "Nas últimas duas semanas, você se sentiu para baixo, deprimido(a) ou sem perspectiva?",
        type: 'depression'
    },
    {
        id: 3,
        text: "Você tem se sentido nervoso(a), ansioso(a) ou muito tenso(a)?",
        type: 'anxiety'
    },
    {
        id: 4,
        text: "Você tem tido preocupações excessivas que são difíceis de controlar?",
        type: 'anxiety'
    },
    {
        id: 5,
        text: "Você sente desconforto intenso em situações sociais ou tem evitado lugares por medo?",
        type: 'anxiety'
    }
];

const AnxietyDepressionModal: React.FC<AnxietyDepressionModalProps> = ({ isOpen, onClose }) => {
    const { user, refreshUserData } = useAuth();
    const [step, setStep] = useState<'intro' | 'questions' | 'result'>('intro');
    const [answers, setAnswers] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('intro');
            setAnswers({});
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Stop TTS when modal closes
    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rv = (window as any).responsiveVoice;
            if (rv) rv.cancel();
        }
    }, [isOpen]);

    const handleAnswer = (questionId: number, value: boolean) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const calculateResult = () => {
        // Depression Alert: Yes to Q1 OR Q2
        const depressionAlert = answers[1] || answers[2];

        // Anxiety Alert: Yes to Q3 OR Q4 OR Q5
        const anxietyAlert = answers[3] || answers[4] || answers[5];

        const score = Object.values(answers).filter(Boolean).length;

        return { depressionAlert, anxietyAlert, score };
    };

    const handleSubmit = async () => {
        if (!user) return;

        // Validate all questions answered
        if (Object.keys(answers).length < QUESTIONS.length) {
            toast.error("Por favor, responda todas as perguntas.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = calculateResult();

            await updateDoc(doc(db, 'users', user.id), {
                healthScreening: {
                    date: serverTimestamp(),
                    ...result
                }
            });

            await refreshUserData();
            setStep('result');
            toast.success("Avaliação salva com sucesso.");
        } catch (error) {
            console.error("Error saving screening:", error);
            toast.error("Erro ao salvar avaliação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const result = calculateResult();
    const hasAlert = result.depressionAlert || result.anxietyAlert;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <HeartHandshake size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Como você está se sentindo?</h2>
                            <p className="text-xs text-slate-500">Rastreio de Saúde Mental (PHQ-2 + Ansiedade)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TTSButton text="Como você está se sentindo? Rastreio de Saúde Mental." />
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {step === 'intro' && (
                        <div className="space-y-6 text-center py-8">
                            <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HeartHandshake size={64} className="text-purple-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Vamos conversar um pouco?</h3>
                            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                Este é um espaço seguro para você refletir sobre suas emoções nas últimas duas semanas.
                                São apenas 5 perguntas rápidas que nos ajudam a entender como podemos te apoiar melhor.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <button
                                    onClick={() => setStep('questions')}
                                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    Começar Avaliação <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'questions' && (
                        <div className="space-y-8">
                            {QUESTIONS.map((q, idx) => (
                                <div key={q.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-lg font-medium text-slate-800 leading-snug flex-1">
                                            {q.text}
                                        </p>
                                        <TTSButton text={q.text} size={20} />
                                    </div>

                                    <div className="flex gap-3 pl-9">
                                        <button
                                            onClick={() => handleAnswer(q.id, true)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${answers[q.id] === true
                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200'
                                                }`}
                                        >
                                            Sim
                                        </button>
                                        <button
                                            onClick={() => handleAnswer(q.id, false)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${answers[q.id] === false
                                                    ? 'bg-slate-600 border-slate-600 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                        >
                                            Não
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Ver Resultado'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="space-y-6 animate-fade-in">
                            {hasAlert ? (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Atenção ao seu bem-estar</h3>
                                    <p className="text-slate-600 mb-4">
                                        Identificamos alguns sinais que merecem atenção. Não se preocupe, você não está sozinho(a).
                                        O SUS oferece acolhimento gratuito e especializado para o que você está sentindo.
                                    </p>
                                    <div className="inline-flex items-center gap-2 text-amber-700 font-bold bg-amber-100 px-4 py-2 rounded-full text-sm">
                                        Recomendamos buscar uma UBS ou CAPS
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <TTSButton text="Atenção ao seu bem-estar. Identificamos alguns sinais que merecem atenção. Não se preocupe, você não está sozinho. O SUS oferece acolhimento gratuito e especializado. Recomendamos buscar uma UBS ou CAPS." />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Tudo parece bem!</h3>
                                    <p className="text-slate-600">
                                        Seus resultados indicam que você está lidando bem com suas emoções no momento.
                                        Continue praticando o autocuidado e participando dos grupos!
                                    </p>
                                    <div className="mt-4 flex justify-center">
                                        <TTSButton text="Tudo parece bem! Seus resultados indicam que você está lidando bem com suas emoções no momento. Continue praticando o autocuidado e participando dos grupos!" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Volume2 size={18} className="text-purple-500" />
                                    Materiais de Apoio e Leitura
                                </h4>

                                <a
                                    href="https://linhasdecuidado.saude.gov.br/portal/ansiedade/unidade-de-atencao-primaria/rastreamento-diagnostico/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
                                >
                                    <h5 className="font-bold text-purple-700 group-hover:underline">Cartilha: Transtornos de Ansiedade (MS)</h5>
                                    <p className="text-sm text-slate-500 mt-1">Informações oficiais do Ministério da Saúde sobre rastreamento e diagnóstico.</p>
                                </a>

                                <a
                                    href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/depressao-pos-parto"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
                                >
                                    <h5 className="font-bold text-purple-700 group-hover:underline">Linha de Cuidado: Depressão e Ansiedade</h5>
                                    <p className="text-sm text-slate-500 mt-1">Saiba mais sobre os cuidados oferecidos pelo SUS.</p>
                                </a>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <h5 className="font-bold text-slate-700">Busca de Ajuda Profissional</h5>
                                    <p className="text-sm text-slate-600 mt-1">
                                        O atendimento inicia na Atenção Primária do SUS (Posto de Saúde).
                                        Lá você pode ser encaminhado para um CAPS (Centro de Atenção Psicossocial) se necessário.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnxietyDepressionModal;
