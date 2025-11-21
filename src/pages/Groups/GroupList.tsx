import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { Group, GROUP_TYPES } from '../../types/group';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Grupos Terapêuticos</h2>
                <button
                    onClick={() => navigate('/grupos/novo')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus size={20} />
                    Novo Grupo
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título ou tipo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Carregando grupos...</div>
                ) : filteredGroups.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Nenhum grupo encontrado.</div>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                                            {GROUP_TYPES[group.tipoGrupo]}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900">{group.titulo}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.descricao}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Users size={16} />
                                        <span>{group.capacidadeMaxima} vagas</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${group.ativo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span>{group.ativo ? 'Ativo' : 'Inativo'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                                <button
                                    onClick={() => navigate(`/grupos/${group.id}`)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Gerenciar
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
