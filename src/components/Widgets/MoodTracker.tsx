import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { moodService } from '../../services/moodService';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

const EMOJIS = [
    { value: 1, label: 'Muito Mal', icon: '😡' },
    { value: 2, label: 'Mal', icon: '😢' },
    { value: 3, label: 'Normal', icon: '😐' },
    { value: 4, label: 'Bem', icon: '🙂' },
    { value: 5, label: 'Muito Bem', icon: '😁' },
];

const TAGS = [
    'Ansiedade', 'Insônia', 'Estresse', 'Conflito Familiar',
    'Cansaço', 'Dor', 'Tristeza', 'Solidão',
    'Gratidão', 'Energia', 'Calma', 'Conquista'
];

export default function MoodTracker() {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleMoodSelect = (value: number) => {
        setSelectedMood(value);
        setIsExpanded(true);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async () => {
        if (!user || !selectedMood) return;

        setIsSubmitting(true);
        try {
            await moodService.logMood({
                patientId: user.id,
                value: selectedMood as 1 | 2 | 3 | 4 | 5,
                tags: selectedTags,
                note: note
            });

            toast.success('Sentimento registrado! Seu jardim emocional está crescendo 🌱');
            setSelectedMood(null);
            setNote('');
            setSelectedTags([]);
            setIsExpanded(false);

            // Save to localStorage for simple persistence check if needed (optional per requirements)
            localStorage.setItem('lastMoodLog', new Date().toISOString());

        } catch (error) {
            console.error(error);
            toast.error('Erro ao registrar sentimento.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg p-6 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"></div>

            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
                Como você está se sentindo hoje?
            </h3>

            <div className="flex justify-between items-center mb-6 px-2">
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji.value}
                        onClick={() => handleMoodSelect(emoji.value)}
                        className={`transform transition-all duration-300 hover:scale-125 focus:outline-none ${selectedMood === emoji.value ? 'scale-125 grayscale-0' : 'grayscale-50 hover:grayscale-0'
                            }`}
                        title={emoji.label}
                    >
                        <span className="text-4xl filter drop-shadow-sm">{emoji.icon}</span>
                    </button>
                ))}
            </div>

            {isExpanded && (
                <div className="animate-fade-in space-y-4">
                    <div className="bg-white/50 rounded-xl p-4 border border-white/60">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            O que está impactando seu dia?
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedTags.includes(tag)
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Quer escrever algo sobre hoje? (Opcional)"
                            className="w-full bg-white/80 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none h-20"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Salvando...' : (
                                <>
                                    Registrar Dia <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
