import { Notification } from '../types/notification';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

export const groupNotificationService = {
    getHistory: async (groupId: string): Promise<Notification[]> => {
        try {
            const q = query(
                collection(db, 'group_notifications'),
                where('grupoId', '==', groupId),
                orderBy('dataEnvio', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        } catch (error) {
            console.error('Error fetching group notifications:', error);
            return [];
        }
    },

    sendNotification: async (groupId: string, message: string): Promise<void> => {
        try {
            await addDoc(collection(db, 'group_notifications'), {
                grupoId: groupId,
                mensagem: message,
                dataEnvio: new Date().toISOString(),
                status: 'enviado', // In a real app, this might be 'pendente' until processed
                tipo: 'whatsapp',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }
};
