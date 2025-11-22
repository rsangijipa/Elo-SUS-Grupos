import React from 'react';
import { Calendar, MapPin, Video, BookOpen, Clock, XCircle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_GROUPS } from '../../utils/seedData';

const PatientDashboard: React.FC = () => {
    const { user } = useAuth();

    // Safe check for patient data
    if (!user || user.role !== 'patient') return null;

    const nextAppointment = user.nextAppointment ? new Date(user.nextAppointment) : null;
    const group = MOCK_GROUPS.find(g => g.id === 'g1'); // Mock linking to a group

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Welcome Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Olá, {user.name.split(' ')[0]} 👋</h2>
                <p className="text-slate-500 mt-1">Bem-vindo(a) ao seu espaço de cuidado.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Next Appointment & Action */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero Card: Next Appointment */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-[#0054A6] p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3">
                                        Seu Próximo Encontro
                                    </span>
                                    <h3 className="text-2xl font-bold">{group?.name || 'Grupo Terapêutico'}</h3>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Calendar size={32} />
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-[#0054A6] rounded-lg">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Data</p>
                                        <p className="text-slate-900 font-medium">
                                            {nextAppointment?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-[#0054A6] rounded-lg">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Horário</p>
                                        <p className="text-slate-900 font-medium">
                                            {nextAppointment?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:col-span-2">
                                    <div className="p-2.5 bg-blue-50 text-[#0054A6] rounded-lg">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Local</p>
                                        <p className="text-slate-900 font-medium">{group?.room || 'Sala a definir'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                                    <CheckCircle size={20} />
                                    Confirmar Presença
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                                    <XCircle size={20} />
                                    Não poderei ir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Psychoeducation Widget (YouTube) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Video size={20} className="text-[#0054A6]" />
                            <h3 className="text-lg font-bold text-slate-900">Vídeo da Semana</h3>
                        </div>

                        {user.recommendedVideo ? (
                            <div className="space-y-3">
                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-md">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${user.recommendedVideo.videoId}`}
                                        title={user.recommendedVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <p className="text-sm font-medium text-slate-900">{user.recommendedVideo.title}</p>
                            </div>
                        ) : (
                            <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500">
                                Nenhum vídeo recomendado para esta semana.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Materials & Info */}
                <div className="space-y-6">
                    {/* Materials Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={20} className="text-[#0054A6]" />
                            <h3 className="text-lg font-bold text-slate-900">Materiais de Apoio</h3>
                        </div>

                        <div className="space-y-3">
                            {user.materials && user.materials.length > 0 ? (
                                user.materials.map(material => (
                                    <a
                                        key={material.id}
                                        href={material.url}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                                    >
                                        <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{material.title}</p>
                                            <p className="text-xs text-slate-500 uppercase">{material.type}</p>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">Nenhum material disponível.</p>
                            )}
                        </div>

                        <button className="w-full mt-4 py-2 text-sm text-[#0054A6] font-bold hover:bg-blue-50 rounded-lg transition-colors">
                            Ver todos os materiais
                        </button>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Contato de Emergência</h3>
                        {user.emergencyContact ? (
                            <div>
                                <p className="font-bold text-slate-900">{user.emergencyContact.name}</p>
                                <p className="text-sm text-slate-500 mb-1">{user.emergencyContact.relation}</p>
                                <p className="text-[#0054A6] font-bold">{user.emergencyContact.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Nenhum contato cadastrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
