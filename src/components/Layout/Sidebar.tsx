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
    Heart,
    Activity,
    LifeBuoy,
    Shield,
    User,
    Briefcase
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, switchDevRole } = useAuth();

    // Menu Configurations
    const professionalMenuItems = [
        { path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { path: '/patients', label: 'Pacientes', icon: Users },
        { path: '/groups', label: 'Grupos', icon: Calendar },
        { path: '/materials', label: 'Materiais', icon: FileText },
        // Admin link only if admin
        ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: Shield }] : [])
    ];

    const patientMenuItems = [
        { path: '/dashboard', label: 'Meu Espaço', icon: LayoutDashboard },
        { path: '/groups', label: 'Meu Grupo', icon: Heart }, // Mapping /my-group to /groups for now
        { path: '/materials', label: 'Materiais', icon: FileText },
        { path: '/reports', label: 'Minha Jornada', icon: Activity } // Mapping /progress to /reports
    ];

    // Select menu based on role
    const menuItems = user?.role === 'patient' ? patientMenuItems : professionalMenuItems;

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
                w-64 bg-white md:bg-gradient-to-b md:from-[#0054A6]/10 md:to-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-xl md:shadow-sm
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Brand Header */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-slate-100 bg-transparent">
                    <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/elosusgrupos_logo.png" alt="EloSUS" className="h-10 w-auto" />
                        <div className="flex flex-col">
                            <span className="font-bold text-brand-professional text-lg leading-tight">EloSUS</span>
                            <span className="text-[10px] font-bold text-brand-patient tracking-wider uppercase">Grupos</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-brand-professional/5 text-brand-professional shadow-sm font-bold'
                                : 'text-slate-500 hover:bg-white/50 hover:shadow-sm hover:text-brand-professional'
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={isActive(item.path)
                                    ? 'text-brand-professional'
                                    : 'text-slate-400 group-hover:text-brand-professional transition-colors'}
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
                                ? 'bg-gradient-to-r from-brand-professional/10 to-brand-patient/5 text-brand-professional shadow-sm font-bold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-brand-professional'
                                }`}
                        >
                            <LifeBuoy
                                size={20}
                                className={isActive('/support') ? 'text-brand-professional' : 'text-slate-400 group-hover:text-brand-professional transition-colors'}
                            />
                            Central de Ajuda
                        </Link>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-100 bg-brand-patient-surface">
                    {/* Profile Simulator (Test Mode) */}
                    <div className="mb-4 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Simulador de Perfil</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    switchDevRole('executor'); // Sets as professional
                                    navigate('/dashboard');
                                }}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${user?.role === 'professional' || user?.role === 'admin'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Briefcase size={16} />
                                <span className="text-[10px] font-bold">Profissional</span>
                            </button>
                            <button
                                onClick={() => {
                                    switchDevRole('patient');
                                    navigate('/dashboard');
                                }}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${user?.role === 'patient'
                                    ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                            >
                                <User size={16} />
                                <span className="text-[10px] font-bold">Paciente</span>
                            </button>
                        </div>
                    </div>

                    <Link to="/profile" className="block" onClick={() => window.innerWidth < 768 && onClose()}>
                        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 mb-3 cursor-pointer hover:shadow-md transition-all border border-slate-100 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ${user?.role === 'patient' ? 'bg-brand-patient text-white' : 'bg-brand-professional text-white'
                                }`}>
                                {user?.avatar || 'US'}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-brand-professional transition-colors">{user?.name || 'Usuário'}</p>
                                <p className="text-[10px] text-slate-500 truncate font-medium">
                                    {user?.role === 'professional' || user?.role === 'admin'
                                        ? (user.crp ? `CRP ${user.crp}` : 'Profissional')
                                        : 'Paciente'
                                    }
                                </p>
                            </div>
                            <Settings size={16} className="text-slate-300 group-hover:text-brand-professional transition-colors" />
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
            </aside >
        </>
    );
}
