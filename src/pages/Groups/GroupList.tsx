import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { GROUP_TYPES } from '../../types/group';
import type { Group } from '../../types/group';
import { useAuth } from '../../contexts/AuthContext';

const GroupList: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadGroups();
    }, [userProfile]);

    const loadGroups = async () => {
        try {
            const data = await groupService.getAll(userProfile?.unidadeSaudeId);
            setGroups(data);
        } catch (error) {
            console.error('Error loading groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        GROUP_TYPES[g.tipoGrupo].toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Grupos Terapêuticos</h2>
                    <p className="text-slate-500 mt-1">
                        Gerencie os grupos ativos e suas configurações.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/grupos/novo')}
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
                        placeholder="Buscar por título ou tipo de grupo..."
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
                    filteredGroups.map((group) => (
                        <div key={group.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0054A6] uppercase tracking-wide">
                                        {GROUP_TYPES[group.tipoGrupo]}
                                    </span>
                                    <span className={`w-2.5 h-2.5 rounded-full ${group.ativo ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} title={group.ativo ? 'Ativo' : 'Inativo'}></span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0054A6] transition-colors">
                                    {group.titulo}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                    {group.descricao || 'Sem descrição definida.'}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">{group.capacidadeMaxima}</span> vagas
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Activity size={16} className="text-slate-400" />
                                        <span className="capitalize">{group.periodicidade}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    {group.diaSemanaPadrao !== undefined ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][group.diaSemanaPadrao] : '-'} • {group.horarioInicioPadrao}
                                </span>
                                <button
                                    onClick={() => navigate(`/grupos/${group.id}`)}
                                    className="flex items-center gap-1 text-sm font-bold text-[#0054A6] hover:text-[#004080] transition-colors"
                                >
                                    Gerenciar <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GroupList;
