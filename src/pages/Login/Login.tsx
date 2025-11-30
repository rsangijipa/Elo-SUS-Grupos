import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Lock, Mail, ArrowRight, Activity, ShieldCheck, User, Eye, EyeOff, FileText } from 'lucide-react';
import TermsModal from '../../components/Auth/TermsModal';
import PrivacyModal from '../../components/Auth/PrivacyModal';
import HelpModal from '../../components/Auth/HelpModal';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { addNotification } = useNotifications();
    const { theme, setTheme, getThemeColors } = useTheme();
    const colors = getThemeColors();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal States
    const [activeModal, setActiveModal] = useState<'help' | 'terms' | 'privacy' | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cpf: '',
        crp: '',
        cns: ''
    });

    // Inline Error States
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });



    // Set default role to patient on mount
    useEffect(() => {
        setTheme('patient');
    }, []);

    const handleRoleChange = (newRole: 'patient' | 'professional') => {
        setTheme(newRole);
        setErrors({ email: '', password: '', confirmPassword: '', name: '' }); // Clear errors on role switch
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '', confirmPassword: '', name: '' };

        if (!formData.email) {
            newErrors.email = 'O e-mail é obrigatório.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Digite um e-mail válido.';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'A senha é obrigatória.';
            isValid = false;
        } else if (!isLogin && formData.password.length < 6) {
            newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
            isValid = false;
        }

        if (!isLogin) {
            if (!formData.name) {
                newErrors.name = 'O nome completo é obrigatório.';
                isValid = false;
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem.';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                addNotification({
                    type: 'success',
                    title: 'Bem-vindo de volta!',
                    message: 'Login realizado com sucesso.'
                });
                navigate('/dashboard');
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: theme,
                    cpf: formData.cpf,
                    crp: theme === 'professional' ? formData.crp : undefined,
                    cns: theme === 'patient' ? formData.cns : undefined
                });

                addNotification({
                    type: 'success',
                    title: 'Conta criada!',
                    message: 'Seu cadastro foi realizado com sucesso.'
                });
                navigate('/dashboard');
            }
        } catch (error) {
            addNotification({
                type: 'alert',
                title: 'Erro na autenticação',
                message: error instanceof Error ? error.message : 'Verifique suas credenciais e tente novamente.'
            });
        } finally {
            setIsLoading(false);
        }
    };





    return (
        <div className={`min-h-screen flex items-center justify-center p-4 lg:p-8 font-sans transition-colors duration-700 bg-gradient-to-br ${colors.gradient}`}>
            <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center relative min-h-[600px] gap-8 lg:gap-16">

                {/* Visuals - Left Side */}
                <div className={`
                    w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start text-center lg:text-left
                    transition-all duration-700 order-1
                `}>
                    <div className="max-w-lg space-y-8">
                        {/* Title */}
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-[1.15]">
                                Cuidar de você <br />
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme === 'patient' ? 'from-purple-600 to-pink-500' : 'from-blue-600 to-cyan-500'}`}>
                                    começa aqui.
                                </span>
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                                Seu espaço pessoal de saúde mental no SUS, feito para acompanhar sua jornada com leveza e acolhimento.
                            </p>
                        </div>

                        {/* Illustration Container */}
                        <div className="relative flex justify-center lg:justify-start w-full max-w-md mx-auto lg:mx-0">
                            {/* Background Glow */}
                            <div className={`
                                absolute inset-0 rounded-full blur-3xl opacity-40 transform scale-110
                                ${theme === 'patient' ? 'bg-gradient-to-tr from-orange-200 to-pink-200' : 'bg-gradient-to-tr from-blue-200 to-cyan-200'}
                            `}></div>

                            <img
                                src="/elosusgrupos_setting_login.png"
                                alt="Ilustração de grupo terapêutico"
                                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl rounded-3xl transform hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Login Card - Right Side */}
                <div className="w-full lg:w-[480px] bg-white rounded-[2rem] shadow-2xl p-8 lg:p-10 relative z-10 order-2 border border-slate-100 flex flex-col">

                    {/* Modal Overlays */}
                    {activeModal === 'help' && (
                        <HelpModal onClose={() => setActiveModal(null)} />
                    )}

                    {activeModal === 'terms' && (
                        <TermsModal onClose={() => setActiveModal(null)} />
                    )}

                    {activeModal === 'privacy' && (
                        <PrivacyModal onClose={() => setActiveModal(null)} />
                    )}

                    {/* Header with Logo */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-10 w-auto object-contain" />
                            <h1 className="text-2xl font-bold tracking-tight text-blue-600">
                                EloSUS <span className="text-slate-700">Grupos</span>
                            </h1>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            {isLogin ? 'Entre no seu espaço' : 'Crie sua conta'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isLogin ? 'Escolha seu perfil para continuar.' : 'Preencha seus dados para começar.'}
                        </p>
                    </div>

                    {/* Role Toggle - Enhanced Visibility */}
                    <div className="bg-slate-100 p-1.5 rounded-xl flex mb-8 border border-slate-200 relative">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('patient')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 ${theme === 'patient'
                                ? 'bg-white text-purple-700 shadow-md ring-1 ring-black/5 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                        >
                            <User size={18} className={theme === 'patient' ? 'stroke-[2.5px]' : ''} />
                            Paciente
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('professional')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 ${theme === 'professional'
                                ? 'bg-white text-blue-700 shadow-md ring-1 ring-black/5 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                        >
                            <Activity size={18} className={theme === 'professional' ? 'stroke-[2.5px]' : ''} />
                            Profissional
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1 animate-fade-in">
                                <label className="block text-sm font-semibold text-slate-700 ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                    <input
                                        type="text"
                                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                                        style={{ '--tw-ring-color': errors.name ? '#fecaca' : (theme === 'patient' ? '#d8b4fe' : '#93c5fd') } as React.CSSProperties}
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
                                    <FileText className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        style={{ '--tw-ring-color': theme === 'patient' ? '#d8b4fe' : '#93c5fd' } as React.CSSProperties}
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
                                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                <input
                                    type="email"
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                                    style={{ '--tw-ring-color': errors.email ? '#fecaca' : (theme === 'patient' ? '#d8b4fe' : '#93c5fd') } as React.CSSProperties}
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
                                    <ShieldCheck className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
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
                                    <Activity className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
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
                                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                                    style={{ '--tw-ring-color': errors.password ? '#fecaca' : (theme === 'patient' ? '#d8b4fe' : '#93c5fd') } as React.CSSProperties}
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
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                                        style={{ '--tw-ring-color': errors.confirmPassword ? '#fecaca' : (theme === 'patient' ? '#d8b4fe' : '#93c5fd') } as React.CSSProperties}
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
                                onClick={() => setActiveModal('help')}
                                className={`text-sm font-medium transition-colors ${theme === 'patient' ? 'text-purple-600 hover:text-purple-700' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                Esqueceu a senha?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-black/5 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] ${theme === 'patient'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
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

                    <div className="mt-8 text-center space-y-4">
                        <div className="pt-2">
                            <span className="text-slate-500">
                                {isLogin ? 'Ainda não tem cadastro? ' : 'Já possui cadastro? '}
                            </span>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className={`font-bold transition-colors ${theme === 'patient' ? 'text-purple-600 hover:text-purple-700' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                {isLogin ? 'Cadastre-se' : 'Fazer login'}
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4">
                                <button onClick={() => setActiveModal('terms')} className="hover:text-slate-600 transition-colors">Termos de Uso</button>
                                <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-600 transition-colors">Privacidade</button>
                                <button onClick={() => setActiveModal('help')} className="hover:text-slate-600 transition-colors">Ajuda</button>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                © 2025 EloSUS Grupos - Todos os direitos reservados
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
