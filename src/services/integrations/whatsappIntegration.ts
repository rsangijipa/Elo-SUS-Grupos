/**
 * WhatsApp Integration Service
 * 
 * This service handles sending messages via an external WhatsApp API provider.
 * For development/demo purposes, it logs messages to the console.
 * 
 * Recommended providers: Twilio, Z-API, WPPConnect.
 */

export interface WhatsAppMessage {
    to: string;
    body: string;
    type?: 'text' | 'template';
}

export const whatsappIntegration = {
    /**
     * Sends a WhatsApp message to a specific number.
     * @param to Phone number in international format (e.g., 5511999999999)
     * @param message Message content
     */
    sendMessage: async (to: string, message: string): Promise<boolean> => {
        console.log(`[WhatsApp Mock] Sending message to ${to}: "${message}"`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate success
        return true;
    },

    /**
     * Sends a template message (useful for official business APIs)
     */
    sendTemplate: async (to: string, templateName: string, variables: string[]): Promise<boolean> => {
        console.log(`[WhatsApp Mock] Sending template "${templateName}" to ${to} with vars:`, variables);
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }
};
