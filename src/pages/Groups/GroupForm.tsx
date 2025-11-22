import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { GROUP_TYPES } from '../../types/group';
import type { Group } from '../../types/group';
import { useAuth } from '../../contexts/AuthContext';

const GroupForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Group>>({
        titulo: '',
        tipoGrupo: 'saude_mental_geral',
        descricao: '',
        unidadeSaudeId: userProfile?.unidadeSaudeId || '',
        terapeutaResponsavelId: userProfile?.uid || '',
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
                    <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-900 mb-3">Campos Específicos: Tabagismo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* These are just visual placeholders for the group configuration, 
                  actual patient data is stored in inscriptions. 
                  But if the group needs specific settings, they go here.
                  Wait, the prompt said "For each type of group, have specific fields...".
                  It listed patient-specific fields (consumption pattern, etc.).
                  Those should probably be in the PATIENT'S enrollment or profile, not the group definition.
                  However, the prompt says "Create and edit groups... For each type of group, have specific fields".
                  Maybe it means "Define which fields are required for patients in this group"?
                  Or maybe it means the group itself has specific metadata?
                  The examples "Gestational age", "Consumption pattern" are definitely patient data.
                  So here in GroupForm, maybe we just define the structure?
                  Or maybe the prompt implies that when adding a patient to this group, those fields appear.
                  I will assume these are NOT group fields, but I will add a note or configuration if needed.
                  Actually, re-reading: "For each type of group, have specific fields, for example: Smoking cessation: consumption pattern..."
                  This likely refers to the Patient's data context within that group.
                  But for the Group Creation itself, maybe we just select the type.
                  I will stick to standard group fields here.
              */}
                            <p className="text-sm text-blue-700 col-span-2">
                                Este tipo de grupo habilitará campos específicos na ficha do paciente:
                                <br />- Padrão de consumo
                                <br />- Tentativas prévias
                                <br />- Uso de medicamentos
                            </p>
                        </div>
                    </div>
                );
            case 'gestantes':
                return (
                    <div className="col-span-2 bg-pink-50 p-4 rounded-lg border border-pink-100">
                        <h4 className="font-medium text-pink-900 mb-3">Campos Específicos: Gestantes</h4>
                        <p className="text-sm text-pink-700">
                            Habilitará campos: Idade gestacional, UBS de referência, Risco gestacional.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/grupos')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                    {id ? 'Editar Grupo' : 'Novo Grupo Terapêutico'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Título do Grupo *</label>
                        <input
                            type="text"
                            name="titulo"
                            required
                            value={formData.titulo}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                            placeholder="Ex: Grupo de Tabagismo - UBS Central"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Grupo *</label>
                        <select
                            name="tipoGrupo"
                            value={formData.tipoGrupo}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        >
                            {Object.entries(GROUP_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacidade Máxima</label>
                        <input
                            type="number"
                            name="capacidadeMaxima"
                            value={formData.capacidadeMaxima}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Descrição / Objetivos</label>
                        <textarea
                            name="descricao"
                            rows={3}
                            value={formData.descricao}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                        <input
                            type="date"
                            name="dataInicio"
                            required
                            value={formData.dataInicio}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Periodicidade</label>
                        <select
                            name="periodicidade"
                            value={formData.periodicidade}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        >
                            <option value="semanal">Semanal</option>
                            <option value="quinzenal">Quinzenal</option>
                            <option value="mensal">Mensal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dia da Semana Padrão</label>
                        <select
                            name="diaSemanaPadrao"
                            value={formData.diaSemanaPadrao}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
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
                        <label className="block text-sm font-medium text-gray-700">Horário Início</label>
                        <input
                            type="time"
                            name="horarioInicioPadrao"
                            value={formData.horarioInicioPadrao}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        />
                    </div>

                    {renderDynamicFields()}

                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/grupos')}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
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
