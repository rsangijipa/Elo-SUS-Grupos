import React from 'react';
import { Lock, Mail, ArrowRight, Activity, ShieldCheck, User, Eye, EyeOff, FileText, Loader2 } from 'lucide-react';
import type { RegisterFormValues } from '../../../schemas';

interface LoginFormProps {
    isLogin: boolean;
    theme: string;
    formData: RegisterFormValues;
    onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, string>;
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
    onFieldChange,
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

    const handlePasswordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                    <label htmlFor="login-name" className="block text-sm font-semibold text-slate-700 ml-1">Nome Completo</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                        <input
                            id="login-name"
                            type="text"
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                            style={{ '--tw-ring-color': getRingColor(errors.name) } as React.CSSProperties}
                            placeholder="Digite seu nome completo"
                            name="name"
                            value={formData.name}
                            onChange={onFieldChange}
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name}</p>}
                </div>
            )}

            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                    <label htmlFor="login-cpf" className="block text-sm font-semibold text-slate-700 ml-1">CPF</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                        <input
                            id="login-cpf"
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            style={{ '--tw-ring-color': getRingColor() } as React.CSSProperties}
                            placeholder="000.000.000-00"
                            name="cpf"
                            value={formData.cpf}
                            onChange={onFieldChange}
                        />
                    </div>
                    {errors.cpf && <p className="text-red-500 text-xs ml-1 font-medium">{errors.cpf}</p>}
                </div>
            )}

            <div className="space-y-1">
                <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 ml-1">E-mail</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                    <input
                        id="login-email"
                        type="email"
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                        style={{ '--tw-ring-color': getRingColor(errors.email) } as React.CSSProperties}
                        placeholder={theme === 'professional' ? "seu.email@saude.gov.br" : "seu.email@exemplo.com"}
                        name="email"
                        value={formData.email}
                        onChange={onFieldChange}
                    />
                </div>
                {errors.email && <p className="text-red-500 text-xs ml-1 font-medium">{errors.email}</p>}
            </div>

            {!isLogin && theme === 'professional' && (
                <div className="space-y-1 animate-fade-in">
                    <label htmlFor="login-crp" className="block text-sm font-semibold text-slate-700 ml-1">Registro Profissional</label>
                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-professional transition-colors" size={20} />
                        <input
                            id="login-crp"
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-professional/50 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="CRP/CRM"
                            name="crp"
                            value={formData.crp}
                            onChange={onFieldChange}
                        />
                    </div>
                    {errors.crp && <p className="text-red-500 text-xs ml-1 font-medium">{errors.crp}</p>}
                </div>
            )}

            {!isLogin && theme === 'patient' && (
                <div className="space-y-1 animate-fade-in">
                    <label htmlFor="login-cns" className="block text-sm font-semibold text-slate-700 ml-1">Cartão SUS (CNS)</label>
                    <div className="relative group">
                        <Activity className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-patient transition-colors" size={20} />
                        <input
                            id="login-cns"
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-patient/50 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="Número do CNS"
                            name="cns"
                            value={formData.cns}
                            onChange={onFieldChange}
                        />
                    </div>
                    {errors.cns && <p className="text-red-500 text-xs ml-1 font-medium">{errors.cns}</p>}
                </div>
            )}

            <div className="space-y-1">
                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 ml-1">Senha</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                        style={{ '--tw-ring-color': getRingColor(errors.password) } as React.CSSProperties}
                        placeholder="••••••••"
                        name="password"
                        value={formData.password}
                        onChange={onFieldChange}
                        onKeyDown={handlePasswordKeyDown}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1 font-medium">{errors.password}</p>}
            </div>

            {!isLogin && (
                <div className="space-y-1 animate-fade-in">
                    <label htmlFor="login-confirm-password" className="block text-sm font-semibold text-slate-700 ml-1">Confirmar Senha</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: getIconColor() }} />
                        <input
                            id="login-confirm-password"
                            type={showPassword ? "text" : "password"}
                            className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                            style={{ '--tw-ring-color': getRingColor(errors.confirmPassword) } as React.CSSProperties}
                            placeholder="Repita a senha"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={onFieldChange}
                            onKeyDown={handlePasswordKeyDown}
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
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-black/5 transition-all flex items-center justify-center gap-2 btn-press hover:scale-[1.02] ${theme === 'patient'
                    ? 'bg-[#6C4FFE] hover:bg-[#5B3FD9] text-white shadow-purple-200'
                    : 'bg-[#0054A6] hover:bg-[#003F7D] text-white shadow-blue-200'
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        {isLogin ? 'Entrando...' : 'Criando conta...'}
                    </>
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
