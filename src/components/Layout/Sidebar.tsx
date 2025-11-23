import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut,
    Stethoscope,
    Settings,
    RefreshCw,
    MessageCircle,
    Heart,
    Activity,
    LifeBuoy
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, toggleRole } = useAuth();

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
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all shadow-sm">
            {/* Brand Header */}
            <div className="h-24 flex items-center gap-3 px-6 border-b border-slate-100 bg-gradient-to-r from-[#F6F8FE] to-white">
                <img src="/elosusgrupos_logo.png" alt="EloSUS" className="h-10 w-auto" />
                <div className="flex flex-col">
                    <span className="font-bold text-[#0054A6] text-lg leading-tight">EloSUS</span>
                    <span className="text-[10px] font-bold text-[#6C4FFE] tracking-wider uppercase">Grupos</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-gradient-to-r from-[#0054A6]/10 to-[#6C4FFE]/5 text-[#0054A6] shadow-sm'
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
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive('/support')
                            ? 'bg-gradient-to-r from-[#0054A6]/10 to-[#6C4FFE]/5 text-[#0054A6] shadow-sm'
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
                {/* Dev Tool: Role Toggle */}
                <button
                    onClick={toggleRole}
                    className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-bold text-[#6C4FFE] bg-white hover:bg-[#6C4FFE]/5 py-2.5 rounded-xl border border-[#6C4FFE]/20 transition-colors shadow-sm"
                    title="Alternar entre visão de Profissional e Paciente (Dev Mode)"
                >
                    <RefreshCw size={12} />
                    Trocar Visão ({user?.role === 'professional' ? 'Pro' : 'Paciente'})
                </button>

                <Link to="/profile" className="block">
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
    );
}
