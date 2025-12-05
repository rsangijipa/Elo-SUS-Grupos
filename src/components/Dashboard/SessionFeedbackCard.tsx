import React, { useState } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { toast } from 'react-hot-toast';
import { Send, X } from 'lucide-react';

interface SessionFeedbackCardProps {
    groupId: string;
    sessionId: string;
    patientId: string;
    onClose: () => void;
}

const TAGS_OPTIONS = {
    happy: ['Acolhedor', 'Aprendi muito', 'Motivador', 'Claro'],
    neutral: ['Razoável', 'Pouca interação', 'Conteúdo denso'],
    sad: ['Confuso', 'Cansativo', 'Me senti exposto', 'Técnico demais']
};

const SessionFeedbackCard: React.FC<SessionFeedbackCardProps> = ({ groupId, sessionId, patientId, onClose }) => {
    const [step, setStep] = useState<'rating' | 'tags'>('rating');
    const [rating, setRating] = useState<'happy' | 'neutral' | 'sad' | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRatingSelect = (selected: 'happy' | 'neutral' | 'sad') => {
        setRating(selected);
        setStep('tags');
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async () => {
        if (!rating) return;

        setIsSubmitting(true);
        try {
            await feedbackService.submitFeedback(groupId, {
                patientId,
                sessionId,
                rating,
                tags: selectedTags
            });
            toast.success('Obrigado pelo seu feedback!', { icon: '🙏' });
            onClose();
        } catch (error) {
            toast.error('Erro ao enviar feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 relative overflow-hidden animate-slide-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>

            <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Como foi o encontro de hoje?</h3>
                <p className="text-sm text-slate-500">Sua opinião ajuda a melhorar o grupo.</p>
            </div>

            {step === 'rating' ? (
                <div className="flex justify-center gap-6 py-4">
                    <button
                        onClick={() => handleRatingSelect('sad')}
                        className="flex flex-col items-center gap-2 group transition-transform hover:scale-110"
                    >
                        <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">😐</div>
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">Mais ou menos</span>
                    </button>
                    <button
                        onClick={() => handleRatingSelect('neutral')}
                        className="flex flex-col items-center gap-2 group transition-transform hover:scale-110"
                    >
                        <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">🙂</div>
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">Bom</span>
                    </button>
                    <button
                        onClick={() => handleRatingSelect('happy')}
                        className="flex flex-col items-center gap-2 group transition-transform hover:scale-110"
                    >
                        <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">🤩</div>
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">Excelente!</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-wrap justify-center gap-2">
                        {rating && TAGS_OPTIONS[rating].map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTags.includes(tag)
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 scale-105'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70"
                    >
                        {isSubmitting ? 'Enviando...' : <><Send size={18} /> Enviar Opinião</>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SessionFeedbackCard;
