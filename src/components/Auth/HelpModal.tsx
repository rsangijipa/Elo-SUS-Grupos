import React, { useState } from 'react';
import { Send } from 'lucide-react';
import ModalContent from './ModalContent';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface HelpModalProps {
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const { theme } = useTheme();
    const { addNotification } = useNotifications();

    const [helpData, setHelpData] = useState({
        name: '',
        surname: '',
        email: '',
        message: ''
    });

    const handleHelpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const subject = `Suporte EloSUS - ${helpData.name} ${helpData.surname}`;
        const body = `Nome: ${helpData.name} ${helpData.surname}\nEmail: ${helpData.email}\n\nMensagem:\n${helpData.message}`;

        // Construct mailto link
        const mailtoLink = `mailto:doll.ricardoll@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open email client
        window.location.href = mailtoLink;

        onClose();
        setHelpData({ name: '', surname: '', email: '', message: '' });

        addNotification({
            type: 'success',
            title: 'Cliente de email aberto',
            message: 'Por favor, envie o email através do seu aplicativo padrão.'
        });
    };

    return (
        <ModalContent title="Suporte" onClose={onClose}>
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm">
                    <p className="font-medium mb-1">Precisa de ajuda?</p>
                    <p>Descreva sua dúvida ou problema no campo abaixo. Nossa equipe vai analisar sua mensagem e retornar pelo e-mail informado o mais breve possível. 💬</p>
                </div>
                <form onSubmit={handleHelpSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Nome"
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                            style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                            value={helpData.name}
                            onChange={e => setHelpData({ ...helpData, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Sobrenome"
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                            style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                            value={helpData.surname}
                            onChange={e => setHelpData({ ...helpData, surname: e.target.value })}
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Seu email"
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                        style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                        value={helpData.email}
                        onChange={e => setHelpData({ ...helpData, email: e.target.value })}
                    />
                    <textarea
                        placeholder="Como podemos ajudar?"
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all resize-none"
                        style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                        value={helpData.message}
                        onChange={e => setHelpData({ ...helpData, message: e.target.value })}
                    />
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${theme === 'patient' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        Enviar Mensagem <Send size={18} />
                    </button>
                </form>
            </div>
        </ModalContent>
    );
};

export default HelpModal;
