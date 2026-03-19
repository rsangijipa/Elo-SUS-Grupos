import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Lightbulb, Loader2, Phone, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService, type MoodAnalysisResult } from '../../services/aiService';
import { moodService, type MoodLog } from '../../services/moodService';
import { toJsDate } from '../../utils/dateUtils';

const EMOJIS = [
    { value: 1, label: 'Muito Mal', icon: '😡' },
    { value: 2, label: 'Mal', icon: '😢' },
    { value: 3, label: 'Normal', icon: '😐' },
    { value: 4, label: 'Bem', icon: '🙂' },
    { value: 5, label: 'Muito Bem', icon: '😁' },
];

const TAGS = ['Sono', 'Trabalho', 'Familia', 'Saude', 'Exercicio'];

export default function MoodTracker() {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [history, setHistory] = useState<MoodLog[]>([]);
    const [lastAnalysis, setLastAnalysis] = useState<MoodAnalysisResult | null>(null);
    const [streak, setStreak] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showRiskModal, setShowRiskModal] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            if (!user?.id) {
                return;
            }

            const moodHistory = await moodService.getPatientHistory(user.id, 14);
            setHistory(moodHistory.slice().reverse());
            setStreak(await moodService.getConsecutiveMoodDays(user.id));

            const latestAnalysis = moodHistory.find((entry) => entry.aiAnalysis)?.aiAnalysis as MoodAnalysisResult | undefined;
            setLastAnalysis(latestAnalysis || null);
        };

        void loadHistory();
    }, [user?.id]);

    const chartData = useMemo(() => history.map((entry, index) => ({
        day: toJsDate(entry.createdAt)?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) || `Dia ${index + 1}`,
        humor: entry.value
    })), [history]);

    const handleMoodSelect = (value: number) => {
        setSelectedMood(value);
        setIsExpanded(true);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((current) => current.includes(tag)
            ? current.filter((item) => item !== tag)
            : [...current, tag]);
    };

    const handleSubmit = async () => {
        if (!user || !selectedMood) {
            return;
        }

        setIsSubmitting(true);
        let aiResult: MoodAnalysisResult | undefined;

        try {
            if (note.trim().length > 5) {
                setIsAnalyzing(true);
                aiResult = await aiService.analyzeMoodEntry(note, selectedMood);
                setIsAnalyzing(false);
            }

            await moodService.logMood({
                patientId: user.id,
                value: selectedMood as 1 | 2 | 3 | 4 | 5,
                tags: selectedTags,
                note,
                aiAnalysis: aiResult
            });

            const moodHistory = await moodService.getPatientHistory(user.id, 14);
            setHistory(moodHistory.slice().reverse());
            setStreak(await moodService.getConsecutiveMoodDays(user.id));
            setLastAnalysis(aiResult || null);

            if (aiResult?.riskFlag || aiResult?.urgencyLevel === 'emergency') {
                setShowRiskModal(true);
            } else {
                toast.success('Humor registrado com sucesso.');
            }

            setSelectedMood(null);
            setNote('');
            setSelectedTags([]);
            setIsExpanded(false);
            localStorage.setItem('lastMoodLog', new Date().toISOString());
        } catch (error) {
            toast.error('Erro ao registrar sentimento.');
            setIsAnalyzing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg p-6 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"></div>

                <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Como voce esta se sentindo hoje?</h3>
                    {streak > 0 && (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                            🔥 {streak} dias registrando seu humor!
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji.value}
                            onClick={() => handleMoodSelect(emoji.value)}
                            data-testid={`btn-mood-${emoji.value}`}
                            className={`transform transition-all duration-300 hover:scale-125 focus:outline-none ${selectedMood === emoji.value ? 'scale-125 grayscale-0' : 'grayscale-50 hover:grayscale-0'}`}
                            title={emoji.label}
                            aria-label={emoji.label}
                        >
                            <span className="text-4xl filter drop-shadow-sm">{emoji.icon}</span>
                        </button>
                    ))}
                </div>

                {chartData.length > 0 && (
                    <div className="mb-5 rounded-2xl border border-slate-100 bg-white/70 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-700">Historico dos ultimos 14 dias</p>
                            <p className="text-xs text-slate-500">Escala de 1 a 5</p>
                        </div>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[1, 5]} allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="humor" stroke="#7C3AED" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {lastAnalysis && (
                    <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-white p-2 text-emerald-600 shadow-sm">
                                <Lightbulb size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    Insight do EloSUS <Sparkles size={14} className="text-emerald-600" />
                                </p>
                                <p className="mt-1 text-sm text-slate-600">{lastAnalysis.summary}</p>
                                <p className="mt-2 text-sm font-medium text-emerald-700">{lastAnalysis.suggestion}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isExpanded && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-white/50 rounded-xl p-4 border border-white/60">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                O que esta impactando seu dia?
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedTags.includes(tag)
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}`}
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
                            {isAnalyzing && (
                                <div className="flex items-center gap-2 text-xs text-purple-600 mt-2 animate-pulse">
                                    <Loader2 size={12} className="animate-spin" />
                                    A IA esta analisando seu relato com carinho...
                                </div>
                            )}
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
                                disabled={isSubmitting || selectedMood === null}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {isAnalyzing ? 'Analisando...' : 'Salvando...'}
                                    </>
                                ) : (
                                    <>
                                        Registrar Dia <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showRiskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-l-4 border-red-500">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 p-3 rounded-full text-red-600">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Estamos aqui por voce</h3>
                                <p className="text-slate-600 mb-4">
                                    Percebemos sinais de sofrimento importante. Procure apoio imediato se sentir que esta em risco.
                                </p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                                    <p className="font-bold text-slate-700 mb-2">Apoio imediato</p>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>CVV: <strong>188</strong></li>
                                        <li>UPA ou pronto atendimento mais proximo</li>
                                        <li>SAMU: <strong>192</strong></li>
                                    </ul>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRiskModal(false)}
                                        className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Fechar
                                    </button>
                                    <a
                                        href="tel:188"
                                        className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Phone size={18} /> Ligar 188
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
