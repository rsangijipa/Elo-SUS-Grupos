import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut,
    ShieldPlus,
    Stethoscope
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { path: '/groups', label: 'Grupos Terapêuticos', icon: Users },
        { path: '/patients', label: 'Pacientes', icon: Stethoscope }, // Trocado para ícone médico
        { path: '/schedule', label: 'Agenda', icon: Calendar },
        { path: '/reports', label: 'Relatórios', icon: FileText },
    ];

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all">
            {/* Brand Header */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
                <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 text-white flex-shrink-0">
                    <ShieldPlus size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-lg leading-tight">EloSUS</span>
                    <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase">Grupos</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <item.icon
                            size={20}
                            className={isActive(item.path) ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}
                        />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                        JS
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-700 truncate">João Silva</p>
                        <p className="text-xs text-slate-500 truncate">Psicólogo</p>
                    </div>
                </div>
                <button className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm transition-colors font-medium">
                    <LogOut size={16} />
                    Sair do Sistema
                </button>
            </div>
        </aside>
    );
}
