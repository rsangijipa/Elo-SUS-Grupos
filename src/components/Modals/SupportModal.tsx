import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, User, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supportService } from '../../services/supportService';
import { useNotifications } from '../../contexts/NotificationContext';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        message: ''
    });

    // Pre-fill if user is logged in
    useEffect(() => {
        if (user && isOpen) {
            const names = user.name.split(' ');
            setFormData(prev => ({
                ...prev,
                name: names[0] || '',
                surname: names.slice(1).join(' ') || '',
                email: user.email || ''
            }));
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await supportService.sendSupportEmail({
                ...formData,
                timestamp: Date.now(),
                userId: user?.id
            });

            addNotification({
                type: 'success',
                title: 'Mensagem Enviada',
                message: 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.'
            });
            onClose();
            setFormData({ name: '', surname: '', email: '', message: '' });
        } catch (error) {
            addNotification({
                type: 'alert',
                title: 'Erro no Envio',
                message: 'Não foi possível enviar sua mensagem. Tente novamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0054A6] to-[#0077CC] p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare size={24} />
                            Fale Conosco
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">Envie sua dúvida ou sugestão</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Nome</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all"
                                    placeholder="Seu nome"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Sobrenome</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all"
                                placeholder="Seu sobrenome"
                                value={formData.surname}
                                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Seu Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all"
                                placeholder="exemplo@email.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Sua Mensagem</label>
                        <textarea
                            required
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none h-32 transition-all"
                            placeholder="Como podemos ajudar?"
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#0054A6] text-white font-bold rounded-xl hover:bg-[#004080] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Enviar Mensagem
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
