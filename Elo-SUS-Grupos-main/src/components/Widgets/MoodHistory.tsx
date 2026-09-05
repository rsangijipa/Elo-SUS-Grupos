import React, { useState, useEffect, useMemo } from 'react';
import { History, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { moodService, MoodLog } from '../../services/moodService';
import { toJsDate } from '../../utils/dateUtils';

const EMOJI_MAP: Record<number, string> = {
    1: '😡', 2: '😢', 3: '😐', 4: '🙂', 5: '😁'
};

const MOOD_COLORS: Record<number, string> = {
    1: '#EF4444', 2: '#F59E0B', 3: '#94A3B8', 4: '#22C55E', 5: '#3B82F6'
};

export default function MoodHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<MoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        if (!user) return;
        setLoading(true);
        const data = await moodService.getPatientHistory(user.id, 30);
        setHistory(data);
        setLoading(false);
    };

    /* — Derived stats — */
    const stats = useMemo(() => {
        if (history.length === 0) return null;

        const values = history.map(h => h.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        // Trend: compare average of last 7 vs previous 7
        const recent = values.slice(0, Math.min(7, values.length));
        const previous = values.slice(7, Math.min(14, values.length));
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const previousAvg = previous.length > 0 ? previous.reduce((a, b) => a + b, 0) / previous.length : recentAvg;
        const trend = recentAvg - previousAvg;

        // Most used tags
        const tagCount: Record<string, number> = {};
        history.forEach(h => {
            h.tags?.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([tag]) => tag);

        return { avg, trend, topTags, totalEntries: history.length };
    }, [history]);

    /* — Mini sparkline: last 7 entries reversed — */
    const sparklineData = useMemo(() => {
        return history.slice(0, 7).reverse();
    }, [history]);

    const visibleHistory = expanded ? history : history.slice(0, 5);

    if (loading) {
        return (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-40" />
                    <div className="h-20 bg-slate-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 text-center">
                <History className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-sm text-slate-500 font-medium">Nenhum registro de humor ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Seus registros aparecerão aqui após o primeiro check-in.</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg p-6 space-y-5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>

            {/* Header + Stats */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <History size={20} className="text-purple-500" />
                    Jardim Emocional
                </h3>
                {stats && (
                    <div className="flex items-center gap-1 text-sm font-bold">
                        {stats.trend > 0.3 ? (
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                <TrendingUp size={14} /> Melhorando
                            </span>
                        ) : stats.trend < -0.3 ? (
                            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs">
                                <TrendingDown size={14} /> Atenção
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full text-xs">
                                <Minus size={14} /> Estável
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Sparkline */}
            {sparklineData.length > 1 && (
                <div className="flex items-end gap-1 h-12">
                    {sparklineData.map((entry, i) => {
                        const height = (entry.value / 5) * 100;
                        const date = toJsDate(entry.createdAt);
                        const dayLabel = date ? date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3) : '';
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full rounded-t-md transition-all"
                                    style={{
                                        height: `${height}%`,
                                        backgroundColor: MOOD_COLORS[entry.value],
                                        opacity: 0.7 + (i / sparklineData.length) * 0.3
                                    }}
                                    title={`${EMOJI_MAP[entry.value]} ${dayLabel}`}
                                />
                                <span className="text-[9px] text-slate-400 font-medium">{dayLabel}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Stats summary */}
            {stats && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/70 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-slate-800">{EMOJI_MAP[Math.round(stats.avg)]}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Média</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-slate-800">{stats.totalEntries}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Registros</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 text-center">
                        {stats.topTags.length > 0 ? (
                            <>
                                <p className="text-xs font-bold text-slate-700 leading-tight">
                                    {stats.topTags[0]}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">Tag Principal</p>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-bold text-slate-300">—</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">Sem tags</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
                {visibleHistory.map((entry, index) => {
                    const date = toJsDate(entry.createdAt);
                    const dateStr = date ? date.toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    }) : '';

                    return (
                        <div
                            key={entry.id || index}
                            className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/60 hover:bg-white/70 transition-colors"
                        >
                            <span className="text-2xl" title={`Nível ${entry.value}`}>
                                {EMOJI_MAP[entry.value]}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-700">{dateStr}</span>
                                    {entry.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                {entry.note && (
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{entry.note}</p>
                                )}
                            </div>
                            <div
                                className="w-2 h-8 rounded-full shrink-0"
                                style={{ backgroundColor: MOOD_COLORS[entry.value] }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Expand toggle */}
            {history.length > 5 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 py-2 transition-colors"
                >
                    {expanded ? (
                        <>Mostrar menos <ChevronUp size={14} /></>
                    ) : (
                        <>Ver todos ({history.length}) <ChevronDown size={14} /></>
                    )}
                </button>
            )}
        </div>
    );
}
