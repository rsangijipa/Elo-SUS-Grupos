import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const { userProfile } = useAuth();

    // Helper to get page title based on current path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Visão Geral';
        if (path.includes('/grupos')) return 'Grupos Terapêuticos';
        if (path.includes('/pacientes')) return 'Pacientes';
        if (path.includes('/agenda')) return 'Agenda';
        if (path.includes('/relatorios')) return 'Relatórios';
        return 'EloSUS Grupos';
    };

    return (
        <div className="min-h-screen bg-[#F4F7FF] flex font-sans text-slate-900">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {getPageTitle()}
                    </h1>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-[#0054A6] transition-colors rounded-full hover:bg-blue-50">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-700">
                                    {userProfile?.displayName || 'Usuário'}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                    {userProfile?.role || 'Profissional'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
