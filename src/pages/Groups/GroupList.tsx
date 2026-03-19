
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Plus, Search, Users, ArrowRight, MapPin, Clock, X, MoreHorizontal,
    Trash2, LayoutGrid, List, Play, AlertTriangle, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import AddGroupModal from '../../components/Modals/AddGroupModal';
import StatusBadge from '../../components/Common/StatusBadge';
import { Group, GroupProtocol, GroupStatus } from '../../types/group';
import { toast } from 'react-hot-toast';

/* ——— Protocol color mapping ——— */
const protocolColors: Record<GroupProtocol, { bg: string; text: string; label: string }> = {
    STANDARD: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Padrão' },
    TABAGISMO: { bg: 'bg-red-50', text: 'text-red-700', label: 'Tabagismo' },
    GESTANTE: { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Gestante' },
    ANSIEDADE_DEPRESSAO: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Ansiedade / Depressão' },
};

const statusOptions: { value: GroupStatus | ''; label: string }[] = [
    { value: '', label: 'Todos os Status' },
    { value: 'active', label: 'Ativo' },
    { value: 'planned', label: 'Planejado' },
    { value: 'completed', label: 'Concluído' },
    { value: 'archived', label: 'Arquivado' },
    { value: 'paused', label: 'Pausado' },
    { value: 'closed', label: 'Encerrado' },
];

const protocolOptions: { value: GroupProtocol | ''; label: string }[] = [
    { value: '', label: 'Todos os Protocolos' },
    { value: 'STANDARD', label: 'Padrão' },
    { value: 'TABAGISMO', label: 'Tabagismo' },
    { value: 'GESTANTE', label: 'Gestante' },
    { value: 'ANSIEDADE_DEPRESSAO', label: 'Ansiedade / Depressão' },
];

const GroupList: React.FC = () => {
    const { groups, patients, loading, refreshData, fetchGroups } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<GroupStatus | ''>('');
    const [protocolFilter, setProtocolFilter] = useState<GroupProtocol | ''>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('elo_groupViewMode') as 'grid' | 'list') || 'grid';
    });
    const popoverRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        localStorage.setItem('elo_groupViewMode', viewMode);
    }, [viewMode]);

    const handleDeleteGroup = async (groupId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
            try {
                const { groupService } = await import('../../services/groupService');
                await groupService.delete(groupId);
                await refreshData();
                setActivePopover(null);
            } catch (error) {
                console.error('Error deleting group:', error);
                toast.error('Erro ao excluir grupo.');
            }
        }
    };

    /* ——— Filtering ——— */
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            const matchesSearch = searchTerm === '' ||
                g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === '' || g.status === statusFilter;
            const matchesProtocol = protocolFilter === '' || g.protocol === protocolFilter;
            return matchesSearch && matchesStatus && matchesProtocol;
        });
    }, [groups, searchTerm, statusFilter, protocolFilter]);

    /* ——— Counters ——— */
    const activeCount = groups.filter(g => g.status === 'active').length;
    const plannedCount = groups.filter(g => g.status === 'planned').length;

    /* ——— Risk check: any patient in the group with riskLevel HIGH ——— */
    const groupHasRisk = (group: Group): boolean => {
        if (!group.participants?.length) return false;
        return patients.some(p =>
            p.id != null && group.participants!.includes(p.id) && p.riskLevel === 'HIGH'
        );
    };

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const togglePopover = (e: React.MouseEvent, groupId: string) => {
        e.stopPropagation();
        setActivePopover(activePopover === groupId ? null : groupId);
    };

    // Stats generator
    const getGroupStats = (group: Group) => {
        const realParticipants = group.participants?.length || 0;
        const seed = group.id.charCodeAt(0);
        const attendance = 60 + (seed % 35);

        return {
            participants: realParticipants,
            attendance,
            sessions: 4 + (seed % 8)
        };
    };

    const getProtocol = (group: Group) =>
        protocolColors[group.protocol] || protocolColors.STANDARD;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Grupos Terapêuticos</h2>
                    <p className="text-slate-500 mt-1 flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-status-active" />
                            {activeCount} ativo{activeCount !== 1 ? 's' : ''}
                        </span>
                        {plannedCount > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-status-waiting" />
                                {plannedCount} planejado{plannedCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-professional text-white px-5 py-2.5 rounded-lg hover:bg-brand-professional-dark transition-all shadow-sm hover:shadow-md font-medium"
                >
                    <Plus size={20} />
                    Novo Grupo
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            id="group-search"
                            type="text"
                            placeholder="Buscar por nome ou descrição..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-professional focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as GroupStatus | '')}
                            className="pl-9 pr-8 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-professional focus:border-transparent outline-none text-sm appearance-none cursor-pointer min-w-[170px]"
                            aria-label="Filtrar por status"
                        >
                            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {/* Protocol filter */}
                    <select
                        value={protocolFilter}
                        onChange={(e) => setProtocolFilter(e.target.value as GroupProtocol | '')}
                        className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-professional focus:border-transparent outline-none text-sm appearance-none cursor-pointer min-w-[190px]"
                        aria-label="Filtrar por protocolo"
                    >
                        {protocolOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {/* View toggle */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-brand-professional text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                            aria-label="Visualização em grade"
                            title="Grade"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-brand-professional text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                            aria-label="Visualização em lista"
                            title="Lista"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-professional rounded-full animate-spin"></div>
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Users className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhum grupo encontrado.</p>
                    <p className="text-sm text-slate-400 mt-1">Tente buscar com outros termos ou crie um novo grupo.</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* ========== GRID VIEW ========== */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => {
                        const stats = getGroupStats(group);
                        const protocol = getProtocol(group);
                        const hasRisk = groupHasRisk(group);
                        const maxPart = group.maxParticipants || 20;
                        const occupancy = Math.min(100, Math.round((stats.participants / maxPart) * 100));

                        return (
                            <div key={group.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col relative">
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4 gap-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${protocol.bg} ${protocol.text}`}>
                                            {protocol.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {hasRisk && (
                                                <span title="Paciente com risco alto neste grupo">
                                                    <AlertTriangle size={16} className="text-red-500" />
                                                </span>
                                            )}
                                            <StatusBadge status={group.status} />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-professional transition-colors">
                                        {group.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                        {group.description || 'Sem descrição definida.'}
                                    </p>

                                    {/* Occupancy bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-slate-500">{stats.participants}/{maxPart} participantes</span>
                                            <span className={`font-bold ${occupancy >= 90 ? 'text-red-600' : occupancy >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{occupancy}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${occupancy}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span className="font-medium text-slate-700">{group.room}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-slate-400" />
                                            <span className="capitalize">{group.schedule}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors relative">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => togglePopover(e, group.id)}
                                            aria-label="Detalhes do grupo"
                                            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-brand-professional transition-colors ${activePopover === group.id ? 'text-brand-professional' : 'text-slate-400'}`}
                                        >
                                            Ver Detalhes
                                            {activePopover === group.id ? <X size={14} /> : <MoreHorizontal size={14} />}
                                        </button>

                                        {/* Popover */}
                                        {activePopover === group.id && (
                                            <div
                                                ref={popoverRef}
                                                className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-fade-in"
                                            >
                                                <h4 className="font-bold text-slate-800 mb-3 text-sm border-b border-slate-50 pb-2">Resumo do Grupo</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-500">Participantes</span>
                                                        <span className="text-sm font-bold text-slate-700">{stats.participants}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-500">Sessões Realizadas</span>
                                                        <span className="text-sm font-bold text-slate-700">{stats.sessions}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs text-slate-500">Taxa de Presença</span>
                                                            <span className={`text-xs font-bold ${stats.attendance >= 80 ? 'text-emerald-600' :
                                                                stats.attendance >= 60 ? 'text-amber-600' : 'text-red-600'
                                                                }`}>{stats.attendance}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${stats.attendance >= 80 ? 'bg-emerald-500' :
                                                                    stats.attendance >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${stats.attendance}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroup(group.id);
                                                    }}
                                                    className="w-full mt-3 pt-2 border-t border-slate-50 text-left text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Excluir Grupo
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {group.status === 'active' && (
                                            <button
                                                onClick={() => navigate(`/session/${group.id}`)}
                                                title="Iniciar sessão"
                                                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Play size={14} /> Sessão
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/groups/${group.id}/manage`)}
                                            className="flex items-center gap-1 text-sm font-bold text-brand-professional hover:text-brand-professional-dark transition-colors"
                                        >
                                            Acessar <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ========== LIST VIEW ========== */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider text-left">
                                <tr>
                                    <th className="px-6 py-4">Grupo</th>
                                    <th className="px-6 py-4">Protocolo</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Participantes</th>
                                    <th className="px-6 py-4">Horário</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredGroups.map((group) => {
                                    const stats = getGroupStats(group);
                                    const protocol = getProtocol(group);
                                    const hasRisk = groupHasRisk(group);
                                    const maxPart = group.maxParticipants || 20;

                                    return (
                                        <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {hasRisk && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                                                    <div>
                                                        <p className="font-bold text-slate-800">{group.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{group.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${protocol.bg} ${protocol.text}`}>
                                                    {protocol.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={group.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-700">{stats.participants}/{maxPart}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 capitalize">{group.schedule}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {group.status === 'active' && (
                                                        <button
                                                            onClick={() => navigate(`/session/${group.id}`)}
                                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Play size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/groups/${group.id}/manage`)}
                                                        className="text-xs font-bold text-brand-professional bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Acessar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                                        aria-label={`Excluir grupo ${group.name}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default GroupList;
