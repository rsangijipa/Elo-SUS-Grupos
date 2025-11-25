import { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';

export default function Header({ title, onOpenSidebar }: { title?: string; onOpenSidebar?: () => void }) {

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Toggle */}
                <button
                    onClick={onOpenSidebar}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">{title || 'EloSUS'}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar paciente ou grupo..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-slate-400 text-slate-700"
                    />
                </div>

                {/* Notifications */}
                <NotificationBell />
            </div>
        </header>
    );
}
