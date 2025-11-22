import React, { useState, useEffect } from 'react';
import { FileText, Video, Heart, ExternalLink, Download } from 'lucide-react';
import { newsService, NewsItem } from '../../services/integrations/newsService';
import { contentService, Video as VideoType, Material } from '../../services/integrations/contentService';
import { useAuth } from '../../contexts/AuthContext';

const Resources: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'news' | 'wellness' | 'materials'>('news');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);

    useEffect(() => {
        const audience = user?.role === 'professional' ? 'professional' : 'patient';
        newsService.getNews(audience).then(setNews);
        contentService.getVideos().then(setVideos);
        contentService.getMaterials().then(setMaterials);
    }, [user]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recursos & Bem-estar</h2>
                    <p className="text-slate-500 mt-1">Biblioteca de conteúdos para sua saúde.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'news' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Notícias
                </button>
                <button
                    onClick={() => setActiveTab('wellness')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'wellness' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Bem-estar
                </button>
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'materials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Materiais do Grupo
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'news' && news.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.source}</span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2 mb-3">{item.title}</h3>
                            <p className="text-slate-600 text-sm mb-4">{item.summary}</p>
                            <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                Ler mais <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {activeTab === 'wellness' && videos.map(video => (
                    <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="aspect-video bg-slate-900">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${video.videoId}`}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900">{video.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">Duração: {video.duration}</p>
                        </div>
                    </div>
                ))}

                {activeTab === 'materials' && materials.map(material => (
                    <div key={material.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{material.title}</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-3">Material de apoio oficial.</p>
                            <a href={material.url} className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline">
                                <Download size={16} /> Baixar PDF
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Resources;
