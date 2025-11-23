import { SupportPayload } from '../types/shared';

export const supportService = {
    async sendSupportEmail(data: SupportPayload): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock API call
        console.log('📧 Sending email to: doll.ricardoll@gmail.com');
        console.log('📦 Payload:', data);

        // Simulate success
        return Promise.resolve();
    }
};
