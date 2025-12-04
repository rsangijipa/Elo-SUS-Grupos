import React, { useState, useEffect } from 'react';

const SLIDES = [
    {
        id: 1,
        title: "Conexão em grupo!",
        text: "Grupos terapêuticos ativos. Não caminhe sozinho.",
        color: "text-[#7A5CFF]",
        bgGradient: "from-[#7A5CFF]/20 to-transparent",
        image: "/elosusgrupos_setting_login.png"
    },
    {
        id: 2,
        title: "Inteligência Emocional",
        text: "Monitore seu humor e receba insights vitais.",
        color: "text-[#4E8FFF]",
        bgGradient: "from-[#4E8FFF]/20 to-transparent",
        image: "/elosusgrupos_humor_login.png"
    },
    {
        id: 3,
        title: "Sua Jornada Valorizada",
        text: "Gamificação e conquistas para celebrar cada passo.",
        color: "text-[#5EE6C8]",
        bgGradient: "from-[#5EE6C8]/20 to-transparent",
        image: "/elosusgrupos_conquista_login.png"
    }
];

const AuroraCarousel: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full flex flex-col justify-center items-center max-h-[600px]">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-1000 ease-in-out transform ${index === currentSlide
                            ? 'opacity-100 translate-y-0 scale-100'
                            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                        }`}
                >
                    {/* 
                        Image Area: Intelligent Sizing 
                        - Mobile: Smaller fixed height to ensure text visibility
                        - Desktop: Flexible height based on viewport/container
                    */}
                    <div className="flex-shrink-0 relative mb-4 lg:mb-8 transition-all duration-500
                        h-[180px] sm:h-[220px] lg:h-[280px] xl:h-[320px] 
                        w-full flex items-center justify-center"
                    >
                        {/* Background Glow for current slide */}
                        <div className={`absolute w-[80%] h-[80%] rounded-full blur-3xl bg-gradient-to-tr ${slide.bgGradient} opacity-50 animate-pulse`}></div>

                        {slide.image ? (
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="relative z-10 h-full w-auto object-contain drop-shadow-xl rounded-2xl transform hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            // Fallback
                            <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-white/30 text-xs">
                                Imagem indisponível
                            </div>
                        )}
                    </div>

                    {/* 
                        Text Content: Responsive Typography 
                        - Limits width to prevent wide stretching
                        - Scales font size automatically
                    */}
                    <div className="flex flex-col items-center max-w-[90%] lg:max-w-md mx-auto">
                        <h2 className={`font-bold mb-2 lg:mb-4 ${slide.color} drop-shadow-sm transition-all duration-300
                            text-2xl sm:text-3xl lg:text-4xl leading-tight`}
                        >
                            {slide.title}
                        </h2>
                        <p className="text-slate-600 font-medium leading-relaxed transition-all duration-300
                            text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-sm lg:max-w-md"
                        >
                            {slide.text}
                        </p>
                    </div>
                </div>
            ))}

            {/* Indicators - Positioned at bottom relative to container */}
            <div className="absolute -bottom-8 lg:bottom-0 left-0 w-full flex justify-center gap-3 z-20">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-500 ${index === currentSlide
                                ? 'w-8 bg-slate-800'
                                : 'w-2 bg-slate-300 hover:bg-slate-400'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default AuroraCarousel;
