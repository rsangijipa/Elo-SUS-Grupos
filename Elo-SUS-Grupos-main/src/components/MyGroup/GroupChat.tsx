import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Flag, Smile, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, ChatMessage } from '../../services/chatService';

interface GroupChatProps {
    groupId?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!groupId) return;

        const unsubscribe = chatService.subscribeToMessages(groupId, (newMessages) => {
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [groupId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !groupId || !user) return;

        try {
            await chatService.sendMessage(groupId, {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar || '',
                text: newMessage,
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally add error handling UI here
        }
    };

    const handleReport = (msgId: string) => {
        // In a real app, this would send a report to Firestore
        alert(`Mensagem ${msgId} denunciada para a administração.`);
    };

    if (!groupId) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[600px] items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <User className="text-slate-400" size={32} />
                </div>
                <h3 className="text-slate-800 font-bold mb-2">Você não está em um grupo</h3>
                <p className="text-slate-500 text-sm">Aguarde ser adicionado a um grupo para participar do chat.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[600px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">Chat da Turma</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Online agora
                    </p>
                </div>
                <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                    Espaço Seguro
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FC]">
                <div className="flex justify-center mb-4">
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Hoje
                    </span>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.userId === user?.id;
                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-brand-patient text-white' : 'bg-white border border-slate-200 text-slate-600'
                                }`}>
                                {msg.userAvatar || <User size={14} />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`group relative max-w-[80%] ${isMe
                                ? 'bg-brand-patient text-white rounded-2xl rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none shadow-sm'
                                } p-3`}>

                                {!isMe && (
                                    <p className="text-[10px] font-bold text-brand-patient mb-1">{msg.userName}</p>
                                )}

                                <p className="text-sm leading-relaxed">{msg.text}</p>

                                <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-white/70' : 'text-slate-400'
                                    }`}>
                                    {msg.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                {/* Report Action (Only for others) */}
                                {!isMe && (
                                    <button
                                        onClick={() => handleReport(msg.id!)}
                                        className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500"
                                        title="Denunciar mensagem"
                                    >
                                        <Flag size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:border-brand-patient focus-within:ring-2 focus-within:ring-brand-patient/20 transition-all">
                    <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Smile size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-brand-patient text-white rounded-full hover:bg-brand-patient-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    Lembre-se: respeito e empatia são fundamentais neste grupo.
                </p>
            </form>
        </div>
    );
};

export default GroupChat;
