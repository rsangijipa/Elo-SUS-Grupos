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
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/grupos', icon: Users, label: 'Grupos Terapêuticos' },
        { to: '/pacientes', icon: Activity, label: 'Pacientes' },
        { to: '/agenda', icon: Calendar, label: 'Agenda' },
        { to: '/relatorios', icon: FileText, label: 'Relatórios' },
    ];

    return (
        <aside className="w-64 bg-[#0054A6] text-white flex flex-col shrink-0 h-screen sticky top-0">
            {/* Logo Area */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                    <img src="/elosusgrupos_logo.png" alt="EloSUS" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="font-bold text-lg tracking-tight">EloSUS</span>
                    <span className="text-xs text-blue-200 font-medium uppercase tracking-wider">Grupos</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-white text-[#0054A6] shadow-sm'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                            )
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/10 bg-[#004080]">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm border border-white/20">
                        {userProfile?.displayName?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {userProfile?.displayName || 'Usuário'}
                        </p>
                        <p className="text-xs text-blue-200 truncate capitalize">
                            {userProfile?.role || 'Terapeuta'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
