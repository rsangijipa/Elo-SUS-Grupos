import { useState, useEffect } from 'react';
import { Bell, Search, X, CheckCircle, AlertTriangle, Info, Menu } from 'lucide-react';
import { notificationService, type Notification } from '../../services/notificationService';

export default function Header({ title, onOpenSidebar }: { title?: string; onOpenSidebar?: () => void }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        const data = await notificationService.getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
    };

    const handleMarkAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        loadNotifications();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'alert': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h atrás";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m atrás";
        return "Agora";
    };

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
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-all ${showNotifications
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                            }`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
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
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Nenhuma notificação.
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm text-slate-800 ${!notif.read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{getTimeAgo(notif.timestamp)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
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
