import React, { useState, useEffect } from 'react';
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
    X,
    UserPlus,
    Save
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { groupService } from '../../services/groupService';
import { attendanceService } from '../../services/attendanceService';
import type { Patient } from '../../types/patient';
import AddParticipantModal from '../../components/Modals/AddParticipantModal';

interface Participant extends Omit<Patient, 'status'> {
    attendanceRate?: number; // Calculated dynamically
    status?: 'present' | 'absent' | 'excused' | null; // For current session
    patientStatus?: 'active' | 'waiting' | 'inactive'; // Renamed original status
}

const GroupManagement: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { groups } = useData();
    const { addNotification } = useNotifications();
    const group = groups.find(g => g.id === id);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Messaging
    const [message, setMessage] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [selectedChannels, setSelectedChannels] = useState({
        whatsapp: true,
        email: true,
        sms: false
    });
    // Selection for batch actions
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

    // Accordion states
    const [showAttachments, setShowAttachments] = useState(true);
    const [showMessageHistory, setShowMessageHistory] = useState(true);

    useEffect(() => {
        if (id) {
            loadParticipants();
        }
    }, [id]);

    const loadParticipants = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await groupService.getParticipants(id);
            // Initialize status as null for the current session
            // TODO: Calculate attendanceRate based on historical sessions
            const participantsWithStatus = data.map(p => ({
                ...p,
                status: null,
                attendanceRate: 0 // Placeholder
            }));
            setParticipants(participantsWithStatus);
            // Select all by default for messaging
            setSelectedParticipantIds(participantsWithStatus.map(p => p.id!));
        } catch (error) {
            console.error("Error loading participants:", error);
            addNotification({
                type: 'alert',
                title: 'Erro',
                message: 'Falha ao carregar participantes.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddParticipant = async (patientId: string) => {
        if (!id) return;
        try {
            await groupService.addParticipant(id, patientId);
            addNotification({
                type: 'success',
                title: 'Sucesso',
                message: 'Participante adicionado ao grupo.'
            });
            await loadParticipants(); // Reload list
        } catch (error) {
            console.error("Error adding participant:", error);
            addNotification({
                type: 'alert',
                title: 'Erro',
                message: 'Falha ao adicionar participante.'
            });
        }
    };

    const handleRemoveParticipant = async (participantId: string) => {
        if (!id) return;
        if (window.confirm('Tem certeza que deseja remover este participante do grupo?')) {
            try {
                await groupService.removeParticipant(id, participantId);
                setParticipants(prev => prev.filter(p => p.id !== participantId));
                addNotification({
                    type: 'success',
                    title: 'Participante removido',
                    message: 'O participante foi removido do grupo com sucesso.'
                });
            } catch (error) {
                console.error("Error removing participant:", error);
                addNotification({
                    type: 'alert',
                    title: 'Erro',
                    message: 'Falha ao remover participante.'
                });
            }
        }
    };

    const handleAttendance = (participantId: string, status: 'present' | 'absent' | 'excused') => {
        setParticipants(prev => prev.map(p =>
            p.id === participantId ? { ...p, status } : p
        ));
    };

    const handleSaveSession = async () => {
        if (!id) return;

        // Check if at least one attendance is marked
        const hasAttendance = participants.some(p => p.status !== null);
        if (!hasAttendance) {
            addNotification({
                type: 'alert',
                title: 'Atenção',
                message: 'Marque a presença de pelo menos um participante.'
            });
            return;
        }

        try {
            const attendanceList: Record<string, any> = {};
            participants.forEach(p => {
                if (p.id && p.status) {
                    attendanceList[p.id] = {
                        status: p.status,
                        notes: '' // Could add notes field later
                    };
                }
            });

            await attendanceService.saveSession(id, {
                date: new Date().toISOString(),
                attendanceList
            });

            addNotification({
                type: 'success',
                title: 'Sessão Salva',
                message: 'A presença foi registrada com sucesso.'
            });

            // Reset statuses or navigate away? 
            // Usually we might want to keep them visible or clear them.
            // For now, let's keep them as visual confirmation.
        } catch (error) {
            console.error("Error saving session:", error);
            addNotification({
                type: 'alert',
                title: 'Erro',
                message: 'Falha ao salvar sessão.'
            });
        }
    };

    const handleBatchSend = () => {
        if (!message.trim() && !urlInput.trim()) {
            addNotification({
                type: 'alert',
                title: 'Mensagem vazia',
                message: 'Por favor, digite uma mensagem ou insira um link.'
            });
            return;
        }

        if (selectedParticipantIds.length === 0) {
            addNotification({
                type: 'alert',
                title: 'Nenhum selecionado',
                message: 'Selecione pelo menos um participante.'
            });
            return;
        }

        const fullMessage = `${message} ${urlInput}`.trim();
        const encodedMessage = encodeURIComponent(fullMessage);

        let sentCount = 0;
        participants.forEach(p => {
            if (p.id && selectedParticipantIds.includes(p.id) && p.phone) {
                // Open WhatsApp for each selected participant
                // Note: Browsers might block multiple popups. 
                // A better UX might be to show a list of links to click, but the requirement was "open a new tab".
                // We'll try to open them.
                const phone = p.phone.replace(/\D/g, '');
                window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
                sentCount++;
            }
        });

        if (sentCount > 0) {
            addNotification({
                type: 'success',
                title: 'Enviado',
                message: `Abriu WhatsApp para ${sentCount} participantes.`
            });
            setMessage('');
            setUrlInput('');
        } else {
            addNotification({
                type: 'alert',
                title: 'Atenção',
                message: 'Nenhum participante selecionado possui telefone válido.'
            });
        }
    };

    const handleGenerateWhatsAppLink = () => {
        // Group link (broadcast)
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
    };

    const toggleSelection = (id: string) => {
        setSelectedParticipantIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const getUrlType = (url: string) => {
        if (!url) return null;
        const videoRegex = /(youtube\.com|youtu\.be|vimeo\.com)/i;
        return videoRegex.test(url) ? 'video' : 'news';
    };

    const urlType = getUrlType(urlInput);

    const handleToggleStatus = async () => {
        if (!group || !id) return;

        const newStatus = group.status === 'active' ? 'closed' : 'active';
        const confirmMessage = newStatus === 'closed'
            ? 'Tem certeza que deseja encerrar as atividades deste grupo? Os dados serão preservados, mas não será possível realizar novas chamadas.'
            : 'Deseja reativar este grupo?';

        if (window.confirm(confirmMessage)) {
            try {
                await groupService.update(id, { status: newStatus });
                addNotification({
                    type: 'success',
                    title: 'Status atualizado',
                    message: `Grupo ${newStatus === 'active' ? 'reativado' : 'encerrado'} com sucesso.`
                });
                // Force reload or update local state via context if possible, 
                // but for now we rely on the real-time listener or parent refresh if implemented.
                // Since useData provides groups, it should auto-update if it listens to Firestore.
            } catch (error) {
                console.error("Error updating group status:", error);
                addNotification({
                    type: 'alert',
                    title: 'Erro',
                    message: 'Falha ao atualizar status do grupo.'
                });
            }
        }
    };

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

    const isGroupClosed = group.status === 'closed';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${group.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {group.status === 'active' ? 'ATIVO' : 'ENCERRADO'}
                        </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 text-sm">
                        <Users size={16} /> {participants.length} participantes • {group.schedule}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleToggleStatus}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${group.status === 'active'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                    >
                        {group.status === 'active' ? 'Encerrar Atividades' : 'Reativar Grupo'}
                    </button>
                    <button
                        onClick={() => navigate('/groups')}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        Voltar
                    </button>
                </div>
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
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveSession}
                                    disabled={isGroupClosed}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${isGroupClosed
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                        }`}
                                >
                                    <CheckCircle2 size={16} />
                                    Iniciar Sessão Agora
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    disabled={isGroupClosed}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${isGroupClosed
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                >
                                    <UserPlus size={16} />
                                    Adicionar
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedParticipantIds.length === participants.length && participants.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedParticipantIds(participants.map(p => p.id!));
                                                    else setSelectedParticipantIds([]);
                                                }}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Taxa de Presença</th>
                                        <th className="px-6 py-4 text-center">Presença Hoje</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">Carregando participantes...</td>
                                        </tr>
                                    ) : participants.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum participante neste grupo.</td>
                                        </tr>
                                    ) : (
                                        participants.map((participant) => (
                                            <tr key={participant.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedParticipantIds.includes(participant.id!)}
                                                        onChange={() => toggleSelection(participant.id!)}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                            {participant.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-slate-900 block">{participant.name}</span>
                                                            <span className="text-xs text-slate-400">{participant.phone}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                                                            <div
                                                                className={`h-full rounded-full ${participant.attendanceRate! >= 80 ? 'bg-emerald-500' :
                                                                    participant.attendanceRate! >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${participant.attendanceRate || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600">{participant.attendanceRate || 0}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleAttendance(participant.id!, 'present')}
                                                            className={`p-2 rounded-lg transition-all ${participant.status === 'present'
                                                                ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200'
                                                                : 'text-slate-300 hover:bg-emerald-50 hover:text-emerald-500'
                                                                }`}
                                                            title="Presente"
                                                        >
                                                            <CheckCircle2 size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendance(participant.id!, 'excused')}
                                                            className={`p-2 rounded-lg transition-all ${participant.status === 'excused'
                                                                ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-200'
                                                                : 'text-slate-300 hover:bg-amber-50 hover:text-amber-500'
                                                                }`}
                                                            title="Falta Justificada"
                                                        >
                                                            <AlertCircle size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendance(participant.id!, 'absent')}
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
                                                            onClick={() => handleRemoveParticipant(participant.id!)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remover do Grupo"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
                                    Link Geral
                                </button>
                                <button
                                    onClick={handleBatchSend}
                                    className="flex-[2] py-3 bg-[#0054A6] hover:bg-[#004080] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Enviar ({selectedParticipantIds.length})
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

            <AddParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddParticipant}
                currentParticipantIds={participants.map(p => p.id!)}
            />
        </div >
    );
};

export default GroupManagement;
