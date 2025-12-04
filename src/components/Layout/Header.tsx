import { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';
import { useAccessibility } from '../../contexts/AccessibilityContext';

export default function Header({ title, onOpenSidebar }: { title?: string; onOpenSidebar?: () => void }) {
    const { fontSize, highContrast, toggleFontSize, toggleHighContrast } = useAccessibility();

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

                {/* Accessibility Controls */}
                <div className="relative group">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors font-bold" title="Acessibilidade">
                        AA
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block group-focus-within:block animate-fade-in z-50">
                        <div className="space-y-1">
                            <button
                                onClick={toggleFontSize}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                            >
                                <span>Tamanho da Fonte</span>
                                <span className="font-bold">{fontSize === 'large' ? 'Grande' : 'Normal'}</span>
                            </button>
                            <button
                                onClick={toggleHighContrast}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                            >
                                <span>Alto Contraste</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${highContrast ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${highContrast ? 'left-4.5' : 'left-0.5'}`}></div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
