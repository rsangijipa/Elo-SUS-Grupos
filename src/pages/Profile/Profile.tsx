import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { User, Mail, Phone, MapPin, FileText, Save, Shield, HeartPulse, AlertCircle, Award, Camera, Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { addNotification } = useNotifications();

    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile(formData);
            addNotification({
                type: 'success',
                title: 'Perfil Atualizado',
                message: 'Suas informações foram salvas com sucesso.'
            });
            setIsEditing(false);
        } catch (error) {
            addNotification({
                type: 'alert',
                title: 'Erro',
                message: 'Não foi possível salvar as alterações.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isProfessional = user.role === 'professional';

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className={`h-32 bg-gradient-to-r ${isProfessional ? 'from-blue-600 to-blue-400' : 'from-green-600 to-green-400'}`}></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-slate-400">{user.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-sm transition-colors">
                                        <Camera size={18} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    </label>
                                )}
                            </div>
                            <div className="mb-2">
                                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-1 ${isProfessional ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {isProfessional ? <Award size={14} /> : <HeartPulse size={14} />}
                                    {isProfessional ? 'Profissional de Saúde' : 'Paciente'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isEditing
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Save size={18} /> : <User size={18} />)}
                            {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* Common Fields */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Informações Pessoais</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            disabled={!isEditing}
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            disabled={true}
                                            value={formData.email || ''}
                                            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
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
                                            placeholder="(00) 00000-0000"
                                            disabled={!isEditing}
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Endereço</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="Seu endereço completo"
                                            disabled={!isEditing}
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Specific Fields */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                                {isProfessional ? 'Dados Profissionais' : 'Dados Clínicos'}
                            </h3>

                            {isProfessional ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">CRP / Registro</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="crp"
                                                disabled={!isEditing}
                                                value={formData.crp || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Especialidade</label>
                                        <div className="relative">
                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="specialty"
                                                disabled={!isEditing}
                                                value={formData.specialty || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Abordagem Terapêutica</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="approach"
                                                placeholder="Ex: TCC, Psicanálise..."
                                                disabled={!isEditing}
                                                value={formData.approach || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Bio / Sobre</label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            placeholder="Breve descrição profissional..."
                                            disabled={!isEditing}
                                            value={formData.bio || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium resize-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Cartão SUS (CNS)</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="cns"
                                                disabled={!isEditing}
                                                value={formData.cns || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                                        <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                                            <AlertCircle size={18} /> Contato de Emergência
                                        </h4>
                                        <div>
                                            <label className="block text-xs font-bold text-orange-700 mb-1.5 uppercase tracking-wide">Nome e Telefone de familiar responsável</label>
                                            <input
                                                type="text"
                                                name="emergencyContact"
                                                placeholder="Ex: Maria (Mãe) - (11) 99999-9999"
                                                disabled={!isEditing}
                                                value={formData.emergencyContact || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white/50 transition-all font-medium text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
