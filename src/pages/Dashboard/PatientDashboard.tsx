import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
    const { user } = useAuth();
    const { groups } = useData();
    const navigate = useNavigate();

    // Filter groups where the patient is a participant
    const myGroups = groups.filter(g => g.participants?.includes(user?.id || ''));

    // Calculate attendance (mock logic for now, can be expanded with real data)
    const getAttendanceStatus = (groupId: string) => {
        // In a real app, this would calculate based on past appointments and attendance records
        // For demo purposes, we'll randomize or use a fixed value if available
        const attendanceRate = 85; // Mock 85% attendance

        if (attendanceRate >= 75) return { color: 'bg-green-500', text: 'text-green-600', label: 'Presença Excelente', rate: attendanceRate };
        if (attendanceRate >= 70) return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Atenção à Frequência', rate: attendanceRate };
        return { color: 'bg-red-500', text: 'text-red-600', label: 'Risco de Desligamento', rate: attendanceRate };
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#6C4FFE] to-[#8B5CF6] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Olá, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-blue-100 text-lg max-w-xl">
                        Sua jornada de cuidado continua. Você tem <span className="font-bold bg-white/20 px-2 py-0.5 rounded-lg">{myGroups.length} grupos</span> ativos.
                    </p>
                </div>
            </div>

            {/* My Groups Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-[#6C4FFE]" />
                    Meus Grupos Ativos
                </h2>

                {myGroups.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Nenhum grupo ativo</h3>
                        <p className="text-slate-500">Você ainda não está participando de nenhum grupo terapêutico.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myGroups.map(group => {
                            const status = getAttendanceStatus(group.id);
                            return (
                                <div
                                    key={group.id}
                                    onClick={() => navigate(`/groups/${group.id}`)}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    {/* Status Strip */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.color}`}></div>

                                    <div className="flex justify-between items-start mb-4 pl-2">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                {group.protocol || 'Geral'}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#6C4FFE] transition-colors">
                                                {group.name}
                                            </h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {group.status === 'active' ? 'Em Andamento' : 'Aguardando'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 pl-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar size={16} className="text-[#6C4FFE]" />
                                            <span>{group.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin size={16} className="text-[#6C4FFE]" />
                                            <span>{group.room}</span>
                                        </div>
                                    </div>

                                    {/* Smart Attendance Bar */}
                                    <div className="pl-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-slate-500">Frequência</span>
                                            <span className={`text-xs font-bold ${status.text}`}>{status.rate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${status.color}`}
                                                style={{ width: `${status.rate}%` }}
                                            ></div>
                                        </div>
                                        <p className={`text-[10px] mt-1 font-medium ${status.text}`}>
                                            {status.label}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                                        <button className="text-sm font-bold text-[#6C4FFE] flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Ver Detalhes <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
