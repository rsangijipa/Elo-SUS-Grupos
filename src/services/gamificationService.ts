import { db } from './firebase';
import { doc, updateDoc, getDoc, arrayUnion, increment } from 'firebase/firestore';
import { User } from '../types/user';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (user: User) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_steps',
        title: 'Primeiros Passos',
        description: 'Bem-vindo à sua jornada de saúde!',
        icon: '🏅',
        condition: () => true // Always true for registered users
    },
    {
        id: 'on_fire',
        title: 'Chama Acesa',
        description: 'Acesse o app por 3 dias seguidos.',
        icon: '🔥',
        condition: (user) => (user.stats?.loginStreak || 0) >= 3
    },
    {
        id: 'active_voice',
        title: 'Voz Ativa',
        description: 'Participe de 5 sessões de grupo.',
        icon: '🗣️',
        condition: (user) => (user.stats?.totalSessions || 0) >= 5
    },
    {
        id: 'mind_explorer',
        title: 'Explorador da Mente',
        description: 'Complete a Avaliação de Saúde Mental.',
        icon: '🧠',
        condition: (user) => (user.achievements || []).includes('mind_explorer') // Manually triggered
    },
    {
        id: 'self_guardian',
        title: 'Guardião de Si',
        description: 'Complete o Termômetro do Autocuidado.',
        icon: '🛡️',
        condition: (user) => (user.achievements || []).includes('self_guardian') // Manually triggered
    }
];

export const gamificationService = {
    checkAndUnlockAchievements: async (userId: string): Promise<Achievement[]> => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return [];

            const userData = userSnap.data() as User;
            const currentAchievements = userData.achievements || [];
            const newUnlocked: Achievement[] = [];

            // Check streak logic
            const now = new Date();
            const lastLogin = userData.stats?.lastLogin?.toDate ? userData.stats.lastLogin.toDate() : new Date(userData.stats?.lastLogin || 0);

            // Reset hours to compare dates only
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = userData.stats?.loginStreak || 0;

            if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
            } else if (diffDays > 1) {
                // Broken streak
                newStreak = 1;
            } else if (newStreak === 0) {
                // First login ever or fresh start
                newStreak = 1;
            }
            // If diffDays === 0 (same day), keep streak

            // Update stats first
            await updateDoc(userRef, {
                'stats.loginStreak': newStreak,
                'stats.lastLogin': now
            });

            // Update local user object for condition checking
            const updatedUser: User = {
                ...userData,
                stats: {
                    ...userData.stats,
                    loginStreak: newStreak,
                    lastLogin: now,
                    totalSessions: userData.stats?.totalSessions || 0
                }
            };

            // Check achievements
            for (const achievement of ACHIEVEMENTS) {
                if (!currentAchievements.includes(achievement.id)) {
                    if (achievement.condition(updatedUser)) {
                        await updateDoc(userRef, {
                            achievements: arrayUnion(achievement.id)
                        });
                        newUnlocked.push(achievement);
                    }
                }
            }

            return newUnlocked;
        } catch (error) {
            console.error("Error in gamification service:", error);
            return [];
        }
    },

    getUserAchievements: async (userId: string): Promise<string[]> => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                return userSnap.data().achievements || [];
            }
            return [];
        } catch (error) {
            console.error("Error fetching achievements:", error);
            return [];
        }
    }
};
