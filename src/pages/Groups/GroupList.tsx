import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Users, ArrowRight, MapPin, Clock, X, BarChart3, MoreHorizontal, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import AddGroupModal from '../../components/Modals/AddGroupModal';

const GroupList: React.FC = () => {
    const { groups, loading, refreshData } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleDeleteGroup = async (groupId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
            try {
                const { groupService } = await import('../../services/groupService');
                await groupService.delete(groupId);
                await refreshData();
                setActivePopover(null);
            } catch (error) {
                console.error('Error deleting group:', error);
                alert('Erro ao excluir grupo.');
            }
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    // Mock stats generator (since backend doesn't provide this yet)
    const getGroupStats = (groupId: string) => {
        // Deterministic mock based on ID char code
        const seed = groupId.charCodeAt(0);
        const attendance = 60 + (seed % 35); // 60-95%
        return {
            participants: 10 + (seed % 15),
            attendance,
            sessions: 4 + (seed % 8)
        };
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Grupos Terapêuticos</h2>
                    <p className="text-slate-500 mt-1">
                        Gerencie os grupos ativos e suas configurações.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#0054A6] text-white px-5 py-2.5 rounded-lg hover:bg-[#004080] transition-all shadow-sm hover:shadow-md font-medium"
                >
                    <Plus size={20} />
                    Novo Grupo
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou descrição..."
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0054A6] rounded-full animate-spin"></div>
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Users className="text-slate-400" size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">Nenhum grupo encontrado.</p>
                        <p className="text-sm text-slate-400 mt-1">Tente buscar com outros termos ou crie um novo grupo.</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => {
                        const stats = getGroupStats(group.id);
                        return (
                            <div key={group.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col relative">
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0054A6] uppercase tracking-wide">
                                            Grupo Terapêutico
                                        </span>
                                        <span className={`w-2.5 h-2.5 rounded-full ${group.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} title={group.status === 'active' ? 'Ativo' : 'Inativo'}></span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0054A6] transition-colors">
                                        {group.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                        {group.description || 'Sem descrição definida.'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-50">
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
                                            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#0054A6] transition-colors ${activePopover === group.id ? 'text-[#0054A6]' : 'text-slate-400'}`}
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

                                    <button
                                        onClick={() => navigate(`/groups/${group.id}/manage`)}
                                        className="flex items-center gap-1 text-sm font-bold text-[#0054A6] hover:text-[#004080] transition-colors"
                                    >
                                        Gerenciar <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <AddGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default GroupList;
