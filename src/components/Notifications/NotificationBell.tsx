import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService, Notification } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = notificationService.subscribeToNotifications(user.id, (data) => {
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleClick = async (notification: Notification) => {
        if (!user || !notification.id) return;

        if (!notification.read) {
            await notificationService.markAsRead(user.id, notification.id);
        }

        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-[#0054A6] hover:bg-slate-50 rounded-xl transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Notificações</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                {unreadCount} nova(s)
                            </span>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhuma notificação.
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleClick(notification)}
                                    className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${!notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-slate-200'
                                            }`} />
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notification.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                {notification.createdAt?.seconds
                                                    ? new Date(notification.createdAt.seconds * 1000).toLocaleDateString()
                                                    : 'Agora'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
