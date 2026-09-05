import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import { withErrorHandling } from '../utils/errorHandler';

export interface Notification {
    id?: string;
    title: string;
    message: string;
    type: 'group_invite' | 'system' | 'alert' | 'success';
    read: boolean;
    createdAt: Timestamp | null;
    link?: string;
}

export const notificationService = {
    sendNotification: async (userId: string, notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        return withErrorHandling(async () => {
            const notificationsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.NOTIFICATIONS);
            await addDoc(notificationsRef, {
                ...notification,
                read: false,
                createdAt: serverTimestamp()
            });
        });
    },

    markAsRead: async (userId: string, notificationId: string) => {
        return withErrorHandling(async () => {
            const notifRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.NOTIFICATIONS, notificationId);
            await updateDoc(notifRef, { read: true });
        });
    },

    markAllAsRead: async (userId: string, notificationIds: string[]) => {
        return withErrorHandling(async () => {
            const promises = notificationIds.map(id =>
                updateDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.NOTIFICATIONS, id), { read: true })
            );
            await Promise.all(promises);
        });
    },

    subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
        const notificationsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.NOTIFICATIONS);
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
