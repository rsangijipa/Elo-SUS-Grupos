import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    date: string;
    audience: 'patient' | 'professional' | 'both';
    source: string;
    url: string;
}

export const newsService = {
    getNews: async (audience: 'patient' | 'professional', page: number = 1): Promise<NewsItem[]> => {
        try {
            // Fetch from 'news' collection
            const q = query(
                collection(db, 'news'),
                where('audience', 'in', [audience, 'both']),
                orderBy('date', 'desc'),
                limit(4) // Simple limit for now, pagination would require more logic
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }
};
