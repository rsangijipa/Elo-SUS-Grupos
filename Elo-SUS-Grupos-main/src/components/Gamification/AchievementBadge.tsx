import React from 'react';
import { Lock } from 'lucide-react';
import TTSButton from '../Common/TTSButton';

interface AchievementBadgeProps {
    title: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
    progress?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ title, description, icon, isUnlocked, progress }) => {
    return (
        <div className={`relative group p-4 rounded-2xl border transition-all duration-300 ${isUnlocked
            ? 'bg-gradient-to-br from-white/40 to-white/10 border-white/30 backdrop-blur-md shadow-lg hover:shadow-xl hover:scale-[1.02]'
            : 'bg-slate-100/50 border-slate-200 grayscale opacity-70'
            }`}>

            {/* Locked Overlay */}
            {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-slate-200/80 p-2 rounded-full backdrop-blur-sm">
                        <Lock size={16} className="text-slate-500" />
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-2">
                <div className={`text-4xl mb-1 transition-transform duration-500 ${isUnlocked ? 'animate-bounce-slow' : ''}`}>
                    {icon}
                </div>

                <div>
                    <h3 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                        {title}
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                        {description}
                    </p>
                </div>

                {progress && (
                    <div className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 text-slate-600 border border-white/20">
                        {progress}
                    </div>
                )}
            </div>

            {/* Shine Effect for Unlocked */}
            {isUnlocked && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}

            {/* TTS Button */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <TTSButton
                    text={`${title}. ${description}`}
                    size={16}
                    color={isUnlocked ? "text-slate-600 hover:text-purple-600" : "text-slate-400"}
                />
            </div>
        </div>
    );
};

export default AchievementBadge;
