export interface Notification {
    id: string;
    type: 'alert' | 'info' | 'success'; // Map to colors (Red/Blue/Green)
    title: string; // e.g., "Novo Paciente", "Lembrete de Grupo"
    message: string;
    read: boolean;
    timestamp: Date;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'info',
        title: 'Lembrete de Grupo',
        message: 'Grupo de Gestantes amanhã às 09:00',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
        id: '2',
        type: 'success',
        title: 'Confirmação',
        message: 'Paciente João confirmou presença',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
    },
    {
        id: '3',
        type: 'alert',
        title: 'Relatório Pendente',
        message: 'Evolução de Maria Oliveira pendente',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    }
];

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...MOCK_NOTIFICATIONS]);
            }, 300);
        });
    },

    markAsRead: async (id: string): Promise<void> => {
        const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
        if (index !== -1) {
            MOCK_NOTIFICATIONS[index].read = true;
        }
        return Promise.resolve();
    },

    markAllAsRead: async (): Promise<void> => {
        MOCK_NOTIFICATIONS.forEach(n => n.read = true);
        return Promise.resolve();
    }
};
