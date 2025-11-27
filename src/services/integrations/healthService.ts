export interface SleepData {
    date: string;
    hours: number;
    quality: 'good' | 'fair' | 'poor';
}

export interface ActivityData {
    date: string;
    steps: number;
    calories: number;
}

export const healthService = {
    getSleepData: async (): Promise<SleepData[]> => {
        // Placeholder for future integration
        return [];
    },

    getSteps: async (): Promise<ActivityData[]> => {
        // Placeholder for future integration
        return [];
    }
};
