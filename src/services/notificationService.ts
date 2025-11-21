import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase_config';
import type { Notification } from '../types/notification';

const COLLECTION_NAME = 'notificacoes';

export const notificationService = {
    create: async (notification: Omit<Notification, 'id'>) => {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...notification,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    getByGroup: async (grupoId: string) => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('grupoId', '==', grupoId),
            orderBy('dataEnvio', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    },

    // Mock function to simulate sending a notification
    sendNotification: async (grupoId: string, message: string) => {
        // In a real app, this would call an API (e.g., WhatsApp API)
        console.log(`Sending notification to group ${grupoId}: ${message}`);

        // Record the notification
        await notificationService.create({
            grupoId,
            tipo: 'whatsapp',
            status: 'enviada',
            mensagem: message,
            dataEnvio: new Date().toISOString()
        });
    }
};
