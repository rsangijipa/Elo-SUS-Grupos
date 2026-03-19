import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CACHE_KEY = 'elosus_daily_video';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface VideoResult {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

// Real mental health fallback if API fails
const SAFE_FALLBACK: VideoResult = {
    id: '1i9OktOd7vo', // "O que é Saúde Mental?" - Minuto da Psicologia
    title: 'O que é Saúde Mental?',
    description: 'Entenda os conceitos básicos de saúde mental e bem-estar.',
    thumbnail: 'https://img.youtube.com/vi/1i9OktOd7vo/hqdefault.jpg'
};

export const youtubeService = {
    getDailyVideo: async (): Promise<VideoResult> => {
        // 1. Check Cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data;
                }
            } catch (e) {
                console.error('Error parsing YouTube cache:', e);
            }
        }

        // 2. Check API Key
        if (!API_KEY) {
            console.warn('VITE_YOUTUBE_API_KEY not found. Using fallback video.');
            return SAFE_FALLBACK;
        }

        // 3. Fetch from API
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: 'saude mental motivação bem estar',
                    order: 'date', // Get fresh content
                    type: 'video',
                    maxResults: 1,
                    key: API_KEY,
                    relevanceLanguage: 'pt',
                    regionCode: 'BR'
                }
            });

            const item = response.data.items[0];
            if (!item) return SAFE_FALLBACK;

            const videoData: VideoResult = {
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url
            };

            // 4. Save to Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: videoData,
                timestamp: Date.now()
            }));

            return videoData;

        } catch (error) {
            console.error('Error fetching YouTube video:', error);
            return SAFE_FALLBACK;
        }
    }
};
