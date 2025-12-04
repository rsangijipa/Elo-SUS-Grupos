import React from 'react';
import { Lock, Mail, ArrowRight, Activity, ShieldCheck, User, Eye, EyeOff, FileText } from 'lucide-react';

interface LoginFormProps {
    isLogin: boolean;
    theme: string;
    formData: any;
    setFormData: (data: any) => void;
    errors: any;
    isLoading: boolean;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
    isLogin,
    theme,
    formData,
    setFormData,
    errors,
    isLoading,
    showPassword,
    setShowPassword,
    onSubmit,
    onForgotPassword
}) => {
    const getRingColor = (error?: string) => {
        if (error) return '#fecaca';
        return theme === 'patient' ? '#d8b4fe' : '#93c5fd';
    };

    const getIconColor = () => {
        return theme === 'patient' ? '#6C4FFE' : '#0054A6';
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Nome Completo</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                        <input
                            type="text"
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                            style={{ '--tw-ring-color': getRingColor(errors.name) } as React.CSSProperties}
                            placeholder="Digite seu nome completo"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name}</p>}
                </div>
            )}

            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">CPF</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            style={{ '--tw-ring-color': getRingColor() } as React.CSSProperties}
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 ml-1">E-mail</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                    <input
                        type="email"
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                        style={{ '--tw-ring-color': getRingColor(errors.email) } as React.CSSProperties}
                        placeholder={theme === 'professional' ? "seu.email@saude.gov.br" : "seu.email@exemplo.com"}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                {errors.email && <p className="text-red-500 text-xs ml-1 font-medium">{errors.email}</p>}
            </div>

            {!isLogin && theme === 'professional' && (
                <div className="space-y-1 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Registro Profissional</label>
                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-professional transition-colors" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-professional/50 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="CRP/CRM"
                            value={formData.crp}
                            onChange={e => setFormData({ ...formData, crp: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {!isLogin && theme === 'patient' && (
                <div className="space-y-1 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Cartão SUS (CNS)</label>
                    <div className="relative group">
                        <Activity className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-patient transition-colors" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-patient/50 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="Número do CNS"
                            value={formData.cns}
                            onChange={e => setFormData({ ...formData, cns: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Senha</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                        style={{ '--tw-ring-color': getRingColor(errors.password) } as React.CSSProperties}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1 font-medium">{errors.password}</p>}
            </div>

            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Confirmar Senha</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                            style={{ '--tw-ring-color': getRingColor(errors.confirmPassword) } as React.CSSProperties}
                            placeholder="Repita a senha"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs ml-1 font-medium">{errors.confirmPassword}</p>}
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className={`text-sm font-medium transition-colors ${theme === 'patient' ? 'text-brand-patient hover:text-brand-patient-dark' : 'text-brand-professional hover:text-brand-professional-dark'}`}
                >
                    Esqueceu a senha?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-black/5 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] ${theme === 'patient'
                    ? 'bg-[#6C4FFE] hover:bg-[#5B3FD9] text-white shadow-purple-200'
                    : 'bg-[#0054A6] hover:bg-[#003F7D] text-white shadow-blue-200'
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        {isLogin ? 'Acessar Sistema' : 'Criar Minha Conta'}
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
