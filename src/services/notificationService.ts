import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
    id?: string;
    title: string;
    message: string;
    type: 'group_invite' | 'system' | 'alert' | 'success';
    read: boolean;
    createdAt: any;
    link?: string;
}

export const notificationService = {
    sendNotification: async (userId: string, notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        try {
            const notificationsRef = collection(db, 'users', userId, 'notifications');
            await addDoc(notificationsRef, {
                ...notification,
                read: false,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    },

    markAsRead: async (userId: string, notificationId: string) => {
        try {
            const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    markAllAsRead: async (userId: string, notificationIds: string[]) => {
        try {
            const promises = notificationIds.map(id =>
                updateDoc(doc(db, 'users', userId, 'notifications', id), { read: true })
            );
            await Promise.all(promises);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    },

    subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
        const notificationsRef = collection(db, 'users', userId, 'notifications');
        // Order by createdAt desc
        const q = query(notificationsRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            callback(notifications);
        });
    }
};
