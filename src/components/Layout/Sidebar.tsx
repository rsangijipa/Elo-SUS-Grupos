import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut,
    ShieldPlus,
    Stethoscope,
    Settings,
    RefreshCw
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
        { path: '/schedule', label: 'Minha Agenda', icon: Calendar },
        { path: '/materials', label: 'Materiais', icon: FileText },
    ];

    const menuItems = user?.role === 'patient' ? patientItems : professionalItems;

    const isActive = (path: string) => location.pathname.startsWith(path);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all">
            {/* Brand Header */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 text-white flex-shrink-0">
                    <ShieldPlus size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-lg leading-tight">EloSUS</span>
                    <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">Grupos</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <item.icon
                            size={20}
                            className={isActive(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                        />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100">
                {/* Dev Tool: Role Toggle */}
                <button
                    onClick={toggleRole}
                    className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 py-2 rounded-lg border border-purple-100 transition-colors"
                    title="Alternar entre visão de Profissional e Paciente (Dev Mode)"
                >
                    <RefreshCw size={12} />
                    Trocar Visão ({user?.role === 'professional' ? 'Pro' : 'Paciente'})
                </button>

                <Link to="/profile" className="block">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3 cursor-pointer hover:bg-slate-100 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border-2 border-white shadow-sm">
                            {user?.avatar || 'US'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-slate-700 truncate">{user?.name || 'Usuário'}</p>
                            <p className="text-[10px] text-slate-500 truncate font-medium">
                                {user?.role === 'professional'
                                    ? (user.crp ? `CRP ${user.crp}` : 'Psicólogo(a)')
                                    : (user?.nextAppointment ? `Próx: ${new Date(user.nextAppointment).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'Paciente')
                                }
                            </p>
                        </div>
                        <Settings size={14} className="text-slate-300 group-hover:text-slate-500" />
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 py-2.5 rounded-lg text-sm transition-colors font-medium"
                >
                    <LogOut size={16} />
                    Sair do Sistema
                </button>
            </div>
        </aside>
    );
}
