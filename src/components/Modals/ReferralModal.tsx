import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, User, Building2, Activity, UserCircle, AlertTriangle, Stethoscope, CheckCircle2, Clock } from 'lucide-react';
import { referralService, Referral } from '../../services/referralService';
import { patientService } from '../../services/patientService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import PatientSearch from '../PatientSearch';
import type { Patient } from '../../types/patient';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Referral>>({
        patientName: '',
        patientCns: '',
        patientId: '',
        priority: 'normal',
        riskLevel: 'baixo',
        reason: '',
        diagnosis: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handlePatientSelect = (patient: Patient) => {
        setFormData(prev => ({
            ...prev,
            patientName: patient.name,
            patientCns: patient.cns,
            patientId: patient.id
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.patientName || !formData.reason) {
            toast.error("Preencha os campos obrigatórios (Nome e Motivo).");
            return;
        }

        setLoading(true);

        try {
            const referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'timeline'> = {
                patientName: formData.patientName,
                patientCns: formData.patientCns,
                patientId: formData.patientId || 'new',
                reason: formData.reason,
                diagnosis: formData.diagnosis,
                riskLevel: formData.riskLevel as 'baixo' | 'moderado' | 'alto',
                priority: formData.priority as 'normal' | 'urgente',
                notes: formData.notes,
                originUnitName: 'Unidade Básica', // Default or fetched from user context
                referringProfessionalRole: 'Profissional', // Default or fetched
                referringProfessionalName: user?.name || 'Profissional',
                // professionalId: user?.id || 'prof-1' // Not in interface currently, removed to match type
            };

            await referralService.create(referralData);

            addNotification({
                type: 'success',
                title: 'Encaminhamento realizado',
                message: 'O paciente foi encaminhado para triagem com sucesso.'
            });
            onClose();
            setFormData({
                patientName: '',
                patientCns: '',
                patientId: '',
                priority: 'normal',
                riskLevel: 'baixo',
                reason: '',
                diagnosis: '',
                notes: ''
            });
        } catch (error) {
            console.error("Error creating referral:", error);
            addNotification({
                type: 'alert',
                title: 'Erro',
                message: 'Falha ao criar encaminhamento.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-[#0054A6]">
                                <Building2 size={24} />
                            </div>
                            Encaminhar Paciente
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 ml-12">Preencha os dados para solicitar triagem</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                    <form id="referral-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Section: Patient Data */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <UserCircle size={16} /> Dados do Paciente
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Paciente</label>
                                    <PatientSearch
                                        onSelect={handlePatientSelect}
                                        onSearchChange={(term) => setFormData(prev => ({ ...prev, patientName: term, patientId: 'new' }))}
                                        placeholder="Digite para buscar..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email do Paciente</label>
                                    <div className="relative group">
                                        <UserCircle className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[#0054A6] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            placeholder="Buscar por email..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all font-medium"
                                            onBlur={async (e) => {
                                                const email = e.target.value;
                                                if (email && email.includes('@')) {
                                                    setLoading(true);
                                                    try {
                                                        const patients = await patientService.searchPatientsByEmail(email);
                                                        if (patients.length > 0) {
                                                            handlePatientSelect(patients[0]);
                                                            addNotification({
                                                                type: 'success',
                                                                title: 'Paciente encontrado',
                                                                message: `Dados carregados para: ${patients[0].name}`
                                                            });
                                                        } else {
                                                            addNotification({
                                                                type: 'info',
                                                                title: 'Não encontrado',
                                                                message: 'Nenhum paciente encontrado com este email.'
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error("Error searching by email:", error);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Cartão SUS (CNS)</label>
                                    <div className="relative group">
                                        <Activity className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[#0054A6] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.patientCns}
                                            onChange={e => setFormData({ ...formData, patientCns: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all font-medium"
                                            placeholder="000.0000.0000.0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Clinical Data */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Stethoscope size={16} /> Dados Clínicos
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Motivo do Encaminhamento</label>
                                    <textarea
                                        required
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all resize-none h-24"
                                        placeholder="Descreva o motivo principal..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Diagnóstico / Hipótese</label>
                                    <div className="relative group">
                                        <Activity className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[#0054A6] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.diagnosis}
                                            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all"
                                            placeholder="CID ou descrição do diagnóstico"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Risk Classification */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Classificação de Risco</label>
                                        <div className="space-y-3">
                                            {[
                                                { value: 'baixo', label: 'Baixo Risco', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
                                                { value: 'moderado', label: 'Risco Moderado', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
                                                { value: 'alto', label: 'Alto Risco', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle }
                                            ].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.riskLevel === option.value
                                                        ? `${option.color} border-current shadow-sm`
                                                        : 'border-slate-100 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="risk"
                                                        value={option.value}
                                                        checked={formData.riskLevel === option.value}
                                                        onChange={() => setFormData({ ...formData, riskLevel: option.value as any })}
                                                        className="hidden"
                                                    />
                                                    <div className={`p-2 rounded-full mr-3 ${formData.riskLevel === option.value ? 'bg-white/50' : 'bg-slate-100'}`}>
                                                        <option.icon size={18} />
                                                    </div>
                                                    <span className="font-bold">{option.label}</span>
                                                    {formData.riskLevel === option.value && (
                                                        <CheckCircle2 className="ml-auto" size={20} />
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Prioridade</label>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: 'normal' })}
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.priority === 'normal'
                                                    ? 'bg-white text-slate-800 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                <Clock size={16} /> Normal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: 'urgente' })}
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.priority === 'urgente'
                                                    ? 'bg-red-500 text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                <AlertTriangle size={16} /> Urgente
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                                            * Prioridade urgente deve ser justificada nas observações clínicas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Professional */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <UserCircle size={16} /> Profissional Solicitante
                            </h3>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-12 h-12 bg-[#0054A6] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'PR'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{user?.name || 'Profissional'}</p>
                                    <p className="text-sm text-slate-500">{user?.role === 'admin' ? 'Administrador' : 'Profissional de Saúde'}</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 p-6 border-t border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="referral-form"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-[#0054A6] to-[#004080] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>Enviando...</>
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                Confirmar Encaminhamento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
