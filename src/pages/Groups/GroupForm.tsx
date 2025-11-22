import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { GROUP_TYPES } from '../../types/group';
import type { Group } from '../../types/group';
import { useAuth } from '../../contexts/AuthContext';

const GroupForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Group>>({
        titulo: '',
        tipoGrupo: 'saude_mental_geral',
        descricao: '',
        unidadeSaudeId: 'ubs-centro',
        terapeutaResponsavelId: user?.id || '',
        capacidadeMaxima: 15,
        publicoAlvo: '',
        dataInicio: '',
        periodicidade: 'semanal',
        diaSemanaPadrao: 1,
        horarioInicioPadrao: '14:00',
        duracaoMinutos: 60,
        ativo: true,
        camposEspecificos: {}
    });

    useEffect(() => {
        if (id) {
            loadGroup(id);
        }
    }, [id]);

    const loadGroup = async (groupId: string) => {
        try {
            const group = await groupService.getById(groupId);
            if (group) {
                setFormData(group);
            }
        } catch (error) {
            console.error('Error loading group:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await groupService.update(id, formData);
            } else {
                await groupService.create(formData as Group);
            }
            navigate('/grupos');
        } catch (error) {
            console.error('Error saving group:', error);
            alert('Erro ao salvar grupo.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const renderDynamicFields = () => {
        switch (formData.tipoGrupo) {
            case 'tabagismo':
                return (
                    <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                        <Info className="text-[#0054A6] flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-[#0054A6] text-sm mb-1">Campos Específicos: Tabagismo</h4>
                            <p className="text-sm text-blue-700">
                                Este tipo de grupo habilitará campos específicos na ficha do paciente, como padrão de consumo, tentativas prévias e uso de medicamentos.
                            </p>
                        </div>
                    </div>
                );
            case 'gestantes':
                return (
                    <div className="col-span-1 md:col-span-2 bg-pink-50 p-4 rounded-xl border border-pink-100 flex gap-3">
                        <Info className="text-pink-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-pink-700 text-sm mb-1">Campos Específicos: Gestantes</h4>
                            <p className="text-sm text-pink-600">
                                Habilitará campos como idade gestacional, UBS de referência e risco gestacional na ficha do paciente.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/grupos')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {id ? 'Editar Grupo' : 'Novo Grupo Terapêutico'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Cadastre as informações do grupo e configure seus encontros.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Título do Grupo *</label>
                        <input
                            type="text"
                            name="titulo"
                            required
                            value={formData.titulo}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                            placeholder="Ex: Grupo de Tabagismo - UBS Central"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Grupo *</label>
                        <select
                            name="tipoGrupo"
                            value={formData.tipoGrupo}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        >
                            {Object.entries(GROUP_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Capacidade Máxima</label>
                        <input
                            type="number"
                            name="capacidadeMaxima"
                            value={formData.capacidadeMaxima}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição / Objetivos</label>
                        <textarea
                            name="descricao"
                            rows={4}
                            value={formData.descricao}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                            placeholder="Descreva os objetivos terapêuticos e público-alvo..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Início *</label>
                        <input
                            type="date"
                            name="dataInicio"
                            required
                            value={formData.dataInicio}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Periodicidade</label>
                        <select
                            name="periodicidade"
                            value={formData.periodicidade}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        >
                            <option value="semanal">Semanal</option>
                            <option value="quinzenal">Quinzenal</option>
                            <option value="mensal">Mensal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Dia da Semana Padrão</label>
                        <select
                            name="diaSemanaPadrao"
                            value={formData.diaSemanaPadrao}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        >
                            <option value={1}>Segunda-feira</option>
                            <option value={2}>Terça-feira</option>
                            <option value={3}>Quarta-feira</option>
                            <option value={4}>Quinta-feira</option>
                            <option value={5}>Sexta-feira</option>
                            <option value={6}>Sábado</option>
                            <option value={0}>Domingo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Horário de Início</label>
                        <input
                            type="time"
                            name="horarioInicioPadrao"
                            value={formData.horarioInicioPadrao}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Duração (minutos)</label>
                        <input
                            type="number"
                            name="duracaoMinutos"
                            value={formData.duracaoMinutos}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                                type="checkbox"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                                className="w-5 h-5 text-[#0054A6] rounded focus:ring-[#0054A6] border-gray-300"
                            />
                            <div>
                                <span className="block text-sm font-bold text-slate-900">Grupo Ativo</span>
                                <span className="block text-xs text-slate-500">Se desmarcado, o grupo não aparecerá na lista de ativos.</span>
                            </div>
                        </label>
                    </div>

                    {renderDynamicFields()}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/grupos')}
                        className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0054A6] hover:bg-[#004080] rounded-lg shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupForm;
