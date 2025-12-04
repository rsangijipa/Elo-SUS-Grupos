import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Lock, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, increment, Timestamp, arrayUnion } from 'firebase/firestore';
import { WEEKLY_CHALLENGES } from '../../data/weeklyChallenges';
import { toast } from 'react-hot-toast';

const DailyChallenge: React.FC = () => {
    const { user } = useAuth();
    const [challenge, setChallenge] = useState(WEEKLY_CHALLENGES[0]);
    const [isCompletedToday, setIsCompletedToday] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.stats?.lastChallengeDate) {
            const lastDate = user.stats.lastChallengeDate.toDate ? user.stats.lastChallengeDate.toDate() : new Date(user.stats.lastChallengeDate);
            const today = new Date();

            if (lastDate.getDate() === today.getDate() &&
                lastDate.getMonth() === today.getMonth() &&
                lastDate.getFullYear() === today.getFullYear()) {
                setIsCompletedToday(true);
            }
        }

        // Select a challenge based on the day of the year to ensure rotation
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const challengeIndex = dayOfYear % WEEKLY_CHALLENGES.length;
        setChallenge(WEEKLY_CHALLENGES[challengeIndex]);

    }, [user]);

    const handleComplete = async () => {
        if (!user || isCompletedToday) return;

        setLoading(true);
        try {
            // Trigger Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#3b82f6']
            });

            // Update Firestore
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                'stats.completedChallenges': increment(1),
                'stats.lastChallengeDate': Timestamp.now()
            });

            // Check for "Superador" Achievement (5 challenges)
            const currentCompleted = (user.stats?.completedChallenges || 0) + 1;
            if (currentCompleted === 5) {
                await updateDoc(userRef, {
                    achievements: arrayUnion('superador') // Ensure 'superador' is handled in gamificationService if needed
                });
                toast.success('🏆 Conquista Desbloqueada: Superador!', { duration: 5000 });
            }

            setIsCompletedToday(true);
            toast.success(`+${challenge.xpReward} XP! Desafio concluído.`);

        } catch (error) {
            console.error("Error completing challenge:", error);
            toast.error("Erro ao salvar progresso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:border-purple-200 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={80} className="text-purple-600" />
            </div>

            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-purple-500" />
                        Desafio do Dia
                    </h3>
                    <p className="text-sm text-slate-500">Pequenas vitórias diárias</p>
                </div>
                <div className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                    +{challenge.xpReward} XP
                </div>
            </div>

            <div className="mb-6 relative z-10">
                <h4 className="text-xl font-bold text-slate-900 mb-2">{challenge.title}</h4>
                <p className="text-slate-600 leading-relaxed">{challenge.description}</p>
            </div>

            <button
                onClick={handleComplete}
                disabled={isCompletedToday || loading}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isCompletedToday
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-[1.02] hover:shadow-purple-200'
                    }`}
            >
                {loading ? (
                    'Processando...'
                ) : isCompletedToday ? (
                    <>
                        <CheckCircle size={20} />
                        Volte amanhã para mais!
                    </>
                ) : (
                    <>
                        <Trophy size={20} />
                        Completei o Desafio!
                    </>
                )}
            </button>
        </div>
    );
};

export default DailyChallenge;
