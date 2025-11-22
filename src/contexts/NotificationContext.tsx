import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'alert' | 'info' | 'success';
    title: string;
    message: string;
    read: boolean;
    timestamp: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Mock initial fetch
    useEffect(() => {
        // Simulate fetching notifications
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'info',
                title: 'Bem-vindo ao EloSUS',
                message: 'Seu cadastro foi realizado com sucesso. Complete seu perfil.',
                read: false,
                timestamp: new Date()
            },
            {
                id: '2',
                type: 'alert',
                title: 'Lembrete de Sessão',
                message: 'Você tem um grupo de Tabagismo agendado para amanhã às 09:00.',
                read: false,
                timestamp: new Date(Date.now() - 86400000) // Yesterday
            }
        ];
        setNotifications(mockNotifications);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const addNotification = (data: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            read: false,
            timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
