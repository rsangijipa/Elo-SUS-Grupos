import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';

interface TTSButtonProps {
    text: string;
    size?: number;
    className?: string;
    color?: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({
    text,
    size = 20,
    className = "",
    color = "text-slate-400 hover:text-purple-600"
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Check if speaking on mount/interval to sync state if external cancel happens
    useEffect(() => {
        const checkSpeaking = setInterval(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rv = (window as any).responsiveVoice;
            if (rv) {
                setIsPlaying(rv.isPlaying());
            }
        }, 500);

        return () => clearInterval(checkSpeaking);
    }, []);

    const toggleSpeech = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering card clicks

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rv = (window as any).responsiveVoice;

        if (!rv) {
            console.warn("ResponsiveVoice not loaded");
            return;
        }

        if (rv.isPlaying()) {
            rv.cancel();
            setIsPlaying(false);
        } else {
            rv.speak(text, "Brazilian Portuguese Female", {
                rate: 1.1,
                onstart: () => setIsPlaying(true),
                onend: () => setIsPlaying(false)
            });
        }
    };

    return (
        <button
            onClick={toggleSpeech}
            className={`p-2 rounded-full transition-all duration-200 hover:bg-slate-100 active:scale-95 ${color} ${className}`}
            title={isPlaying ? "Parar leitura" : "Ouvir texto"}
            aria-label={isPlaying ? "Parar leitura" : "Ouvir texto"}
        >
            {isPlaying ? (
                <Square size={size} className="animate-pulse fill-current" />
            ) : (
                <Volume2 size={size} />
            )}
        </button>
    );
};

export default TTSButton;
