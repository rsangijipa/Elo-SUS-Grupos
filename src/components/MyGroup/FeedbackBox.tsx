import React, { useState } from 'react';
import { MessageSquarePlus, Send, Lock, CheckCircle2 } from 'lucide-react';

const FeedbackBox: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Mock sending to Firestore
        console.log('Feedback sent:', { message, isAnonymous });

        setIsSent(true);
        setMessage('');

        setTimeout(() => setIsSent(false), 3000);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
            {/* Decorative Icon */}
            <div className="absolute -right-6 -top-6 text-indigo-100 opacity-50">
                <MessageSquarePlus size={120} />
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <MessageSquarePlus size={20} className="text-indigo-600" />
                    Caixa de Sugestões
                </h3>
                <p className="text-sm text-indigo-700/80 mb-4 max-w-md">
                    Tem alguma ideia para o grupo ou algo te incomodou?
                    Este é um espaço seguro para você compartilhar.
                </p>

                {isSent ? (
                    <div className="bg-white/80 backdrop-blur rounded-xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="font-bold text-green-800">Mensagem Enviada!</h4>
                        <p className="text-xs text-green-600 mt-1">Obrigado por contribuir com o grupo.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escreva sua mensagem aqui..."
                            className="w-full bg-white border-indigo-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-24"
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAnonymous ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                    {isAnonymous ? <Lock size={12} className="text-indigo-600" /> : null}
                                    Enviar anonimamente
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                <Send size={16} />
                                Enviar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackBox;
