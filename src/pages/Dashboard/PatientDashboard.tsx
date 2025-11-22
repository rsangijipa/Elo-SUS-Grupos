import React from 'react';
import { Calendar, Video, FileText, MapPin, Clock, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard: React.FC = () => {
    const { user } = useAuth();
    const [mood, setMood] = React.useState<string | null>(null);

    // Mock Data for Patient View
    const nextAppointment = {
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        type: 'Grupo de Tabagismo',
        professional: 'Dr. João Silva',
        location: 'Sala 104 - UBS Central'
    };

    const materials = [
        { id: 1, title: 'Guia de Respiração.pdf', type: 'pdf', url: '#' },
        { id: 2, title: 'Diário de Emoções.pdf', type: 'pdf', url: '#' },
        { id: 3, title: 'Link: Meditação Guiada', type: 'link', url: '#' }
    ];

    // YouTube Video ID (could come from user profile in future)
    const videoId = (user as any)?.youtubePlaylistId || 'dQw4w9WgXcQ'; // Default fallback or specific ID

    const moods = [
        { emoji: '😔', label: 'Triste', color: 'bg-blue-100 hover:bg-blue-200' },
        { emoji: '😰', label: 'Ansioso', color: 'bg-purple-100 hover:bg-purple-200' },
        { emoji: '😐', label: 'Neutro', color: 'bg-slate-100 hover:bg-slate-200' },
        { emoji: '🙂', label: 'Bem', color: 'bg-green-100 hover:bg-green-200' },
        { emoji: '🤩', label: 'Ótimo', color: 'bg-yellow-100 hover:bg-yellow-200' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Olá, {user?.name?.split(' ')[0]}</h2>
                <p className="text-slate-500 mt-1">Bem-vindo ao seu espaço de cuidado.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Appointment & Actions */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Mood Tracker Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Como você está se sentindo hoje?</h3>
                        <div className="flex justify-between gap-2">
                            {moods.map((m) => (
                                <button
                                    key={m.label}
                                    onClick={() => setMood(m.label)}
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${mood === m.label
                                            ? 'ring-2 ring-blue-500 transform scale-105 ' + m.color.replace('hover:', '')
                                            : m.color
                                        }`}
                                >
                                    <span className="text-3xl">{m.emoji}</span>
                                    <span className="text-xs font-bold text-slate-600">{m.label}</span>
                                </button>
                            ))}
                        </div>
                        {mood && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg text-center animate-fade-in">
                                Obrigado por compartilhar! Isso ajuda seu terapeuta a preparar o encontro.
                            </div>
                        )}
                    </div>

                    {/* Next Appointment Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar size={20} className="text-blue-600" /> Seu Próximo Encontro
                                </h3>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">
                                    Confirmado
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="bg-blue-50 rounded-xl p-4 text-center min-w-[100px]">
                                    <span className="block text-sm font-bold text-blue-400 uppercase">NOV</span>
                                    <span className="block text-3xl font-bold text-slate-800">{nextAppointment.date.getDate()}</span>
                                    <span className="block text-sm font-medium text-slate-500">Segunda</span>
                                </div>

                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h4 className="text-xl font-bold text-slate-900">{nextAppointment.type}</h4>
                                    <p className="text-slate-600 flex items-center justify-center md:justify-start gap-2">
                                        <MapPin size={16} /> {nextAppointment.location}
                                    </p>
                                    <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 text-sm">
                                        <Clock size={16} /> 14:00 - 16:00
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors">
                                    <CheckCircle size={18} /> Confirmar Presença
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors">
                                    <XCircle size={18} /> Não poderei ir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Psychoeducation / Video Widget */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Video size={20} className="text-purple-600" /> Conteúdo da Semana
                            </h3>
                        </div>
                        <div className="aspect-video w-full bg-slate-900">
                            {videoId ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <p>Nenhum vídeo recomendado esta semana.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-purple-50">
                            <p className="text-sm text-purple-800 font-medium">
                                Assista a este vídeo sobre técnicas de respiração para o nosso próximo encontro.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Right Column: Resources */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <FileText size={20} className="text-amber-500" /> Materiais de Apoio
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {materials.map(item => (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    className="block p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-slate-400 uppercase font-bold mt-0.5">{item.type}</p>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-400" />
                                    </div>
                                </a>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-sm font-bold text-blue-600 hover:underline">
                                Ver biblioteca completa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
