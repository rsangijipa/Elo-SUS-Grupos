import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, FileText, Save, Shield, HeartPulse, AlertCircle, Award } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.role === 'patient' ? (user as any).phone : '',
                // Professional fields
                crp: user.role === 'professional' ? (user as any).crp : '',
                specialty: user.role === 'professional' ? (user as any).specialty : '',
                approach: user.role === 'professional' ? (user as any).approach : '',
                bio: user.role === 'professional' ? (user as any).bio : '',
                // Patient fields
                cns: user.role === 'patient' ? (user as any).cns : '',
                emergencyContact: user.role === 'patient' ? (user as any).emergencyContact?.name : '',
                emergencyPhone: user.role === 'patient' ? (user as any).emergencyContact?.phone : '',
                emergencyRelation: user.role === 'patient' ? (user as any).emergencyContact?.relation : '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
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

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Meu Perfil</h2>
                    <p className="text-slate-500 mt-1">Gerencie suas informações pessoais e profissionais.</p>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    {isEditing ? <Save size={18} /> : <User size={18} />}
                    {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative">
                    <div className="absolute -bottom-12 left-8 group">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 shadow-md overflow-hidden relative">
                            {formData.avatar || user.avatar ? (
                                <img src={formData.avatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.name.substring(0, 2).toUpperCase()
                            )}

                            {isEditing && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Alterar</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData((prev: any) => ({ ...prev, avatar: reader.result }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Informações Básicas</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            disabled={!isEditing}
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            disabled={true} // Email usually not editable directly
                                            value={formData.email || ''}
                                            className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            disabled={!isEditing}
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Specific Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                                {user.role === 'professional' ? 'Dados Profissionais' : 'Dados Clínicos'}
                            </h3>

                            {user.role === 'professional' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">CRP / Registro Profissional</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="crp"
                                                disabled={!isEditing}
                                                value={formData.crp || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Especialidade</label>
                                        <div className="relative">
                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="specialty"
                                                disabled={!isEditing}
                                                value={formData.specialty || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Abordagem Terapêutica</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="approach"
                                                disabled={!isEditing}
                                                value={formData.approach || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cartão SUS (CNS)</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                name="cns"
                                                disabled={!isEditing}
                                                value={formData.cns || ''}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                            <AlertCircle size={16} /> Contato de Emergência
                                        </h4>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                name="emergencyContact"
                                                placeholder="Nome do Contato"
                                                disabled={!isEditing}
                                                value={formData.emergencyContact || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white/50 transition-all text-sm"
                                            />
                                            <input
                                                type="tel"
                                                name="emergencyPhone"
                                                placeholder="Telefone do Contato"
                                                disabled={!isEditing}
                                                value={formData.emergencyPhone || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white/50 transition-all text-sm"
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
