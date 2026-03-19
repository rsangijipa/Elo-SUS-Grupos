import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, Clock, ExternalLink, Filter, Heart, Moon, PlayCircle, Sparkles, Wind, X } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MoodTracker from '../../components/Widgets/MoodTracker';
import { useAuth } from '../../contexts/AuthContext';
import { WEEKLY_CHALLENGES } from '../../data/weeklyChallenges';
import { getWellbeingContent, WELLBEING_CATEGORIES } from '../../constants/wellbeingContent';
import { healthService, type ActivityData, type SleepData } from '../../services/integrations/healthService';
import { contentService, type Material, type Video } from '../../services/integrations/contentService';
import { youtubeService, type VideoResult } from '../../services/youtubeService';

const WellbeingCenter: React.FC = () => {
    const { user } = useAuth();
    const [sleepData, setSleepData] = useState<SleepData[]>([]);
    const [activityData, setActivityData] = useState<ActivityData[]>([]);
    const [isFitConnected, setIsFitConnected] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [dailyVideo, setDailyVideo] = useState<VideoResult | null>(null);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [breathingMode, setBreathingMode] = useState<'478' | 'box'>('478');
    const [breathingStep, setBreathingStep] = useState<'inspire' | 'segure' | 'expire' | 'segure2'>('inspire');
    const [breathingCounter, setBreathingCounter] = useState(4);
    const [isBreathing, setIsBreathing] = useState(false);

    useEffect(() => {
        if (isFitConnected) {
            void healthService.getSleepData().then(setSleepData);
            void healthService.getSteps().then(setActivityData);
        }
    }, [isFitConnected]);

    useEffect(() => {
        void contentService.getMaterials().then(setMaterials);
        void contentService.getVideos().then(setVideos);
        void youtubeService.getDailyVideo().then(setDailyVideo);
    }, []);

    useEffect(() => {
        if (!isBreathing) {
            return;
        }

        const steps478 = {
            inspire: { next: 'segure' as const, duration: 4 },
            segure: { next: 'expire' as const, duration: 7 },
            expire: { next: 'inspire' as const, duration: 8 },
            segure2: { next: 'inspire' as const, duration: 4 }
        };
        const stepsBox = {
            inspire: { next: 'segure' as const, duration: 4 },
            segure: { next: 'expire' as const, duration: 4 },
            expire: { next: 'segure2' as const, duration: 4 },
            segure2: { next: 'inspire' as const, duration: 4 }
        };
        const scheme = breathingMode === '478' ? steps478 : stepsBox;

        const interval = window.setInterval(() => {
            setBreathingCounter((current) => {
                if (current > 1) return current - 1;
                const nextStep = scheme[breathingStep].next;
                setBreathingStep(nextStep);
                return scheme[nextStep].duration;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [breathingMode, breathingStep, isBreathing]);

    const audience = user?.role === 'professional' ? 'professional' : 'patient';

    const articles = useMemo(() => getWellbeingContent(audience as 'patient' | 'professional', selectedCategory || undefined), [audience, selectedCategory]);

    const dailyHighlight = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const allArticles = getWellbeingContent(audience as 'patient' | 'professional');
        return allArticles[dayOfYear % allArticles.length];
    }, [audience]);

    const exerciseOfTheWeek = useMemo(() => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        return WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length];
    }, []);

    const breathingLabel = {
        inspire: 'Inspire',
        segure: 'Segure',
        expire: 'Expire',
        segure2: 'Segure'
    }[breathingStep];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Central de Bem-Estar</h2>
                <p className="text-slate-500 mt-1">Técnicas baseadas em evidências para cuidar da sua saúde mental.</p>
            </div>

            {dailyHighlight && (
                <section className="bg-gradient-to-br from-brand-professional to-blue-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={18} className="text-yellow-300" />
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Destaque do Dia</span>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="text-5xl">{dailyHighlight.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-xl lg:text-2xl font-bold mb-2">{dailyHighlight.title}</h3>
                                <p className="text-blue-100 leading-relaxed max-w-2xl">{dailyHighlight.summary}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-xs text-blue-200 flex items-center gap-1"><Clock size={12} /> {dailyHighlight.readTimeMin} min de leitura</span>
                                    <span className="text-xs text-blue-200">{dailyHighlight.source}</span>
                                </div>
                            </div>
                            <a href={dailyHighlight.url} target="_blank" rel="noopener noreferrer" className="shrink-0 px-5 py-2.5 bg-white text-brand-professional font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-md">
                                Saber Mais <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </section>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Wind className="text-brand-secondary" size={20} /> Respiracao guiada</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setBreathingMode('478')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${breathingMode === '478' ? 'bg-brand-professional text-white' : 'bg-slate-100 text-slate-600'}`}>4-7-8</button>
                            <button onClick={() => setBreathingMode('box')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${breathingMode === 'box' ? 'bg-brand-professional text-white' : 'bg-slate-100 text-slate-600'}`}>Box</button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 py-10 text-center">
                        <div className={`h-32 w-32 rounded-full border-8 border-brand-secondary/20 flex items-center justify-center transition-all duration-1000 ${isBreathing ? 'scale-110 bg-brand-secondary/10' : 'bg-white'}`}>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{breathingLabel}</p>
                                <p className="text-4xl font-black text-slate-900">{breathingCounter}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-slate-600 max-w-sm">Use este ritmo para reduzir tensao e retomar o foco antes ou depois das atividades do dia.</p>
                        <button onClick={() => {
                            setIsBreathing((current) => !current);
                            setBreathingStep('inspire');
                            setBreathingCounter(4);
                        }} className="mt-5 px-4 py-2.5 rounded-xl bg-brand-professional text-white font-bold hover:bg-brand-professional-dark transition-colors">
                            {isBreathing ? 'Pausar exercicio' : 'Iniciar exercicio'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><Sparkles className="text-brand-accent" size={20} /> Exercicio da semana</h3>
                    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">Desafio em destaque</p>
                        <h4 className="text-xl font-bold text-slate-900">{exerciseOfTheWeek.title}</h4>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{exerciseOfTheWeek.description}</p>
                        <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-700 border border-orange-100">+{exerciseOfTheWeek.xpReward} XP de autocuidado</div>
                    </div>
                    <div className="mt-5">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Como estou hoje?</p>
                        <MoodTracker />
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Activity className="text-green-400" size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold">Saude Conectada</h3>
                                <p className="text-slate-500 text-sm">Sincronizacao com Google Fit</p>
                            </div>
                        </div>
                        <button onClick={() => setIsFitConnected(!isFitConnected)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isFitConnected ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                            {isFitConnected ? 'Conectado' : 'Conectar'}
                        </button>
                    </div>

                    {isFitConnected ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-2 mb-4"><Moon size={16} className="text-purple-400" /><h4 className="font-bold text-sm">Qualidade do Sono (7 dias)</h4></div>
                                <div className="h-40"><ResponsiveContainer width="100%" height="100%"><LineChart data={sleepData}><XAxis dataKey="date" hide /><YAxis hide domain={[0, 12]} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} /><Line type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} /></LineChart></ResponsiveContainer></div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-2 mb-4"><Heart size={16} className="text-red-400" /><h4 className="font-bold text-sm">Atividade Fisica (Passos)</h4></div>
                                <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={activityData}><XAxis dataKey="date" hide /><YAxis hide /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} /><Bar dataKey="steps" fill="#ef4444" radius={[4, 4, 4, 4]} /></BarChart></ResponsiveContainer></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10 border-dashed">
                            <p className="text-slate-300 text-sm">Conecte sua conta para visualizar seus dados de saude.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><PlayCircle className="text-red-500" size={20} /> Videos de meditacao guiada</h3>
                    {dailyVideo && <button onClick={() => setSelectedVideoId(dailyVideo.id)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors">Abrir video do dia</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {videos.map((video) => (
                        <button key={video.id} onClick={() => setSelectedVideoId(video.videoId)} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all text-left">
                            <img src={video.thumbnail} alt={video.title} className="h-40 w-full object-cover" />
                            <div className="p-4">
                                <p className="font-bold text-slate-800 line-clamp-2">{video.title}</p>
                                <p className="text-xs text-slate-500 mt-2">Duracao: {video.duration}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BookOpen className="text-brand-professional" size={20} /> Biblioteca de Bem-Estar</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setSelectedCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedCategory === '' ? 'bg-brand-professional text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos</button>
                        {Object.entries(WELLBEING_CATEGORIES).map(([key, cat]) => (
                            <button key={key} onClick={() => setSelectedCategory(key === selectedCategory ? '' : key)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedCategory === key ? `${cat.bg} ${cat.color}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat.label}</button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => {
                        const cat = WELLBEING_CATEGORIES[article.category];
                        return (
                            <article key={article.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col group">
                                <div className={`${cat.bg} p-6 flex items-center gap-4 border-b border-slate-50`}>
                                    <span className="text-4xl">{article.icon}</span>
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.color}`}>{cat.label}</span>
                                        <h4 className="font-bold text-slate-900 text-sm leading-snug mt-0.5 group-hover:text-brand-professional transition-colors">{article.title}</h4>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-grow">{article.summary}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="text-xs text-slate-500 flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {article.readTimeMin} min</span>
                                            <span className="truncate max-w-[140px]">{article.source}</span>
                                        </div>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-brand-professional font-bold text-xs flex items-center gap-1 hover:underline shrink-0">Ler <ExternalLink size={12} /></a>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {materials.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h4 className="text-base font-bold text-slate-800 mb-4">Recursos recomendados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {materials.slice(0, 6).map((material) => (
                                <a key={material.id} href={material.url || '#'} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:bg-white hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{material.type}</p>
                                    <p className="mt-1 font-bold text-slate-800">{material.title}</p>
                                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{material.description}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {articles.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <Filter className="mx-auto text-slate-300 mb-2" size={28} />
                        <p className="text-slate-500 font-medium">Nenhum conteúdo encontrado para esta categoria.</p>
                        <button onClick={() => setSelectedCategory('')} className="text-sm text-brand-professional font-bold mt-2 hover:underline">Ver todos</button>
                    </div>
                )}
            </section>

            {selectedVideoId && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="wellbeing-video-title" className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h4 id="wellbeing-video-title" className="font-bold text-slate-900">Meditacao guiada</h4>
                            <button onClick={() => setSelectedVideoId(null)} aria-label="Fechar video" className="p-2 rounded-full hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-500" /></button>
                        </div>
                        <div className="aspect-video bg-black">
                            <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${selectedVideoId}`} title="Video de meditacao" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WellbeingCenter;
