import { useState } from 'react';
import { Bell, Search, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Header({ title }: { title?: string }) {
    const [showNotifications, setShowNotifications] = useState(false);

    const mockNotifications = [
        { id: 1, title: 'Lembrete de Grupo', message: 'Grupo de Gestantes amanhã às 09:00', type: 'info', time: '1h atrás' },
        { id: 2, title: 'Confirmação', message: 'Paciente João confirmou presença', type: 'success', time: '3h atrás' },
        { id: 3, title: 'Relatório Pendente', message: 'Evolução de Maria Oliveira pendente', type: 'warning', time: '5h atrás' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Toggle would go here */}
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
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-all ${showNotifications
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                            }`}
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Notificações</h3>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {mockNotifications.map(notif => (
                                    <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                                <button className="text-xs font-bold text-blue-600 hover:underline">
                                    Marcar todas como lidas
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
