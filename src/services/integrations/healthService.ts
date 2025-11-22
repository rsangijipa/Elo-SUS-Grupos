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

const MOCK_SLEEP_DATA: SleepData[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const hours = 6 + Math.random() * 3; // 6 to 9 hours
    return {
        date: date.toISOString().split('T')[0],
        hours: parseFloat(hours.toFixed(1)),
        quality: hours > 7.5 ? 'good' : hours > 6.5 ? 'fair' : 'poor'
    };
});

const MOCK_ACTIVITY_DATA: ActivityData[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
        date: date.toISOString().split('T')[0],
        steps: Math.floor(3000 + Math.random() * 7000), // 3000 to 10000 steps
        calories: Math.floor(150 + Math.random() * 300)
    };
});

export const healthService = {
    getSleepData: (): Promise<SleepData[]> => {
        return Promise.resolve(MOCK_SLEEP_DATA);
    },

    getSteps: (): Promise<ActivityData[]> => {
        return Promise.resolve(MOCK_ACTIVITY_DATA);
    }
};
