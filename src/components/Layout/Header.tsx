import { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';

export default function Header({ title, onOpenSidebar }: { title?: string; onOpenSidebar?: () => void }) {

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-40 gap-4">
            {/* Mobile Toggle */}
            <button
                onClick={onOpenSidebar}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Search Bar & Notifications Container */}
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
                {/* Search Bar */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex-1 transition-all focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-slate-400 text-slate-700 min-w-0"
                    />
                </div>

                {/* Notifications */}
                <div className="shrink-0">
                    <NotificationBell />
                </div>
            </div>
        </header>
    );
}
