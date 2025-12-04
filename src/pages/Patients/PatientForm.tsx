import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService } from '../../services/patientService';
import { healthUnitService } from '../../services/healthUnitService';
import { groupService } from '../../services/groupService';
import type { Patient } from '../../types/patient';
import type { HealthUnit } from '../../types/HealthUnit';
import type { Group } from '../../types/group';
import { PlusCircle, Users } from 'lucide-react';

const PatientForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);
    const [activeGroups, setActiveGroups] = useState<Group[]>([]);
    const [formData, setFormData] = useState<Partial<Patient>>({
        name: '',
        birthDate: '',
        sexo: 'M',
        cpf: '',
        cns: '',
        phone: '',
        whatsappResponsavel: '',
        nomeResponsavel: '',
        address: '',
        neighborhood: '',
        observacoes: '',
        unidadeSaudeId: '',
        status: 'active'
    });

    useEffect(() => {
        loadHealthUnits();
        if (id) {
            loadPatient(id);
            loadActiveGroups();
        }
    }, [id]);

    // Auto-select UBS based on neighborhood
    useEffect(() => {
        if (formData.neighborhood && healthUnits.length > 0 && !id) {
            const neighborhoodLower = formData.neighborhood.toLowerCase();
            const matchedUBS = healthUnits.find(ubs =>
                ubs.name.toLowerCase().includes(neighborhoodLower) ||
                ubs.address.toLowerCase().includes(neighborhoodLower)
            );

            if (matchedUBS) {
                setFormData(prev => ({ ...prev, unidadeSaudeId: matchedUBS.id }));
            }
        }
    }, [formData.neighborhood, healthUnits, id]);

    const loadHealthUnits = async () => {
        try {
            const units = await healthUnitService.getAll();
            setHealthUnits(units);
        } catch (error) {
            console.error('Error loading health units:', error);
        }
    };

    const loadPatient = async (patientId: string) => {
        try {
            const patient = await patientService.getById(patientId);
            if (patient) {
                setFormData(patient);
            }
        } catch (error) {
            console.error('Error loading patient:', error);
        }
    };

    const loadActiveGroups = async () => {
        try {
            const groups = await groupService.getAll();
            // Filter active groups. If UBS logic exists, filter by UBS too.
            // For now, just active groups.
            setActiveGroups(groups.filter(g => g.status === 'active'));
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    };

    const handleAddToGroup = async (groupId: string) => {
        if (!id) return;
        try {
            await groupService.addParticipant(groupId, id);
            toast.success('Paciente adicionado ao grupo com sucesso!');
            loadActiveGroups(); // Refresh to update counts if needed
        } catch (error) {
            console.error('Error adding to group:', error);
            toast.error('Erro ao adicionar paciente ao grupo. Verifique se há vagas.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await patientService.update(id, formData);
            } else {
                await patientService.create(formData as Patient);
            }
            navigate('/pacientes');
        } catch (error) {
            console.error('Error saving patient:', error);
            toast.error('Erro ao salvar paciente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'cpf') {
            // Apply CPF Mask: 000.000.000-00
            let v = value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            setFormData(prev => ({ ...prev, [name]: v }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/pacientes')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {id ? 'Editar Paciente' : 'Novo Paciente'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Cadastre os dados do paciente para vinculá-lo aos grupos terapêuticos.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                            placeholder="Nome completo do paciente"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                        <input
                            type="date"
                            name="birthDate"
                            required
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Sexo *</label>
                        <select
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">CNS</label>
                        <input
                            type="text"
                            name="cns"
                            value={formData.cns}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                            placeholder="Cartão Nacional de Saúde"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                        >
                            <option value="active">Ativo (Em Acompanhamento)</option>
                            <option value="waiting">Aguardando</option>
                            <option value="discharged">Alta Clínica</option>
                            <option value="dropout">Abandono</option>
                            <option value="inactive">Inativo</option>
                        </select>
                    </div>

                    {/* Address Section */}
                    <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <MapPin size={18} className="text-blue-600" />
                            Endereço e Localização
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço Completo</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                                    placeholder="Rua, Número, Complemento"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Bairro *</label>
                                <input
                                    type="text"
                                    name="neighborhood"
                                    required
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                                    placeholder="Digite o bairro para buscar UBS..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Unidade de Referência (UBS)</label>
                                <select
                                    name="unidadeSaudeId"
                                    value={formData.unidadeSaudeId}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors"
                                >
                                    <option value="">Selecione a UBS...</option>
                                    {healthUnits.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1">
                                    * Selecionada automaticamente com base no bairro.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Contato e Responsável</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Responsável</label>
                                <input
                                    type="text"
                                    name="nomeResponsavel"
                                    value={formData.nomeResponsavel}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                                    placeholder="Opcional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp do Responsável</label>
                                <input
                                    type="text"
                                    name="whatsappResponsavel"
                                    value={formData.whatsappResponsavel}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Observações</label>
                        <textarea
                            name="observacoes"
                            rows={4}
                            value={formData.observacoes}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] outline-none transition-colors placeholder:text-slate-400"
                            placeholder="Informações adicionais importantes..."
                        />
                    </div>

                    {/* Active Groups Section - Only visible in Edit Mode */}
                    {id && (
                        <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Users size={18} className="text-blue-600" />
                                Grupos Disponíveis na UBS
                            </h3>

                            {activeGroups.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">Nenhum grupo ativo encontrado no momento.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {activeGroups.map(group => {
                                        const participantCount = group.participants?.length || 0;
                                        const maxParticipants = group.maxParticipants || 10; // Default to 10 if not set
                                        const isFull = participantCount >= maxParticipants;
                                        const isParticipating = group.participants?.includes(id);

                                        if (isParticipating) return null; // Don't show if already in group (or maybe show as "Participando")

                                        return (
                                            <div key={group.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-blue-200 transition-colors bg-slate-50">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{group.schedule} • {group.room}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {participantCount}/{maxParticipants} Vagas
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={isFull}
                                                    onClick={() => handleAddToGroup(group.id)}
                                                    className={`p-2 rounded-lg transition-colors ${isFull
                                                        ? 'text-slate-300 cursor-not-allowed'
                                                        : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title={isFull ? 'Grupo Lotado' : 'Adicionar ao Grupo'}
                                                >
                                                    <PlusCircle size={20} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/pacientes')}
                        className="w-full md:w-auto px-6 py-3 md:py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors active:bg-slate-100"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 text-sm font-bold text-white bg-[#0054A6] hover:bg-[#004080] rounded-lg shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientForm;
