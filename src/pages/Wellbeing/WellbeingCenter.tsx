import React, { useState, useEffect } from 'react';
import { Activity, Heart, Moon, ExternalLink, RefreshCw } from 'lucide-react';
import { healthService, SleepData, ActivityData } from '../../services/integrations/healthService';
import { newsService, NewsItem } from '../../services/integrations/newsService';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const WellbeingCenter: React.FC = () => {
    const { user } = useAuth();
    const [sleepData, setSleepData] = useState<SleepData[]>([]);
    const [activityData, setActivityData] = useState<ActivityData[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [page, setPage] = useState(1);
    const [loadingNews, setLoadingNews] = useState(false);
    const [isFitConnected, setIsFitConnected] = useState(false);

    useEffect(() => {
        if (isFitConnected) {
            healthService.getSleepData().then(setSleepData);
            healthService.getSteps().then(setActivityData);
        }
    }, [isFitConnected]);

    useEffect(() => {
        loadNews();
    }, [user]);

    const loadNews = () => {
        setLoadingNews(true);
        const audience = user?.role === 'professional' ? 'professional' : 'patient';

        // Simulate network delay and shuffle
        setTimeout(() => {
            newsService.getNews(audience, page).then(newItems => {
                // Shuffle to simulate fresh content
                const shuffled = [...newItems].sort(() => Math.random() - 0.5);
                setNews(prev => page === 1 ? shuffled : [...prev, ...shuffled]);
                setPage(prev => prev + 1);
                setLoadingNews(false);
            });
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Central de Bem-Estar</h2>
                <p className="text-slate-500 mt-1">Monitore sua saúde e mantenha-se informado.</p>
            </div>

            {/* Section 1: Saúde Conectada (Google Fit) */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Activity className="text-green-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Saúde Conectada</h3>
                                <p className="text-slate-400 text-sm">Sincronização com Google Fit</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsFitConnected(!isFitConnected)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isFitConnected
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-white text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            {isFitConnected ? 'Conectado' : 'Conectar'}
                        </button>
                    </div>

                    {isFitConnected ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sleep Chart */}
                            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Moon size={16} className="text-purple-400" />
                                    <h4 className="font-bold text-sm">Qualidade do Sono (7 dias)</h4>
                                </div>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sleepData}>
                                            <XAxis dataKey="date" hide />
                                            <YAxis hide domain={[0, 12]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Steps Chart */}
                            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart size={16} className="text-red-400" />
                                    <h4 className="font-bold text-sm">Atividade Física (Passos)</h4>
                                </div>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={activityData}>
                                            <XAxis dataKey="date" hide />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="steps" fill="#ef4444" radius={[4, 4, 4, 4]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10 border-dashed">
                            <p className="text-slate-300 text-sm">Conecte sua conta para visualizar seus dados de saúde.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 2: Feed de Notícias */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw className="text-blue-600" size={20} />
                        Feed de Notícias
                    </h3>
                    <button
                        onClick={() => {
                            setNews([]);
                            setPage(1);
                            loadNews();
                        }}
                        disabled={loadingNews}
                        className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                        <RefreshCw size={14} className={loadingNews ? 'animate-spin' : ''} />
                        Atualizar Feed
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{item.source}</span>
                                    <span className="text-xs text-slate-400">{item.date}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{item.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow">{item.summary}</p>
                                <a href={item.url} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline mt-auto">
                                    Ler mais <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={loadNews}
                        disabled={loadingNews}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {loadingNews ? 'Carregando...' : 'Carregar Mais Notícias'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default WellbeingCenter;
