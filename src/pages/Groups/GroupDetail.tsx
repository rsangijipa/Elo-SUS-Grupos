import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Bell, Edit, UserPlus, Trash2 } from 'lucide-react';
import { groupService } from '../../services/groupService';
import type { Group } from '../../types/group';
import { GROUP_TYPES } from '../../types/group';
import type { Patient } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { subscriptionService } from '../../services/subscriptionService';
import type { Subscription } from '../../services/subscriptionService';
import { sessionService } from '../../services/sessionService';
import { groupNotificationService } from '../../services/groupNotificationService';
import type { Notification } from '../../types/notification';

// Sub-components
const ParticipantsTab = ({ groupId, unidadeSaudeId }: { groupId: string, unidadeSaudeId: string }) => {
    const [subscriptions, setSubscriptions] = useState<(Subscription & { patient?: Patient })[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSubscriptions();
    }, [groupId]);

    const loadSubscriptions = async () => {
        try {
            const subs = await subscriptionService.getByGroup(groupId);
            // Fetch patient details for each subscription
            const subsWithPatients = await Promise.all(subs.map(async (sub) => {
                const patient = await patientService.getById(sub.pacienteId);
                return { ...sub, patient: patient || undefined };
            }));
            setSubscriptions(subsWithPatients);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddParticipant = async (patientId: string) => {
        try {
            await subscriptionService.create({
                grupoId: groupId,
                pacienteId: patientId,
                status: 'inscrito',
                dataInscricao: new Date().toISOString(),
            });
            setShowAddModal(false);
            loadSubscriptions();
        } catch (error) {
            console.error('Error adding participant:', error);
            alert('Erro ao adicionar participante.');
        }
    };

    const handleRemoveParticipant = async (subId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este participante?')) return;
        try {
            await subscriptionService.delete(subId);
            loadSubscriptions();
        } catch (error) {
            console.error('Error removing participant:', error);
        }
    };

    const loadAvailablePatients = async () => {
        const allPatients = await patientService.getAll(unidadeSaudeId);
        // Filter out already subscribed patients
        const subscribedIds = new Set(subscriptions.map(s => s.pacienteId));
        setAvailablePatients(allPatients.filter(p => !subscribedIds.has(p.id!)));
    };

    useEffect(() => {
        if (showAddModal) {
            loadAvailablePatients();
        }
    }, [showAddModal]);

    const filteredAvailablePatients = availablePatients.filter(p =>
        p.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Participantes Inscritos ({subscriptions.length})</h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                >
                    <UserPlus size={16} />
                    Adicionar Participante
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando participantes...</div>
            ) : subscriptions.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-200">
                    Nenhum participante inscrito neste grupo.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {subscriptions.map((sub) => (
                            <li key={sub.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {sub.patient?.nomeCompleto.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{sub.patient?.nomeCompleto}</div>
                                            <div className="text-sm text-gray-500">
                                                Inscrito em: {new Date(sub.dataInscricao).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'inscrito' ? 'bg-green-100 text-green-800' :
                                            sub.status === 'lista_espera' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {sub.status === 'inscrito' ? 'Inscrito' :
                                                sub.status === 'lista_espera' ? 'Lista de Espera' : sub.status}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveParticipant(sub.id!)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Add Participant Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Participante</h3>
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                            {filteredAvailablePatients.map(patient => (
                                <div key={patient.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border border-gray-100">
                                    <span className="text-sm text-gray-700">{patient.nomeCompleto}</span>
                                    <button
                                        onClick={() => handleAddParticipant(patient.id!)}
                                        className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            ))}
                            {filteredAvailablePatients.length === 0 && (
                                <p className="text-sm text-gray-500 text-center">Nenhum paciente encontrado.</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SessionsTab = ({ groupId }: { groupId: string }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadSessions();
    }, [groupId]);

    const loadSessions = async () => {
        try {
            const data = await sessionService.getByGroup(groupId);
            setSessions(data);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSessions = async () => {
        if (!window.confirm('Deseja gerar sessões automaticamente com base nas configurações do grupo?')) return;

        setGenerating(true);
        try {
            const group = await groupService.getById(groupId);
            if (group) {
                const count = await sessionService.generateSessions(group);
                alert(`${count} sessões geradas com sucesso!`);
                loadSessions();
            }
        } catch (error) {
            console.error('Error generating sessions:', error);
            alert('Erro ao gerar sessões.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sessões do Grupo ({sessions.length})</h3>
                <button
                    onClick={handleGenerateSessions}
                    disabled={generating}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50"
                >
                    <Calendar size={16} />
                    {generating ? 'Gerando...' : 'Gerar Sessões'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando sessões...</div>
            ) : sessions.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-200">
                    Nenhuma sessão agendada. Clique em "Gerar Sessões" para criar o cronograma automaticamente.
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-900">
                                    {new Date(session.data).toLocaleDateString('pt-BR')}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${session.status === 'realizada' ? 'bg-green-100 text-green-800' :
                                    session.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                {session.horarioInicio} - {session.horarioFim}
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                                {session.salaOuLocal}
                            </div>
                            <button className="w-full text-center text-sm text-primary border border-primary rounded py-1 hover:bg-primary hover:text-white transition-colors">
                                Gerenciar Sessão
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const NotificationsTab = ({ groupId }: { groupId: string }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [groupId]);

    const loadNotifications = async () => {
        try {
            const data = await groupNotificationService.getByGroup(groupId);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async () => {
        const message = prompt('Digite a mensagem para enviar ao grupo:');
        if (!message) return;

        try {
            await groupNotificationService.sendNotification(groupId, message);
            alert('Notificação enviada com sucesso!');
            loadNotifications();
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Erro ao enviar notificação.');
        }
    };

    return (
        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Notificações Enviadas ({notifications.length})</h3>
                <button
                    onClick={handleSendNotification}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                >
                    <Bell size={16} />
                    Nova Notificação
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando notificações...</div>
            ) : notifications.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-200">
                    Nenhuma notificação enviada para este grupo.
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${notification.tipo === 'whatsapp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {notification.tipo}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(notification.dataEnvio).toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <p className="text-gray-800 text-sm">{notification.mensagem}</p>
                            <div className="mt-2 flex justify-end">
                                <span className={`text-xs font-medium ${notification.status === 'enviada' ? 'text-green-600' :
                                    notification.status === 'falha' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                    {notification.status === 'enviada' ? 'Enviada' :
                                        notification.status === 'falha' ? 'Falha no envio' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'participants' | 'sessions' | 'notifications'>('participants');

    useEffect(() => {
        if (id) {
            loadGroup(id);
        }
    }, [id]);

    const loadGroup = async (groupId: string) => {
        try {
            const data = await groupService.getById(groupId);
            setGroup(data);
        } catch (error) {
            console.error('Error loading group:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Carregando detalhes do grupo...</div>;
    }

    if (!group) {
        return <div className="p-8 text-center text-gray-500">Grupo não encontrado.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/grupos')} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-800">{group.titulo}</h2>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${group.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {group.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-gray-500 mt-1">{GROUP_TYPES[group.tipoGrupo]}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/grupos/editar/${group.id}`)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Edit size={16} />
                        Editar
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                    <div>
                        <span className="block font-medium text-gray-900">Horário Padrão</span>
                        {group.diaSemanaPadrao !== undefined && ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][group.diaSemanaPadrao]} às {group.horarioInicioPadrao}
                    </div>
                    <div>
                        <span className="block font-medium text-gray-900">Periodicidade</span>
                        <span className="capitalize">{group.periodicidade}</span>
                    </div>
                    <div>
                        <span className="block font-medium text-gray-900">Capacidade</span>
                        {group.capacidadeMaxima} participantes
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'participants'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Users size={18} />
                            Participantes
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'sessions'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Calendar size={18} />
                            Sessões
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'notifications'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Bell size={18} />
                            Notificações
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'participants' && <ParticipantsTab groupId={group.id!} unidadeSaudeId={group.unidadeSaudeId} />}
                    {activeTab === 'sessions' && <SessionsTab groupId={group.id!} />}
                    {activeTab === 'notifications' && <NotificationsTab groupId={group.id!} />}
                </div>
            </div>
        </div>
    );
};

export default GroupDetail;
