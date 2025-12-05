import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Mail, Phone, Calendar, MapPin, Shield, Key, Save, Camera, Edit2 } from 'lucide-react';
import { UserProfile } from '../../types/schema';
import { capitalizeName } from '../../utils/stringUtils';

const UserProfile: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        // Professional
        crp: '',
        specialty: '',
        approach: '',
        bio: '',
        // Patient
        cns: '',
        birthDate: '',
        sexo: '',
        neighborhood: '',
        emergencyContact: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                crp: user.crp || '',
                specialty: user.specialty || '',
                approach: user.approach || '',
                bio: user.bio || '',
                cns: user.cns || '',
                birthDate: user.birthDate || '',
                sexo: user.sexo || '',
                neighborhood: user.neighborhood || '',
                emergencyContact: user.emergencyContact || ''
            });
        }
    }, [user]);

    const handleAvatarChange = async (preset: string) => {
        if (!user) return;
        try {
            await userService.updateUserData(user.id, { avatar: preset });
            await updateProfile({ avatar: preset });
            toast.success('Foto de perfil atualizada!');
        } catch (error) {
            toast.error('Erro ao atualizar foto.');
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedData: Partial<UserProfile> = {
                ...formData,
                name: capitalizeName(formData.name),
                address: formData.address.trim(),
                neighborhood: formData.neighborhood.trim(),
                sexo: (formData.sexo === '' ? undefined : formData.sexo) as 'M' | 'F' | 'Outro' | undefined
            };

            await userService.updateUserData(user.id, updatedData);
            await updateProfile(updatedData);
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar alterações.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        try {
            await authService.updateUserPassword(passwordData.newPassword);
            toast.success('Senha alterada com sucesso!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            if (error.message === 'REQ_LOGIN') {
                toast.error('Por segurança, faça login novamente para alterar a senha.', {
                    duration: 5000
                });
                setTimeout(() => logout(), 2000);
            } else {
                toast.error('Erro ao alterar senha. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Avatar Popover State
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4']; // Assuming these map to assets or initials logic

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Identity Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/10 to-transparent"></div>

                        <div className="relative mb-4 group">
                            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white shadow-md overflow-hidden">
                                {user?.avatar && user.avatar.length > 2 ? (
                                    // If avatar is a URL or asset path (mock logic)
                                    <img src={`/assets/avatars/${user.avatar}.png`} alt="Avatar" className="w-full h-full object-cover" onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }} />
                                ) : (
                                    <span>{user?.name?.substring(0, 2).toUpperCase()}</span>
                                )}
                                <span className="hidden text-2xl">{user?.name?.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <button
                                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                                title="Alterar foto"
                            >
                                <Camera size={16} />
                            </button>

                            {/* Avatar Selector Popover */}
                            {showAvatarSelector && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-10 w-48 animate-fade-in">
                                    <p className="text-xs font-bold text-slate-500 mb-2">Escolher Avatar</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {avatars.map(av => (
                                            <button
                                                key={av}
                                                onClick={() => {
                                                    handleAvatarChange(av);
                                                    setShowAvatarSelector(false);
                                                }}
                                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-100 hover:ring-2 ring-blue-500 transition-all"
                                            >
                                                {/* Placeholder for avatar preview */}
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                        <div className="mt-2 flex gap-2 justify-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user?.role === 'professional' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {user?.role === 'professional' ? 'Profissional' : 'Paciente'}
                            </span>
                        </div>

                        <div className="mt-6 w-full pt-6 border-t border-slate-50 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                <span className="text-sm truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-sm">Membro desde {user?.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '2024'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Data & Security */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                        {/* Tabs Header */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'personal'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <UserIcon size={18} />
                                Dados Pessoais
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'security'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Shield size={18} />
                                Segurança
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {activeTab === 'personal' ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">E-mail</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Telefone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                    placeholder="(00) 00000-0000"
                                                />
                                            </div>
                                        </div>

                                        {/* Role Specific Fields */}
                                        {user?.role === 'professional' ? (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700">CRP / Registro</label>
                                                    <input
                                                        type="text"
                                                        value={formData.crp}
                                                        onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700">Especialidade</label>
                                                    <input
                                                        type="text"
                                                        value={formData.specialty}
                                                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-full space-y-2">
                                                    <label className="text-sm font-bold text-slate-700">Biografia Resumida</label>
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[100px]"
                                                        placeholder="Conte um pouco sobre sua experiência..."
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700">CNS (Cartão SUS)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.cns}
                                                        onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700">Data de Nascimento</label>
                                                    <input
                                                        type="date"
                                                        value={formData.birthDate}
                                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-full space-y-2">
                                                    <label className="text-sm font-bold text-slate-700">Endereço Completo</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                                        <input
                                                            type="text"
                                                            value={formData.address}
                                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-slate-50">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                                        >
                                            {isLoading ? 'Salvando...' : (
                                                <>
                                                    <Save size={18} />
                                                    Salvar Alterações
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in max-w-md mx-auto py-4">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Key size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">Alterar Senha</h3>
                                        <p className="text-sm text-slate-500">Escolha uma senha forte com pelo menos 6 caracteres.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Nova Senha</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Confirmar Nova Senha</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isLoading || !passwordData.newPassword}
                                        className="w-full mt-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
