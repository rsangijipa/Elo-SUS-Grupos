import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Lock, Mail, ArrowRight, Activity, ShieldCheck, User, Eye, EyeOff, HelpCircle, Send, X } from 'lucide-react';
import { supportService } from '../../services/supportService';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { addNotification } = useNotifications();
    const { theme, setTheme, getThemeColors } = useTheme();
    const colors = getThemeColors();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        crp: '',
        cns: ''
    });

    const [helpData, setHelpData] = useState({
        name: '',
        surname: '',
        email: '',
        message: ''
    });

    // Set default role to patient on mount
    useEffect(() => {
        setTheme('patient');
    }, []);

    const handleRoleChange = (newRole: 'patient' | 'professional') => {
        setTheme(newRole);
    };

    const handleHelpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const subject = `Suporte EloSUS - ${helpData.name} ${helpData.surname}`;
        const body = `Nome: ${helpData.name} ${helpData.surname}\nEmail: ${helpData.email}\n\nMensagem:\n${helpData.message}`;

        // Construct mailto link
        const mailtoLink = `mailto:doll.ricardoll@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open email client
        window.location.href = mailtoLink;

        setIsHelpOpen(false);
        setHelpData({ name: '', surname: '', email: '', message: '' });

        addNotification({
            type: 'success',
            title: 'Cliente de email aberto',
            message: 'Por favor, envie o email através do seu aplicativo padrão.'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password, theme);
                addNotification({
                    type: 'success',
                    title: 'Bem-vindo de volta!',
                    message: 'Login realizado com sucesso.'
                });
                navigate('/dashboard');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('As senhas não coincidem');
                }
                if (formData.password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres');
                }

                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: theme,
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
        <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-700 bg-gradient-to-br ${colors.gradient}`}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex min-h-[650px] animate-fade-in relative border border-white/50">

                {/* Left Side - Brand & Visuals */}
                <div className={`hidden lg:flex w-1/2 relative overflow-hidden p-12 flex-col justify-between transition-colors duration-700 ${theme === 'patient' ? 'bg-purple-50' : 'bg-blue-50'}`}>

                    {/* Content */}
                    <div className="relative z-10">
                        <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-16 mb-8 object-contain w-auto" />

                        <h1 className="text-4xl font-bold leading-tight mb-6 text-slate-800">
                            Cuidar de você <br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme === 'patient' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-600'}`}>
                                começa aqui.
                            </span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Seu espaço pessoal de saúde mental no SUS, feito para acompanhar sua jornada com leveza e acolhimento.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 flex justify-center">
                        <img src="/elosusgrupos_setting_login.png" alt="Grupo Terapêutico" className="max-w-full h-auto object-contain drop-shadow-xl rounded-2xl" />
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative bg-white/50">

                    <div className="max-w-md mx-auto w-full relative">

                        {/* Inline Help Card Overlay */}
                        {isHelpOpen && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 animate-fade-in border border-white/40 shadow-lg">
                                <div className="w-full h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <HelpCircle size={20} className={theme === 'patient' ? 'text-purple-500' : 'text-blue-500'} />
                                            Suporte
                                        </h3>
                                        <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleHelpSubmit} className="flex-1 flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Nome"
                                                required
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                                                style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                                                value={helpData.name}
                                                onChange={e => setHelpData({ ...helpData, name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Sobrenome"
                                                required
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                                                style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                                                value={helpData.surname}
                                                onChange={e => setHelpData({ ...helpData, surname: e.target.value })}
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Seu email"
                                            required
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                                            style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                                            value={helpData.email}
                                            onChange={e => setHelpData({ ...helpData, email: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Como podemos ajudar?"
                                            required
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all resize-none"
                                            style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                                            value={helpData.message}
                                            onChange={e => setHelpData({ ...helpData, message: e.target.value })}
                                        />
                                        <button
                                            type="submit"
                                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-auto ${theme === 'patient' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                        >
                                            Enviar Mensagem <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                {isLogin ? 'Entre no seu espaço' : 'Crie sua conta'}
                            </h2>
                            <p className="text-slate-500">
                                {isLogin ? 'Escolha seu perfil para continuar.' : 'Preencha seus dados para começar.'}
                            </p>
                        </div>

                        {/* Role Toggle - Patient First */}
                        <div className="bg-slate-100/50 p-1.5 rounded-2xl flex mb-8 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => handleRoleChange('patient')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${theme === 'patient'
                                    ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                            >
                                <User size={18} />
                                Paciente
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleChange('professional')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${theme === 'professional'
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                            >
                                <Activity size={18} />
                                Profissional
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1 animate-fade-in">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            style={{ '--tw-ring-color': theme === 'patient' ? '#d8b4fe' : '#93c5fd' } as React.CSSProperties}
                                            placeholder="Nome Completo"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        style={{ '--tw-ring-color': theme === 'patient' ? '#d8b4fe' : '#93c5fd' } as React.CSSProperties}
                                        placeholder={theme === 'professional' ? "seu.email@saude.gov.br" : "seu.email@exemplo.com"}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!isLogin && theme === 'professional' && (
                                <div className="space-y-1 animate-fade-in">
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            placeholder="Registro Profissional (CRP/CRM)"
                                            value={formData.crp}
                                            onChange={e => setFormData({ ...formData, crp: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {!isLogin && theme === 'patient' && (
                                <div className="space-y-1 animate-fade-in">
                                    <div className="relative group">
                                        <Activity className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            placeholder="Cartão Nacional de Saúde (CNS)"
                                            value={formData.cns}
                                            onChange={e => setFormData({ ...formData, cns: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        style={{ '--tw-ring-color': theme === 'patient' ? '#d8b4fe' : '#93c5fd' } as React.CSSProperties}
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
                            </div>

                            {!isLogin && (
                                <div className="space-y-1 animate-fade-in">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            style={{ '--tw-ring-color': theme === 'patient' ? '#d8b4fe' : '#93c5fd' } as React.CSSProperties}
                                            placeholder="Confirmar Senha"
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsHelpOpen(true)}
                                    className={`text-sm font-medium transition-colors ${theme === 'patient' ? 'text-purple-600 hover:text-purple-700' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                    Esqueceu?
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
                                        {isLogin ? 'Entrar' : 'Criar Conta'}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-500 italic">
                                    "Cada dia é uma oportunidade de se sentir melhor. Estamos aqui com você."
                                </p>
                            </div>

                            <div className="pt-2">
                                <span className="text-slate-500">
                                    {isLogin ? 'Novo por aqui? ' : 'Já tem uma conta? '}
                                </span>
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className={`font-bold transition-colors ${theme === 'patient' ? 'text-purple-600 hover:text-purple-700' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                    {isLogin ? 'Crie sua conta' : 'Faça login'}
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-center gap-6 text-xs text-slate-400">
                                    <a href="#" className="hover:text-slate-600 transition-colors">Termos</a>
                                    <a href="#" className="hover:text-slate-600 transition-colors">Privacidade</a>
                                    <button onClick={() => setIsHelpOpen(true)} className="hover:text-slate-600 transition-colors">Suporte</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
