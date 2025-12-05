
import { useState, useEffect } from 'react';
import { AIService } from '../services/vertexAI';
import { useAuth } from '../contexts/AuthContext';
import { moodService } from '../services/moodService';

const CACHE_KEY = 'elosus_daily_message';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useDailyMessage() {
    const { user } = useAuth();
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessage() {
            if (!user) return;

            // 1. Check LocalStorage Cache
            const cached = localStorage.getItem(`${CACHE_KEY}_${user.uid}`);
            if (cached) {
                const { text, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setMessage(text);
                    setLoading(false);
                    return;
                }
            }

            // 2. Fetch fresh message
            try {
                // Get latest mood
                const history = await moodService.getPatientHistory(user.uid);
                const lastMood = history.length > 0 ? (history[0].value >= 3 ? 'neutral/good' : 'bad') : 'neutral';

                // Get group theme (mock for now, or fetch from active enrollment)
                const groupTheme = "Ansiedade e Autocuidado"; // Ideally fetch from enrollment

                const text = await AIService.generateDailySupportMessage({
                    patientName: user.name.split(' ')[0],
                    groupTheme,
                    moodLog: lastMood
                });

                setMessage(text);

                // Save to Cache
                localStorage.setItem(`${CACHE_KEY}_${user.uid}`, JSON.stringify({
                    text,
                    timestamp: Date.now()
                }));

            } catch (error) {
                console.error("Error fetching daily message:", error);
                setMessage(`Olá ${user.name.split(' ')[0]}, que seu dia seja tranquilo!`);
            } finally {
                setLoading(false);
            }
        }

        fetchMessage();
    }, [user]);

    return { message, loading };
}
