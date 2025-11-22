import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut,
    Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
    const { logout, userProfile } = useAuth();

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
        { to: '/grupos', icon: Users, label: 'Grupos Terapêuticos' },
        { to: '/pacientes', icon: Activity, label: 'Pacientes' },
        { to: '/agenda', icon: Calendar, label: 'Agenda' },
        { to: '/relatorios', icon: FileText, label: 'Relatórios' },
        // { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-primary font-bold text-xl">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <Users size={18} />
                    </div>
                    <span>EloSUS</span>
                </div>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {userProfile?.displayName?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {userProfile?.displayName || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 truncate capitalize">
                            {userProfile?.role || 'Terapeuta'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
