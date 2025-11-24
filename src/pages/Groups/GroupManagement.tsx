import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    MessageSquare,
    Trash2,
    Upload,
    Send,
    Paperclip,
    History,
    ChevronDown,
    ChevronUp,
    Youtube,
    Newspaper,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreVertical,
    X
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface Participant {
    id: string;
    name: string;
    attendanceRate: number;
    status: 'present' | 'absent' | 'excused' | null;
    avatar?: string;
}

// Mock data for participants
const MOCK_PARTICIPANTS: Participant[] = [
    { id: '1', name: 'Maria Silva', attendanceRate: 85, status: null, avatar: 'MS' },
    { id: '2', name: 'João Santos', attendanceRate: 85, status: null, avatar: 'JS' },
    { id: '3', name: 'Ana Souza', attendanceRate: 89, status: null, avatar: 'AS' },
    { id: '4', name: 'Ana Maria', attendanceRate: 85, status: null, avatar: 'AM' },
    { id: '5', name: 'Rurio Eiutos', attendanceRate: 83, status: null, avatar: 'RE' },
    { id: '6', name: 'Ermo Celhario', attendanceRate: 85, status: null, avatar: 'EC' },
];

const GroupManagement: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { groups } = useData();
    const { addNotification } = useNotifications();
    const group = groups.find(g => g.id === id);

    const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
    const [message, setMessage] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState({
        whatsapp: true,
        email: true,
        sms: false
    });

    // Accordion states
    const [showAttachments, setShowAttachments] = useState(true);
    const [showMessageHistory, setShowMessageHistory] = useState(true);

    if (!group) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">Grupo não encontrado</h2>
                <button onClick={() => navigate('/groups')} className="mt-4 text-blue-600 hover:underline">
                    Voltar para Grupos
                </button>
            </div>
        );
    }

    const handleAttendance = (participantId: string, status: 'present' | 'absent' | 'excused') => {
        setParticipants(prev => prev.map(p =>
            p.id === participantId ? { ...p, status } : p
        ));
    };

    const handleRemoveParticipant = (participantId: string) => {
        if (window.confirm('Tem certeza que deseja remover este participante do grupo?')) {
            setParticipants(prev => prev.filter(p => p.id !== participantId));
            addNotification({
                type: 'success',
                title: 'Participante removido',
                message: 'O participante foi removido do grupo com sucesso.'
            });
        }
    };

    const handleBatchSend = async () => {
        if (!message.trim() && !urlInput.trim()) {
            addNotification({
                type: 'alert',
                title: 'Mensagem vazia',
                message: 'Por favor, digite uma mensagem ou insira um link.'
            });
            return;
        }

        setIsSending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        addNotification({
            type: 'success',
            title: 'Enviado com sucesso',
            message: `Mensagem enviada para ${participants.length} participantes.`
        });

        setMessage('');
        setUrlInput('');
        setIsSending(false);
    };

    const handleGenerateWhatsAppLink = () => {
        if (!message.trim()) {
            addNotification({
                type: 'alert',
                title: 'Mensagem vazia',
                message: 'Digite uma mensagem para gerar o link.'
            });
            return;
        }
        const encodedMessage = encodeURIComponent(message);
        const waLink = `https://wa.me/?text=${encodedMessage}`;
        window.open(waLink, '_blank');
        addNotification({
            type: 'success',
            title: 'Link Gerado',
            message: 'WhatsApp aberto com a mensagem pronta.'
        });
    };

    const getUrlType = (url: string) => {
        if (!url) return null;
        // Simple regex for YouTube/Vimeo
        const videoRegex = /(youtube\.com|youtu\.be|vimeo\.com)/i;
        return videoRegex.test(url) ? 'video' : 'news';
    };

    const urlType = getUrlType(urlInput);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${group.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {group.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 text-sm">
                        <Users size={16} /> {participants.length} participantes • {group.schedule}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/groups')}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                >
                    Voltar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Participants */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Users size={20} className="text-blue-600" />
                                Participantes do Grupo ({participants.length})
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Taxa de Presença</th>
                                        <th className="px-6 py-4 text-center">Presença Hoje</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {participants.map((participant) => (
                                        <tr key={participant.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {participant.avatar}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{participant.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                                                        <div
                                                            className={`h-full rounded-full ${participant.attendanceRate >= 80 ? 'bg-emerald-500' :
                                                                participant.attendanceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${participant.attendanceRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{participant.attendanceRate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAttendance(participant.id, 'present')}
                                                        className={`p-2 rounded-lg transition-all ${participant.status === 'present'
                                                            ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200'
                                                            : 'text-slate-300 hover:bg-emerald-50 hover:text-emerald-500'
                                                            }`}
                                                        title="Presente"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAttendance(participant.id, 'excused')}
                                                        className={`p-2 rounded-lg transition-all ${participant.status === 'excused'
                                                            ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-200'
                                                            : 'text-slate-300 hover:bg-amber-50 hover:text-amber-500'
                                                            }`}
                                                        title="Falta Justificada"
                                                    >
                                                        <AlertCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAttendance(participant.id, 'absent')}
                                                        className={`p-2 rounded-lg transition-all ${participant.status === 'absent'
                                                            ? 'bg-red-100 text-red-600 ring-2 ring-red-200'
                                                            : 'text-slate-300 hover:bg-red-50 hover:text-red-500'
                                                            }`}
                                                        title="Falta"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Enviar Mensagem Individual"
                                                    >
                                                        <MessageSquare size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveParticipant(participant.id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remover do Grupo"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Management Panel */}
                <div className="space-y-6">
                    {/* Batch Communication */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Send size={20} className="text-blue-600" />
                            Comunicação em Lote
                        </h3>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                <Upload className="mx-auto text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" size={24} />
                                <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                                    Enviar Documento (PDF, Imagem)
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Arraste ou clique para selecionar</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Mensagem para o Grupo</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                    rows={4}
                                    placeholder="Digite sua mensagem..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Conteúdo Inteligente (Link)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="Cole um link do YouTube ou notícia..."
                                    />
                                    <div className="absolute left-3 top-2.5 text-slate-400">
                                        {urlType === 'video' ? <Youtube size={18} className="text-red-600" /> :
                                            urlType === 'news' ? <Newspaper size={18} className="text-blue-600" /> :
                                                <Paperclip size={18} />}
                                    </div>
                                </div>
                                {urlType && (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        Detectado como: <span className="font-bold">{urlType === 'video' ? 'Vídeo' : 'Notícia'}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Canais de Envio</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedChannels.whatsapp}
                                            onChange={e => setSelectedChannels({ ...selectedChannels, whatsapp: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-600">WhatsApp</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedChannels.email}
                                            onChange={e => setSelectedChannels({ ...selectedChannels, email: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-600">E-mail</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedChannels.sms}
                                            onChange={e => setSelectedChannels({ ...selectedChannels, sms: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-600">SMS</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleGenerateWhatsAppLink}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                                    title="Gerar link para enviar via WhatsApp Web/App"
                                >
                                    <MessageSquare size={18} />
                                    Link WhatsApp
                                </button>
                                <button
                                    onClick={handleBatchSend}
                                    disabled={isSending}
                                    className="flex-[2] py-3 bg-[#0054A6] hover:bg-[#004080] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Enviar na Plataforma
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Accordions */}
                    <div className="space-y-3">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setShowAttachments(!showAttachments)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                    <Paperclip size={16} /> Anexos Recentes
                                </span>
                                {showAttachments ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>
                            {showAttachments && (
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                            <span className="text-xs font-bold">PDF</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">Material_Apoio_Sessao_1.pdf</p>
                                            <p className="text-[10px] text-slate-400">Enviado há 2 dias</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setShowMessageHistory(!showMessageHistory)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                    <History size={16} /> Histórico de Mensagens
                                </span>
                                {showMessageHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>
                            {showMessageHistory && (
                                <div className="p-4 space-y-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-500 mb-1">Ontem, 14:30</p>
                                        <p className="text-sm text-slate-700">Lembrete: Nossa próxima sessão será na sala 04.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupManagement;
