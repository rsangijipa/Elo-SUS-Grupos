import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { User, Mail, Phone, MapPin, Save, Shield, HeartPulse, Award, Camera, Loader2, Lock, FileText } from 'lucide-react';
import AvatarSelector from '../../components/Profile/AvatarSelector';
import SecuritySettings from '../../components/Profile/SecuritySettings';
import { toast } from 'react-hot-toast';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { addNotification } = useNotifications();

    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'clinical' | 'security'>('personal');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar,
                // Professional fields
                crp: user.role === 'professional' ? (user as any).crp || '' : '',
                specialty: user.role === 'professional' ? (user as any).specialty || '' : '',
                approach: user.role === 'professional' ? (user as any).approach || '' : '',
                bio: user.role === 'professional' ? (user as any).bio || '' : '',
                // Patient fields
                cns: user.role === 'patient' ? (user as any).cns || '' : '',
                emergencyContact: user.role === 'patient' ? (user as any).emergencyContact || '' : '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    // Masks
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        setFormData((prev: any) => ({ ...prev, phone: value }));
        setIsDirty(true);
    };

    const handleCnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1 $2');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        setFormData((prev: any) => ({ ...prev, cns: value }));
        setIsDirty(true);
    };

    const handleAvatarSelect = (newAvatar: string) => {
        setFormData((prev: any) => ({ ...prev, avatar: newAvatar }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!isDirty) return;
        setIsSaving(true);
        try {
            await updateProfile(formData);
            toast.success('Perfil atualizado com sucesso!');
            setIsDirty(false);
        } catch (error) {
            toast.error('Erro ao salvar perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C4FFE]"></div>
            </div>
        );
    }

    const isProfessional = user.role === 'professional';

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-800 mb-8">Meu Perfil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- LEFT COLUMN: IDENTITY CARD --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-lg shadow-purple-500/5 border border-purple-100 overflow-hidden relative">
                        {/* Background Pattern */}
                        <div className="h-32 bg-gradient-to-br from-[#7A5CFF] to-[#4E8FFF]">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                        </div>

                        <div className="px-6 pb-8 text-center -mt-16 relative z-10">
                            {/* Avatar */}
                            <div className="relative inline-block group">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-xl overflow-hidden cursor-pointer transition-transform hover:scale-105" onClick={() => setIsAvatarModalOpen(true)}>
                                    {formData.avatar ? (
                                        <img
                                            src={formData.avatar.startsWith('avatar_perfil') ? `/${formData.avatar}.png` : formData.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="absolute bottom-1 right-1 p-2 bg-[#6C4FFE] text-white rounded-full shadow-md hover:bg-[#5b41d9] transition-colors border-2 border-white"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 mt-4">{user.name}</h2>
                            <p className="text-slate-500 text-sm font-medium">{user.email}</p>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-3 ${isProfessional ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {isProfessional ? <Award size={14} /> : <HeartPulse size={14} />}
                                {isProfessional ? 'Profissional' : 'Paciente'}
                            </div>

                            {/* Gamification Stats */}
                            {!isProfessional && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-slate-600">Nível {Math.floor(((user as any).stats?.totalSessions || 0) / 5) + 1}</span>
                                        <span className="text-purple-600 font-bold">{(user as any).stats?.totalSessions || 0} Sessões</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#7A5CFF] to-[#4E8FFF]" style={{ width: `${(((user as any).stats?.totalSessions || 0) % 5) * 20}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Continue participando para subir de nível!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: MANAGEMENT --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'personal' ? 'bg-[#6C4FFE] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            Dados Pessoais
                        </button>
                        <button
                            onClick={() => setActiveTab('clinical')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'clinical' ? 'bg-[#6C4FFE] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            {isProfessional ? 'Dados Profissionais' : 'Dados Clínicos'}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-[#6C4FFE] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            Segurança
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="animate-fade-in">
                        {activeTab === 'personal' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Telefone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone || ''}
                                                onChange={handlePhoneChange}
                                                maxLength={15}
                                                placeholder="(00) 00000-0000"
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={formData.email || ''}
                                                disabled
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Endereço</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address || ''}
                                                onChange={handleChange}
                                                placeholder="Rua, Número, Bairro, Cidade - UF"
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'clinical' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                                {isProfessional ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">CRP / Registro</label>
                                            <input
                                                type="text"
                                                name="crp"
                                                value={formData.crp || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Especialidade</label>
                                            <input
                                                type="text"
                                                name="specialty"
                                                value={formData.specialty || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bio</label>
                                            <textarea
                                                name="bio"
                                                rows={4}
                                                value={formData.bio || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium resize-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-slate-600">
                                                <Shield size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Cartão Nacional de Saúde (CNS)</label>
                                                <input
                                                    type="text"
                                                    name="cns"
                                                    value={formData.cns || ''}
                                                    onChange={handleCnsChange}
                                                    maxLength={18}
                                                    placeholder="000 0000 0000 0000"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-lg tracking-wide font-bold text-slate-700"
                                                />
                                                <p className="text-xs text-slate-400 mt-2">O número do CNS é essencial para a integração com o SUS.</p>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                            <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                                                <HeartPulse size={20} /> Contato de Emergência
                                            </h4>
                                            <input
                                                type="text"
                                                name="emergencyContact"
                                                value={formData.emergencyContact || ''}
                                                onChange={handleChange}
                                                placeholder="Nome e Telefone (Ex: Maria - Mãe 11 99999-9999)"
                                                className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <SecuritySettings />
                        )}
                    </div>

                    {/* Floating Save Button (Only for Personal/Clinical tabs) */}
                    {activeTab !== 'security' && (
                        <div className={`fixed bottom-6 right-6 transition-all duration-300 transform ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-8 py-4 bg-[#6C4FFE] text-white font-bold rounded-full shadow-xl hover:bg-[#5b41d9] hover:scale-105 transition-all"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AvatarSelector
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatar={formData.avatar}
                onSelect={handleAvatarSelect}
            />
        </div>
    );
};

export default Profile;
