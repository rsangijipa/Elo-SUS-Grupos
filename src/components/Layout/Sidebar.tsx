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
    Briefcase,
    Download
} from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, switchDevRole, updateProfile } = useAuth();
    const { isInstallable, triggerInstall } = useInstallPrompt();

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
        { path: '/my-group', label: 'Meu Grupo', icon: Heart },
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

    // Color mapping for icons
    const getIconColor = (path: string, isActive: boolean) => {
        if (!isActive) return 'text-slate-400 group-hover:text-slate-600';

        switch (path) {
            case '/dashboard': return 'text-blue-600';
            case '/patients': return 'text-green-600';
            case '/groups': return 'text-purple-600';
            case '/my-group': return 'text-purple-600';
            case '/materials': return 'text-orange-600';
            case '/reports': return 'text-pink-600';
            case '/admin': return 'text-red-600';
            default: return 'text-brand-professional';
        }
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
                w-64 bg-white md:bg-gradient-to-b md:from-[#0054A6]/5 md:to-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-xl md:shadow-sm
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
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const iconColor = getIconColor(item.path, active);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${active
                                    ? 'bg-white shadow-md text-slate-800 font-bold border border-slate-100'
                                    : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-700'
                                    }`}
                            >
                                {/* Active Indicator Strip */}
                                {active && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${item.path === '/dashboard' ? 'bg-blue-500' :
                                        item.path === '/patients' ? 'bg-green-500' :
                                            item.path === '/groups' ? 'bg-purple-500' :
                                                item.path === '/materials' ? 'bg-orange-500' :
                                                    item.path === '/reports' ? 'bg-pink-500' :
                                                        item.path === '/admin' ? 'bg-red-500' :
                                                            'bg-brand-professional'
                                        }`}></div>
                                )}

                                <item.icon
                                    size={22}
                                    className={`transition-colors duration-300 ${active ? iconColor : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-600'}`}
                                />
                                <span className={active ? 'translate-x-1 transition-transform' : ''}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

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
                    {/* Profile Simulator (Test Mode) - ADMIN ONLY */}
                    {user?.role === 'admin' && (
                        <div className="mb-4 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Simulador de Perfil</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        switchDevRole('executor'); // Sets as professional
                                        navigate('/dashboard');
                                    }}
                                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                >
                                    <Briefcase size={16} />
                                    <span className="text-[10px] font-bold">Profissional</span>
                                </button>
                                <button
                                    onClick={() => {
                                        switchDevRole('patient');
                                        navigate('/dashboard');
                                    }}
                                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                                >
                                    <User size={16} />
                                    <span className="text-[10px] font-bold">Paciente</span>
                                </button>
                            </div>
                        </div>
                    )}





                    <div className="bg-white rounded-2xl p-1 flex items-center gap-2 mb-3 border border-slate-100 group relative">
                        <button
                            onClick={() => {
                                const newInitials = prompt('Digite as novas iniciais para o avatar (Max 2 letras):', user?.avatar || '');
                                if (newInitials !== null) {
                                    updateProfile({ avatar: newInitials.substring(0, 2).toUpperCase() });
                                }
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ml-2 hover:brightness-90 transition-all relative overflow-hidden ${user?.role === 'patient' ? 'bg-brand-patient text-white' : 'bg-brand-professional text-white'
                                }`}
                            title="Alterar Avatar"
                        >
                            {user?.avatar || 'US'}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Settings size={12} className="text-white" />
                            </div>
                        </button>

                        <Link
                            to="/profile"
                            className="flex-1 flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors"
                            onClick={() => window.innerWidth < 768 && onClose()}
                        >
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-brand-professional transition-colors">{user?.name || 'Usuário'}</p>
                                <p className="text-[10px] text-slate-500 truncate font-medium">
                                    {user?.role === 'professional' || user?.role === 'admin'
                                        ? (user.crp ? `CRP ${user.crp}` : 'Profissional')
                                        : 'Paciente'
                                    }
                                </p>
                            </div>
                            <Settings size={16} className="text-slate-300 group-hover:text-brand-professional transition-colors" />
                        </Link>
                    </div>

                    {isInstallable && (
                        <button
                            onClick={triggerInstall}
                            className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-brand-professional hover:bg-blue-50 py-3 mb-2 rounded-xl text-sm transition-colors font-medium btn-press"
                        >
                            <Download size={16} />
                            Instalar Aplicativo
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm transition-colors font-medium btn-press"
                    >
                        <LogOut size={16} />
                        Sair do Sistema
                    </button>
                </div>
            </aside >
        </>
    );
}
