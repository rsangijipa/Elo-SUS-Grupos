export const whatsappService = {
    /**
     * Opens a WhatsApp chat with a pre-filled message.
     * @param phone The phone number (with country code, e.g., 5511999999999).
     * @param patientName The name of the patient.
     * @param date The date of the event.
     * @param unitName The name of the health unit.
     */
    sendReminder: (phone: string, patientName: string, date: string, unitName: string) => {
        const message = `Olá ${patientName}, lembrete do seu grupo EloSUS na ${unitName} dia ${date}. Contamos com você!`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    },

    /**
     * Opens a WhatsApp chat for support/reception.
     * Uses a default clinic number (mock).
     */
    getSupportLink: () => {
        const clinicPhone = "5511999999999"; // Mock clinic number
        const message = "Olá, preciso de ajuda com o EloSUS.";
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${clinicPhone}?text=${encodedMessage}`, '_blank');
    }
};
