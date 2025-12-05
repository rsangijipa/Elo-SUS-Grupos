import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motivationalQuotes } from '../../data/motivationalQuotes';
import TTSButton from '../Common/TTSButton';

const DailyWelcome: React.FC = () => {
    const { user, isLoading } = useAuth();
    const firstName = user?.name?.split(' ')[0];

    // Lógica de Seleção Aleatória por Sessão
    const { quote, avatarUrl } = useMemo(() => {
        // Seleciona uma frase aleatória
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);

        // Seleciona um avatar aleatório (1 a 4)
        const randomAvatarIndex = Math.floor(Math.random() * 4) + 1;

        return {
            quote: motivationalQuotes[randomIndex],
            avatarUrl: `/avatar${randomAvatarIndex}.png`
        };
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl">
            {/* Background Animado (Aurora Effect) */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-teal-200 animate-gradient-xy opacity-80"
                style={{ backgroundSize: '400% 400%', animation: 'gradient-xy 15s ease infinite' }}></div>

            {/* Camada de Overlay para legibilidade */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Container */}
                <div className="flex-shrink-0">
                    <img
                        src={avatarUrl}
                        alt="Avatar do dia"
                        className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-700"
                    />
                </div>

                {/* Texto */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        {isLoading || !firstName ? (
                            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                        ) : (
                            <span className="text-indigo-600">{firstName}!</span>
                        )}
                    </h2>
                    <div className="relative flex items-start gap-2">
                        <p className="text-gray-700 text-lg font-medium leading-relaxed italic flex-1">
                            "{quote}"
                        </p>
                        <TTSButton
                            text={`Frase do dia: ${quote}`}
                            size={20}
                            color="text-indigo-400 hover:text-indigo-600"
                        />
                    </div>
                </div>
            </div>

            {/* Style para a animação do background */}
            <style>{`
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        </div>
    );
};

export default DailyWelcome;
