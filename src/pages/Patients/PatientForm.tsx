import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { patientService } from '../../services/patientService';
import type { Patient } from '../../types/patient';
import { useAuth } from '../../contexts/AuthContext';

const PatientForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Patient>>({
        name: '',
        birthDate: '',
        sexo: 'M',
        cpf: '',
        cns: '',
        phone: '',
        whatsappResponsavel: '',
        nomeResponsavel: '',
        observacoes: '',
        unidadeSaudeId: 'ubs-centro',
        status: 'active'
    });

    useEffect(() => {
        if (id) {
            loadPatient(id);
        }
    }, [id]);

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
            alert('Erro ao salvar paciente.');
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
