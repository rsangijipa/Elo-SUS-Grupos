import React, { useState, useEffect } from 'react';
import { FileText, Video, Heart, ExternalLink, Download, Share, Activity, FileCheck, FilePlus } from 'lucide-react';
import { newsService, NewsItem } from '../../services/integrations/newsService';
import { contentService, Video as VideoType, Material, ClinicalDocument } from '../../services/integrations/contentService';
import { useAuth } from '../../contexts/AuthContext';

const Resources: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'documents' | 'wellness'>('documents');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
    const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);

    useEffect(() => {
        const audience = user?.role === 'professional' ? 'professional' : 'patient';
        newsService.getNews(audience).then(setNews);
        contentService.getVideos().then(setVideos);
        contentService.getMaterials().then(setMaterials);
        contentService.getClinicalDocuments().then(setDocuments);
    }, [user]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recursos & Bem-estar</h2>
                    <p className="text-slate-500 mt-1">Central de documentos e promoção de saúde.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText size={18} />
                    Meus Documentos
                </button>
                <button
                    onClick={() => setActiveTab('wellness')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'wellness' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Heart size={18} />
                    Central de Saúde & Bem-estar
                </button>
            </div>

            {/* Module A: Meus Documentos */}
            {activeTab === 'documents' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Clinical Documents Section */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileCheck className="text-blue-600" size={20} />
                            Relatórios & Encaminhamentos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map(doc => (
                                <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${doc.type === 'encaminhamento' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {doc.type === 'encaminhamento' ? <Share size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900">{doc.title}</h4>
                                            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize">{doc.type}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {doc.doctorName} • {doc.specialty}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 mb-3">Emitido em: {new Date(doc.date).toLocaleDateString('pt-BR')}</p>
                                        <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                            <Download size={16} /> Baixar Documento
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Group Materials Section */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FilePlus className="text-green-600" size={20} />
                            Materiais do Grupo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {materials.map(material => (
                                <div key={material.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{material.title}</h4>
                                            <a href={material.url} className="text-xs font-bold text-green-600 mt-2 inline-flex items-center gap-1 hover:underline">
                                                <Download size={14} /> Download PDF
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Module B: Central de Saúde & Bem-estar */}
            {activeTab === 'wellness' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Integration Hub */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <Activity size={32} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Sincronizar Saúde</h3>
                                    <p className="text-slate-300 text-sm mt-1 max-w-md">
                                        Conecte com Google Fit ou Saúde Connect para compartilhar dados de sono e atividade física com seu terapeuta.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsGoogleFitConnected(!isGoogleFitConnected)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isGoogleFitConnected
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                        : 'bg-white text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                {isGoogleFitConnected ? (
                                    <>
                                        <Activity size={18} /> Conectado
                                    </>
                                ) : (
                                    'Conectar Agora'
                                )}
                            </button>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* News Feed */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-bold text-slate-800">Feed de Notícias</h3>
                            <div className="grid gap-6">
                                {news.map(item => (
                                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                        <img src={item.imageUrl} alt={item.title} className="w-full md:w-48 h-48 object-cover" />
                                        <div className="p-6 flex flex-col justify-center">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{item.source}</span>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.summary}</p>
                                            <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline self-start">
                                                Ler mais <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Videos */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800">Vídeos Recomendados</h3>
                            <div className="space-y-4">
                                {videos.map(video => (
                                    <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer">
                                        <div className="aspect-video bg-slate-900 relative">
                                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <Video size={20} className="text-slate-900 ml-1" />
                                                </div>
                                            </div>
                                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{video.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;
