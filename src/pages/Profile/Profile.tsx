import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, FileText, Save, Shield, HeartPulse } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            updateProfile(formData);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Meu Perfil</h2>
                <p className="text-slate-500 mt-1">Gerencie suas informações pessoais e profissionais.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-sm">
                        {user.avatar || user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                        <p className="text-slate-500 flex items-center gap-2 text-sm">
                            <Mail size={14} /> {user.email}
                        </p>
                        <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase">
                            {user.role === 'professional' ? 'Profissional' : 'Paciente'}
                        </span>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                {/* General Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <User size={18} className="text-blue-600" /> Informações Gerais
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    placeholder="Rua, Número, Bairro, Cidade"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Specific Fields */}
                {user.role === 'professional' ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Shield size={18} className="text-purple-600" /> Dados Profissionais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CRP</label>
                                <input
                                    type="text"
                                    name="crp"
                                    value={formData.crp || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Abordagem Teórica</label>
                                <select
                                    name="approach"
                                    value={formData.approach || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="TCC">Terapia Cognitivo-Comportamental (TCC)</option>
                                    <option value="ABA">Análise do Comportamento Aplicada (ABA)</option>
                                    <option value="Psicanalise">Psicanálise</option>
                                    <option value="Gestalt">Gestalt-Terapia</option>
                                    <option value="Humanista">Humanista</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Minibiografia</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Fale um pouco sobre sua experiência..."
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <HeartPulse size={18} className="text-red-500" /> Contato de Emergência
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Contato</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.emergencyContact?.name || ''}
                                    onChange={handleEmergencyChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.emergencyContact?.phone || ''}
                                    onChange={handleEmergencyChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grau de Parentesco</label>
                                <input
                                    type="text"
                                    name="relation"
                                    value={formData.emergencyContact?.relation || ''}
                                    onChange={handleEmergencyChange}
                                    placeholder="Ex: Mãe, Pai, Cônjuge"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70"
                    >
                        <Save size={20} />
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
