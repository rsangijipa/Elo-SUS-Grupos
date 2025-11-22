import React, { useState } from 'react';
import { FileText, Video, Heart, ExternalLink, Download } from 'lucide-react';

const Resources: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'news' | 'wellness' | 'materials'>('news');

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
                {activeTab === 'news' && (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" alt="News" className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Saúde Pública</span>
                                <h3 className="text-lg font-bold text-slate-900 mt-2 mb-3">Campanha de Vacinação 2025</h3>
                                <p className="text-slate-600 text-sm mb-4">Confira as datas e locais para a campanha de multivacinação deste ano.</p>
                                <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                    Ler mais <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80" alt="News" className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Bem-estar</span>
                                <h3 className="text-lg font-bold text-slate-900 mt-2 mb-3">Benefícios da Meditação</h3>
                                <p className="text-slate-600 text-sm mb-4">Estudos mostram como 10 minutos diários podem reduzir a ansiedade.</p>
                                <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                    Ler mais <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'wellness' && (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="aspect-video bg-slate-900">
                                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/inpok4MKVLM" title="Meditação" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900">Meditação Guiada: 5 Minutos</h3>
                                <p className="text-sm text-slate-500 mt-1">Relaxe e reconecte-se.</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="aspect-video bg-slate-900">
                                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/1f8yoFFdkcY" title="Respiração" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900">Técnica de Respiração 4-7-8</h3>
                                <p className="text-sm text-slate-500 mt-1">Para momentos de ansiedade.</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'materials' && (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">Guia do Participante.pdf</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-3">Regras e cronograma do grupo.</p>
                                <button className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline">
                                    <Download size={16} /> Baixar PDF
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">Diário de Emoções.pdf</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-3">Template para registro diário.</p>
                                <button className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline">
                                    <Download size={16} /> Baixar PDF
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Resources;
