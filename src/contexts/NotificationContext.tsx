import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

    // Initial fetch
    useEffect(() => {
        // TODO: Integrate with backend notification service
        setNotifications([]);
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

        // Trigger Toast
        switch (data.type) {
            case 'success':
                toast.success(data.title ? `${data.title}: ${data.message}` : data.message);
                break;
            case 'alert':
                toast.error(data.title ? `${data.title}: ${data.message}` : data.message);
                break;
            default:
                toast(data.title ? `${data.title}: ${data.message}` : data.message);
        }

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
