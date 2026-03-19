import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { db } from './firebase';
import { attendanceService } from './attendanceService';
import { moodService } from './moodService';
import { quizService } from './quizService';
import type { User } from '../types/user';
import { toJsDate } from '../utils/dateUtils';
import { withErrorHandling } from '../utils/errorHandler';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'automatic' | 'manual';
    condition: (userId: string, user: User) => Promise<boolean>;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_steps',
        title: 'Primeiros Passos',
        description: 'Bem-vindo a sua jornada de saude!',
        icon: '🏅',
        type: 'automatic',
        condition: async () => true
    },
    {
        id: 'on_fire',
        title: 'Chama Acesa',
        description: 'Acesse o app por 3 dias seguidos.',
        icon: '🔥',
        type: 'automatic',
        condition: async (_userId, user) => (user.stats?.loginStreak || 0) >= 3
    },
    {
        id: 'active_voice',
        title: 'Voz Ativa',
        description: 'Participe de 5 sessoes de grupo.',
        icon: '🗣️',
        type: 'automatic',
        condition: async (_userId, user) => (user.stats?.totalSessions || 0) >= 5
    },
    {
        id: 'mind_explorer',
        title: 'Explorador da Mente',
        description: 'Complete a Avaliacao de Saude Mental.',
        icon: '🧠',
        type: 'manual',
        condition: async () => false
    },
    {
        id: 'self_guardian',
        title: 'Guardiao de Si',
        description: 'Complete o Termometro do Autocuidado.',
        icon: '🛡️',
        type: 'manual',
        condition: async () => false
    },
    {
        id: 'mood_7days',
        title: 'Humor em Dia',
        description: 'Registre seu humor por 7 dias consecutivos.',
        icon: '🙂',
        type: 'automatic',
        condition: async (userId) => (await moodService.getConsecutiveMoodDays(userId)) >= 7
    },
    {
        id: 'quiz_master',
        title: 'Mestre dos Quizzes',
        description: 'Complete 3 quizzes de autocuidado e saude mental.',
        icon: '🎯',
        type: 'automatic',
        condition: async (userId) => (await quizService.getCompletedCount(userId)) >= 3
    },
    {
        id: 'group_regular',
        title: 'Presenca Marcante',
        description: 'Tenha 80% ou mais de presenca em um grupo.',
        icon: '📅',
        type: 'automatic',
        condition: async (userId) => attendanceService.hasRegularAttendance(userId)
    }
];

const getAchievementById = (achievementId: string) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId) || null;

export const gamificationService = {
    unlockAchievement: async (userId: string, achievementId: string): Promise<Achievement | null> => {
        return withErrorHandling(async () => {
            const achievement = getAchievementById(achievementId);
            if (!achievement) {
                throw new Error('Conquista nao encontrada.');
            }

            const userRef = doc(db, COLLECTIONS.USERS, userId);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                throw new Error('Usuario nao encontrado.');
            }

            const currentAchievements = userSnap.data().achievements || [];
            if (currentAchievements.includes(achievementId)) {
                return achievement;
            }

            await updateDoc(userRef, {
                achievements: arrayUnion(achievementId)
            });

            return achievement;
        }, null);
    },

    checkAndUnlockAchievements: async (userId: string): Promise<Achievement[]> => {
        return withErrorHandling(async () => {
            const userRef = doc(db, COLLECTIONS.USERS, userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                return [];
            }

            const userData = userSnap.data() as User;
            const currentAchievements = userData.achievements || [];
            const newUnlocked: Achievement[] = [];

            const now = new Date();
            const lastLogin = toJsDate(userData.stats?.lastLogin) || new Date(0);
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = userData.stats?.loginStreak || 0;

            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            } else if (newStreak === 0) {
                newStreak = 1;
            }

            await updateDoc(userRef, {
                'stats.loginStreak': newStreak,
                'stats.lastLogin': now
            });

            const updatedUser: User = {
                ...userData,
                stats: {
                    ...userData.stats,
                    loginStreak: newStreak,
                    lastLogin: now,
                    totalSessions: userData.stats?.totalSessions || 0
                }
            };

            for (const achievement of ACHIEVEMENTS.filter((item) => item.type === 'automatic')) {
                if (currentAchievements.includes(achievement.id)) {
                    continue;
                }

                if (await achievement.condition(userId, updatedUser)) {
                    await updateDoc(userRef, {
                        achievements: arrayUnion(achievement.id)
                    });
                    newUnlocked.push(achievement);
                }
            }

            return newUnlocked;
        }, [] as Achievement[]);
    },

    getUserAchievements: async (userId: string): Promise<string[]> => {
        return withErrorHandling(async () => {
            const userRef = doc(db, COLLECTIONS.USERS, userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                return userSnap.data().achievements || [];
            }
            return [];
        }, [] as string[]);
    }
};
