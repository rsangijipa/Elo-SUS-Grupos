import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-label="Abrir menu do usuario"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${user?.role === 'patient' ? 'bg-brand-patient' : user?.role === 'admin' ? 'bg-red-600' : 'bg-brand-professional'}`}>
                    {user?.avatar && !user.avatar.startsWith('avatar_perfil') ? user.avatar : (user?.name?.slice(0, 2).toUpperCase() || 'US')}
                </div>
                <div className="hidden md:block text-left">
                    <p className="max-w-32 truncate text-sm font-bold">{user?.name || 'Usuario'}</p>
                    <p className="text-[10px] text-slate-500">
                        {user?.role === 'admin' ? 'Administrador' : user?.role === 'patient' ? 'Paciente' : 'Profissional'}
                    </p>
                </div>
                <ChevronDown size={16} className="hidden md:block text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl z-50 animate-fade-in">
                    <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-bold text-slate-800">{user?.name || 'Usuario'}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email || 'Sem e-mail'}</p>
                    </div>

                    <div className="p-2">
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
                            <UserIcon size={16} />
                            Ver Perfil
                        </Link>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
                            <Settings size={16} />
                            Configuracoes
                        </Link>
                        <button type="button" onClick={() => void handleLogout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50">
                            <LogOut size={16} />
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
