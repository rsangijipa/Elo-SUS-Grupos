import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { X, Baby, AlertTriangle, ArrowRight, Volume2, HeartHandshake, Info } from 'lucide-react';
import TTSButton from '../Common/TTSButton';

interface PregnantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUESTIONS = [
    {
        id: 1,
        text: "Você tem notado alterações extremas no seu sono ou apetite (sem relação direta com o desconforto físico da gestação)?",
    },
    {
        id: 2,
        text: "Você tem sentimentos frequentes de culpa, inutilidade ou sente que não será capaz de cuidar do bebê?",
    },
    {
        id: 3,
        text: "Você sente uma tristeza profunda ou perda de energia que dura a maior parte do dia?",
    },
    {
        id: 4,
        text: "Você tem pensamentos recorrentes de fazer mal a si mesma ou ao bebê?",
        isCritical: true
    },
    {
        id: 5,
        text: "Esses sentimentos persistem há mais de duas semanas e atrapalham sua rotina diária?",
    }
];

const PregnantModal: React.FC<PregnantModalProps> = ({ isOpen, onClose }) => {
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
        const q1 = answers[1];
        const q2 = answers[2];
        const q3 = answers[3];
        const q4 = answers[4]; // Critical
        const q5 = answers[5]; // Persistence

        let riskLevel: 'none' | 'baby_blues' | 'depression' | 'emergency' = 'none';

        if (q4) {
            riskLevel = 'emergency';
        } else if (q5 || q3) {
            riskLevel = 'depression';
        } else if (q1 || q2) {
            riskLevel = 'baby_blues';
        }

        const score = Object.values(answers).filter(Boolean).length;

        return { riskLevel, score };
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
                pregnantScreening: {
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

    const { riskLevel } = calculateResult();

    const getFeedbackContent = () => {
        switch (riskLevel) {
            case 'emergency':
                return {
                    color: 'red',
                    icon: <AlertTriangle size={48} />,
                    title: "Busque Ajuda Imediatamente",
                    message: "Por favor, busque ajuda imediatamente. Vá a um CAPS ou ligue 188 (CVV). Você não está sozinha e existe tratamento urgente para o que você está sentindo.",
                    tts: "Por favor, busque ajuda imediatamente. Vá a um CAPS ou ligue 188 (CVV). Você não está sozinha e existe tratamento urgente para o que você está sentindo."
                };
            case 'depression':
                return {
                    color: 'amber',
                    icon: <Info size={48} />,
                    title: "Atenção Especial Necessária",
                    message: "Esses sinais merecem atenção especial. A Depressão Pós-parto é tratável e comum (10-15% das mulheres). Converse com sua equipe de saúde na próxima consulta ou vá à UBS.",
                    tts: "Esses sinais merecem atenção especial. A Depressão Pós-parto é tratável e comum. Converse com sua equipe de saúde na próxima consulta ou vá à UBS."
                };
            case 'baby_blues':
                return {
                    color: 'blue',
                    icon: <Baby size={48} />,
                    title: "Possível Baby Blues",
                    message: "Muitas alterações emocionais são hormonais. O 'Baby Blues' afeta até 70% das mães nos primeiros dias. Monitore, mas se persistir por mais de duas semanas, busque ajuda.",
                    tts: "Muitas alterações emocionais são hormonais. O Baby Blues afeta até 70% das mães nos primeiros dias. Monitore, mas se persistir por mais de duas semanas, busque ajuda."
                };
            default:
                return {
                    color: 'green',
                    icon: <HeartHandshake size={48} />,
                    title: "Tudo parece bem",
                    message: "Você parece estar lidando bem com as mudanças. Continue se cuidando e não hesite em procurar ajuda se algo mudar.",
                    tts: "Tudo parece bem. Você parece estar lidando bem com as mudanças. Continue se cuidando e não hesite em procurar ajuda se algo mudar."
                };
        }
    };

    const feedback = getFeedbackContent();
    const colorClass = {
        red: 'bg-red-50 text-red-600 border-red-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100'
    }[feedback.color];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                            <Baby size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Saúde Materna</h2>
                            <p className="text-xs text-slate-500">Acompanhamento Gestante e Puérpera</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TTSButton text="Saúde Materna. Acompanhamento para Gestantes e Puérperas." />
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {step === 'intro' && (
                        <div className="space-y-6 text-center py-8">
                            <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Baby size={64} className="text-pink-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Cuidando de quem cuida</h3>
                            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                A maternidade traz muitas mudanças. Queremos saber como você está se sentindo para garantir que você e seu bebê recebam o melhor cuidado.
                            </p>
                            <div className="flex justify-center gap-4 pt-4">
                                <button
                                    onClick={() => setStep('questions')}
                                    className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    Começar <ArrowRight size={20} />
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
                                                    ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-pink-50 hover:border-pink-200'
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
                                    className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Ver Resultado'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className={`border rounded-2xl p-6 text-center ${colorClass}`}>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/50`}>
                                    {feedback.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feedback.title}</h3>
                                <p className="mb-4 opacity-90">
                                    {feedback.message}
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <TTSButton text={`${feedback.title}. ${feedback.tts}`} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Volume2 size={18} className="text-pink-500" />
                                    Materiais de Apoio
                                </h4>

                                <a
                                    href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/depressao-pos-parto"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-md transition-all group"
                                >
                                    <h5 className="font-bold text-pink-600 group-hover:underline">Depressão Pós-parto (Ministério da Saúde)</h5>
                                    <p className="text-sm text-slate-500 mt-1">Entenda os sintomas e o tratamento gratuito no SUS.</p>
                                </a>

                                <a
                                    href="https://bvsms.saude.gov.br/bvs/publicacoes/manual_pre_natal_puerperio_3ed.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-md transition-all group"
                                >
                                    <h5 className="font-bold text-pink-600 group-hover:underline">Manual: Pré-natal e Puerpério</h5>
                                    <p className="text-sm text-slate-500 mt-1">Atenção qualificada e humanizada (Baixar PDF).</p>
                                </a>

                                <a
                                    href="https://repositorio.ufsc.br/handle/123456789/265596"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-md transition-all group"
                                >
                                    <h5 className="font-bold text-pink-600 group-hover:underline">Webpalestra: Saúde Mental Materna</h5>
                                    <p className="text-sm text-slate-500 mt-1">Vídeo sobre avaliação no pré-natal (UFSC).</p>
                                </a>
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

export default PregnantModal;
