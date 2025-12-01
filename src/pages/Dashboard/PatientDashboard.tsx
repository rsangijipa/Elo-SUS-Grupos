import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, ArrowRight, CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { referralService, Referral } from '../../services/referralService';
import { tobaccoService } from '../../services/tobaccoService';
import { toast } from 'react-hot-toast';

export default function PatientDashboard() {
    const { user } = useAuth();
    const { groups } = useData();
    const navigate = useNavigate();
    const [invites, setInvites] = useState<Referral[]>([]);
    const [checkingAnamnesis, setCheckingAnamnesis] = useState(false);

    useEffect(() => {
        loadInvites();
    }, [user]);

    const loadInvites = async () => {
        if (!user) return;
        const allReferrals = await referralService.getAll();

        // Filter by user.id
        const myInvites = allReferrals.filter(r => r.status === 'convidado' && (r.patientId === user.id || r.patientId === 'new'));
        setInvites(myInvites);
    };

    const handleAcceptClick = async (invite: Referral) => {
        if (!user) return;

        setCheckingAnamnesis(true);
        try {
            // 1. Check if user has anamnesis
            const hasAnamnesis = await tobaccoService.checkAnamnesis(user.id);

            if (hasAnamnesis) {
                // 2. If yes, accept invite directly
                await referralService.acceptInvite(invite.id, user.name, user.id);
                toast.success('Você foi adicionado ao grupo com sucesso!');
                loadInvites();
                navigate(0); // Refresh to show new group
            } else {
                // 3. If no, redirect to Anamnesis page
                navigate(`/anamnese?pendingInvite=${invite.id}`);
            }
        } catch (error) {
            console.error('Error checking anamnesis:', error);
            toast.error('Erro ao verificar requisitos. Tente novamente.');
        } finally {
            setCheckingAnamnesis(false);
        }
    };

    // Filter groups where the patient is a participant
    const myGroups = groups.filter(g => g.participants?.includes(user?.id || ''));

    // Calculate attendance (mock logic for now)
    const getAttendanceStatus = (groupId: string) => {
        const attendanceRate = 85;
        if (attendanceRate >= 75) return { color: 'bg-green-500', text: 'text-green-600', label: 'Presença Excelente', rate: attendanceRate };
        if (attendanceRate >= 70) return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Atenção à Frequência', rate: attendanceRate };
        return { color: 'bg-red-500', text: 'text-red-600', label: 'Risco de Desligamento', rate: attendanceRate };
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#6C4FFE] to-[#8B5CF6] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                        {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-blue-100 text-lg max-w-xl">
                        Hoje é um ótimo dia para cuidar de você. <span className="font-bold bg-white/20 px-2 py-0.5 rounded-lg">{myGroups.length} grupos</span> ativos.
                    </p>
                </div>
            </div>

            {/* Next Appointment Card */}
            {myGroups.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#6C4FFE]"></div>
                    <div className="p-4 bg-purple-50 rounded-full text-[#6C4FFE]">
                        <Calendar size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">Próximo Encontro</h3>
                        <p className="text-slate-500">Sua jornada continua em breve.</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-1">
                        <div className="text-2xl font-bold text-[#6C4FFE]">Quarta-feira, 14:00</div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={16} />
                            Sala 04 - UBS Centro
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/schedule')}
                        className="px-6 py-2 bg-[#6C4FFE] text-white font-bold rounded-xl hover:bg-[#5b41d9] transition-colors shadow-lg shadow-purple-200"
                    >
                        Ver Detalhes
                    </button>
                </div>
            )}

            {/* Pending Invites Section */}
            {invites.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Mail className="text-orange-500" />
                        Convites Pendentes
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{invites.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {invites.map(invite => {
                            // Find group details if available
                            const group = groups.find(g => g.id === invite.groupId);
                            return (
                                <div key={invite.id} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                                Novo Convite
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-800 mt-2">
                                                {group?.name || 'Grupo Terapêutico'}
                                            </h3>
                                            <p className="text-sm text-slate-500">Encaminhado por {invite.referringProfessionalName || 'Profissional'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                                        <div className="flex items-center gap-3 text-sm text-slate-700">
                                            <Calendar size={18} className="text-slate-400" />
                                            <span className="font-medium">{group?.schedule || 'Horário a definir'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-700">
                                            <MapPin size={18} className="text-slate-400" />
                                            <span className="font-medium">{group?.room || 'Local a definir'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-700">
                                            <AlertCircle size={18} className="text-slate-400" />
                                            <span className="font-medium">Comparecer semanalmente por 4 encontros</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAcceptClick(invite)}
                                            disabled={checkingAnamnesis}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {checkingAnamnesis ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Verificando...
                                                </>
                                            ) : (
                                                'Quero participar'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => navigate('/support')}
                                            className="px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            Tenho dúvidas
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Groups Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-[#6C4FFE]" />
                    Meus Grupos Ativos
                </h2>

                {myGroups.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
                            <Calendar size={48} className="relative z-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum grupo ativo no momento</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Você ainda não está participando de nenhum grupo terapêutico. Aguarde o convite do seu profissional de saúde ou entre em contato com a unidade.
                        </p>
                        <button
                            onClick={() => navigate('/support')}
                            className="px-6 py-2 text-[#6C4FFE] font-bold hover:bg-purple-50 rounded-xl transition-colors"
                        >
                            Entrar em contato com a unidade
                        </button>
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
