import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
    id?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: any;
}

const GROUPS_COLLECTION = 'grupos';

export const chatService = {
    sendMessage: async (groupId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
        if (!groupId) throw new Error("GroupId is required");

        const messagesRef = collection(db, GROUPS_COLLECTION, groupId, 'messages');
        await addDoc(messagesRef, {
            ...message,
            createdAt: serverTimestamp()
        });
    },

    subscribeToMessages: (groupId: string, callback: (messages: ChatMessage[]) => void) => {
        if (!groupId) return () => { };

        const messagesRef = collection(db, GROUPS_COLLECTION, groupId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Timestamp to Date if needed, or keep as is. 
                    // UI usually expects Date.
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()
                } as ChatMessage;
            });
            callback(messages);
        });
    }
};
