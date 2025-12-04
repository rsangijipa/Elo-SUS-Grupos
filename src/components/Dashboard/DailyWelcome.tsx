import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motivationalQuotes } from '../../data/motivationalQuotes';

const DailyWelcome: React.FC = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'Visitante';

    // Lógica de Seleção Diária
    const { quote, avatarUrl } = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Seleciona a frase baseada no dia
        const quoteIndex = dayOfYear % motivationalQuotes.length;

        // Seleciona o avatar (1 a 4) baseado no dia
        // Se o dia for par usa avatar 2, impar avatar 1 etc... garantindo rotação
        const avatarIndex = (dayOfYear % 4) + 1;

        return {
            quote: motivationalQuotes[quoteIndex],
            avatarUrl: `/avatar${avatarIndex}.png`
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
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                        <img
                            src={avatarUrl}
                            alt="Avatar do dia"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* Texto */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        Olá, <span className="text-indigo-600">{firstName}!</span>
                    </h2>
                    <div className="relative">
                        <p className="text-gray-700 text-lg font-medium leading-relaxed italic">
                            "{quote}"
                        </p>
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
