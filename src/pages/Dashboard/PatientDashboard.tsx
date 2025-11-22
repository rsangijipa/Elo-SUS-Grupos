import React from 'react';
import { Calendar, Video, FileText, MapPin, Clock, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { calendarService } from '../../services/integrations/calendarService';
import { locationService } from '../../services/integrations/locationService';
import { contentService } from '../../services/integrations/contentService';

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

    // Integration with Services
    const handleAddToCalendar = () => {
        calendarService.addToCalendar({
            title: nextAppointment.type,
            start: nextAppointment.date,
            end: new Date(nextAppointment.date.getTime() + 1000 * 60 * 60), // 1 hour duration
            location: nextAppointment.location,
            details: `Facilitador: ${nextAppointment.professional}`
        });
    };

    const handleOpenRoute = () => {
        locationService.openRoute(nextAppointment.location);
    };

    const [video, setVideo] = React.useState<any>(null);

    React.useEffect(() => {
        contentService.getVideos().then(videos => {
            if (videos.length > 0) setVideo(videos[0]);
        });
    }, []);

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

                    {/* Journey Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MapPin size={20} className="text-blue-600" /> Sua Jornada
                            </h3>
                            <p className="text-slate-500 text-sm">Você está no encontro 3 de 8 do Grupo de Tabagismo.</p>
                        </div>

                        <div className="p-6">
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                                {/* Past Session */}
                                <div className="relative pl-8 opacity-60">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                                    <h4 className="font-bold text-slate-700">Encontro 1: Introdução</h4>
                                    <p className="text-sm text-slate-500">Concluído em 01/11</p>
                                </div>

                                {/* Past Session */}
                                <div className="relative pl-8 opacity-60">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                                    <h4 className="font-bold text-slate-700">Encontro 2: Gatilhos</h4>
                                    <p className="text-sm text-slate-500">Concluído em 08/11</p>
                                </div>

                                {/* Current Session (Active) */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm animate-pulse"></div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-blue-900">Encontro 3: Estratégias</h4>
                                            <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">Atual</span>
                                        </div>
                                        <p className="text-sm text-blue-700 mb-3">
                                            <Calendar size={14} className="inline mr-1" /> 15/11 às 14:00
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddToCalendar}
                                                className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <Calendar size={16} />
                                                Adicionar à Agenda
                                            </button>
                                            <button
                                                onClick={handleOpenRoute}
                                                className="px-3 py-2 bg-white text-slate-600 text-sm font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                            >
                                                <MapPin size={16} />
                                                Ver Rota
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Future Session */}
                                <div className="relative pl-8 opacity-40">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                                    <h4 className="font-bold text-slate-700">Encontro 4: Manutenção</h4>
                                    <p className="text-sm text-slate-500">Agendado para 22/11</p>
                                </div>
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
                            {video ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${video.videoId}`}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <p>Carregando vídeo...</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-purple-50">
                            <p className="text-sm text-purple-800 font-medium">
                                {video ? video.title : 'Conteúdo selecionado para o seu grupo.'}
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
