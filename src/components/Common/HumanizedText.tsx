import React, { useState, useEffect } from 'react';
import { AIService } from '../../services/vertexAI';
import { Sparkles, Loader2 } from 'lucide-react';

interface HumanizedTextProps {
    text: string;
    isEnabled: boolean;
    className?: string;
}

const HumanizedText: React.FC<HumanizedTextProps> = ({ text, isEnabled, className = "text-sm text-slate-600 leading-relaxed" }) => {
    const [humanized, setHumanized] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        if (isEnabled && !humanized && !loading) {
            setLoading(true);
            AIService.humanizeReport(text)
                .then(res => {
                    if (isMounted) {
                        setHumanized(res);
                        setLoading(false);
                    }
                })
                .catch(err => {
                    console.error("Error humanizing text:", err);
                    if (isMounted) setLoading(false);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [isEnabled, text, humanized, loading]);

    if (!isEnabled) {
        return <p className={className}>{text}</p>;
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-purple-500 animate-pulse bg-purple-50 p-3 rounded-lg border border-purple-100">
                <Loader2 size={16} className="animate-spin" />
                <span>Simplificando termos técnicos com IA...</span>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Sparkles size={16} className="text-indigo-400" />
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md">
                    Versão Simplificada
                </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {humanized || text}
            </p>

            <div className="mt-3 pt-3 border-t border-indigo-100/50">
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Tradução gerada por IA para facilitar o entendimento. O documento oficial permanece o técnico.
                </p>
            </div>
        </div>
    );
};

export default HumanizedText;
