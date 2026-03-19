import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

export interface Notification {
    id: string;
    type: 'alert' | 'info' | 'success';
    title: string;
    message: string;
    read: boolean;
    timestamp: Date;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const mapNotificationType = (type: 'group_invite' | 'system' | 'alert' | 'success'): Notification['type'] => {
    switch (type) {
        case 'success':
            return 'success';
        case 'alert':
            return 'alert';
        default:
            return 'info';
    }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            return;
        }

        const unsubscribe = notificationService.subscribeToNotifications(user.id, (items) => {
            const mappedNotifications: Notification[] = items.map((item) => ({
                id: item.id || Math.random().toString(36).slice(2, 9),
                type: mapNotificationType(item.type),
                title: item.title,
                message: item.message,
                read: item.read,
                timestamp: item.createdAt?.toDate ? item.createdAt.toDate() : new Date(),
                link: item.link
            }));

            setNotifications(mappedNotifications);
        });

        return () => unsubscribe();
    }, [user?.id]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        if (!user?.id) {
            return;
        }

        await notificationService.markAsRead(user.id, id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = async () => {
        if (!user?.id) {
            return;
        }

        const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id);
        if (unreadIds.length > 0) {
            await notificationService.markAllAsRead(user.id, unreadIds);
        }
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
