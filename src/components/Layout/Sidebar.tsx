import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RoleGuard from '../Auth/RoleGuard';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut,
    Stethoscope,
    Settings,
    RefreshCw,
    Heart,
    Activity,
    LifeBuoy,
    UserPlus,
    User
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, switchDevRole } = useAuth();

    const professionalItems = [
        { path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { path: '/groups', label: 'Meus Grupos', icon: Users },
        { path: '/patients', label: 'Pacientes', icon: Stethoscope },
        { path: '/schedule', label: 'Agenda', icon: Calendar },
        { path: '/reports', label: 'Relatórios', icon: FileText },
    ];

    const patientItems = [
        { path: '/dashboard', label: 'Início', icon: LayoutDashboard },
        { path: '/wellbeing', label: 'Bem-Estar', icon: Heart },
        { path: '/reports', label: 'Meu Progresso', icon: Activity },
        { path: '/materials', label: 'Meus Documentos', icon: FileText },
        { path: '/schedule', label: 'Minha Agenda', icon: Calendar },
    ];

    const menuItems = user?.role === 'patient' ? patientItems : professionalItems;

    const isActive = (path: string) => location.pathname.startsWith(path);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside className={`
                w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-xl md:shadow-sm
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Brand Header */}
                <div className="h-24 flex items-center gap-3 px-6 border-b border-slate-100 bg-gradient-to-r from-[#F6F8FE] to-white">
                    <img src="/elosusgrupos_logo.png" alt="EloSUS" className="h-10 w-auto" />
                    <div className="flex flex-col">
                        <span className="font-bold text-[#0054A6] text-lg leading-tight">EloSUS</span>
                        <span className="text-[10px] font-bold text-[#6C4FFE] tracking-wider uppercase">Grupos</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden ml-auto text-slate-400 hover:text-slate-600">
                        <LogOut size={20} className="rotate-180" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-gradient-to-r from-[#0054A6]/10 to-[#6C4FFE]/5 text-[#0054A6] shadow-sm font-bold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-[#0054A6]'
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={isActive(item.path) ? 'text-[#0054A6]' : 'text-slate-400 group-hover:text-[#0054A6] transition-colors'}
                            />
                            {item.label}
                        </Link>
                    ))}

                    {/* Support Link (Bottom of Nav) */}
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <Link
                            to="/support"
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive('/support')
                                ? 'bg-gradient-to-r from-[#0054A6]/10 to-[#6C4FFE]/5 text-[#0054A6] shadow-sm font-bold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-[#0054A6]'
                                }`}
                        >
                            <LifeBuoy
                                size={20}
                                className={isActive('/support') ? 'text-[#0054A6]' : 'text-slate-400 group-hover:text-[#0054A6] transition-colors'}
                            />
                            Central de Ajuda
                        </Link>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-100 bg-[#F6F8FE]/50">
                    {/* Dev Tool: Role Switcher */}
                    <div className="mb-4 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Modo de Teste</p>
                        <div className="grid grid-cols-3 gap-1">
                            <button
                                onClick={() => switchDevRole('referrer')}
                                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${user?.id === 'doc_ref_01'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                title="Médico/Enfermeiro (Encaminhar)"
                            >
                                <UserPlus size={14} />
                                <span className="text-[9px] font-bold">Encaminhar</span>
                            </button>
                            <button
                                onClick={() => switchDevRole('executor')}
                                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${user?.id === 'psi_exec_01' || (user?.role === 'professional' && user?.id !== 'doc_ref_01')
                                    ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                title="Terapeuta (Atender)"
                            >
                                <Stethoscope size={14} />
                                <span className="text-[9px] font-bold">Atender</span>
                            </button>
                            <button
                                onClick={() => switchDevRole('patient')}
                                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${user?.role === 'patient'
                                    ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-sm'
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                title="Paciente"
                            >
                                <User size={14} />
                                <span className="text-[9px] font-bold">Paciente</span>
                            </button>
                        </div>
                    </div>

                    <Link to="/profile" className="block" onClick={() => window.innerWidth < 768 && onClose()}>
                        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 mb-3 cursor-pointer hover:shadow-md transition-all border border-slate-100 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ${user?.role === 'patient' ? 'bg-[#6C4FFE] text-white' : 'bg-[#0054A6] text-white'
                                }`}>
                                {user?.avatar || 'US'}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#0054A6] transition-colors">{user?.name || 'Usuário'}</p>
                                <p className="text-[10px] text-slate-500 truncate font-medium">
                                    {user?.role === 'professional'
                                        ? (user.crp ? `CRP ${user.crp}` : 'Psicólogo(a)')
                                        : (user?.nextAppointment ? `Próx: ${new Date(user.nextAppointment).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'Paciente')
                                    }
                                </p>
                            </div>
                            <Settings size={16} className="text-slate-300 group-hover:text-[#0054A6] transition-colors" />
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm transition-colors font-medium"
                    >
                        <LogOut size={16} />
                        Sair do Sistema
                    </button>
                </div>
            </aside>
        </>
    );
}
