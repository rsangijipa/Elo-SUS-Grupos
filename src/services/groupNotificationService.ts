import { Notification } from '../types/notification';

const MOCK_GROUP_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        grupoId: '1',
        tipo: 'whatsapp',
        status: 'enviada',
        mensagem: 'Lembrete: Grupo de Tabagismo amanhã às 09:00',
        dataEnvio: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: '2',
        grupoId: '1',
        tipo: 'email',
        status: 'pendente',
        mensagem: 'Relatório mensal disponível',
        dataEnvio: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: '3',
        grupoId: '2',
        tipo: 'sms',
        status: 'falha',
        mensagem: 'Aviso de cancelamento',
        dataEnvio: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    }
];

export const groupNotificationService = {
    getByGroup: async (groupId: string): Promise<Notification[]> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_GROUP_NOTIFICATIONS.filter(n => n.grupoId === groupId));
            }, 300);
        });
    },

    sendNotification: async (groupId: string, message: string): Promise<void> => {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                const newNotification: Notification = {
                    id: Math.random().toString(36).substr(2, 9),
                    grupoId: groupId,
                    tipo: 'whatsapp', // Default to whatsapp for mock
                    status: 'enviada',
                    mensagem: message,
                    dataEnvio: new Date().toISOString()
                };
                MOCK_GROUP_NOTIFICATIONS.unshift(newNotification);
                resolve();
            }, 300);
        });
    }
};
