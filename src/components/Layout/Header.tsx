import { matchPath, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';
import UserMenu from './UserMenu';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function Header({ onOpenSidebar }: { title?: string; onOpenSidebar?: () => void }) {
    const location = useLocation();
    const { user } = useAuth();
    const { groups, patients } = useData();
    const { fontSize, highContrast, toggleFontSize, toggleHighContrast } = useAccessibility();

    const getRoleLabel = () => {
        switch (user?.role) {
            case 'admin':
                return { label: 'Admin', className: 'bg-red-50 text-red-600' };
            case 'patient':
                return { label: 'Paciente', className: 'bg-purple-50 text-purple-600' };
            default:
                return { label: 'Profissional', className: 'bg-blue-50 text-blue-600' };
        }
    };

    const buildBreadcrumb = () => {
        const patientMatch = matchPath('/patients/:id', location.pathname);
        if (patientMatch?.params.id) {
            const patient = patients.find((item) => item.id === patientMatch.params.id);
            return ['Pacientes', patient?.name || 'Carregando paciente'];
        }

        const groupMatch = matchPath('/groups/:id/manage', location.pathname);
        if (groupMatch?.params.id) {
            const group = groups.find((item) => item.id === groupMatch.params.id);
            return ['Grupos', group?.name || 'Carregando grupo'];
        }

        return null;
    };

    const roleBadge = getRoleLabel();
    const breadcrumb = buildBreadcrumb();

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 md:px-8">
            <div className="flex h-20 items-center justify-between gap-3 md:hidden">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <img src="/elosusgrupos_logo.png" alt="EloSUS" className="h-8 w-auto" />
                    <span className="font-bold text-brand-professional text-lg">EloSUS</span>
                </div>

                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <UserMenu />
                </div>
            </div>

            <div className="hidden md:flex h-20 items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    {breadcrumb ? (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Navegacao</p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <span>{breadcrumb[0]}</span>
                                <span>/</span>
                                <span className="truncate font-semibold text-slate-800">{breadcrumb[1]}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 max-w-xl transition-all focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300">
                            <Search size={18} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-slate-400 text-slate-700 min-w-0"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadge.className}`}>{roleBadge.label}</span>

                    <div className="relative group">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors font-bold" title="Acessibilidade" aria-label="Acessibilidade">
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

                    <NotificationBell />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
