import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import TermsModal from '../../components/Auth/TermsModal';
import PrivacyModal from '../../components/Auth/PrivacyModal';
import HelpModal from '../../components/Auth/HelpModal';
import RoleSwitcher from './components/RoleSwitcher';
import LoginForm from './components/LoginForm';

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
                            <h1 className="text-4xl lg:text-5xl font-bold text-brand-text leading-[1.15]">
                                Cuidar de você <br />
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme === 'patient' ? 'from-brand-patient to-brand-secondary-pink' : 'from-brand-professional to-brand-secondary-cyan'}`}>
                                    começa aqui.
                                </span>
                            </h1>
                            <p className="text-lg lg:text-xl text-brand-text-muted font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                                Seu espaço pessoal de saúde mental no SUS, feito para acompanhar sua jornada com leveza e acolhimento.
                            </p>
                        </div>

                        {/* Illustration Container */}
                        <div className="relative flex justify-center lg:justify-start w-full max-w-md mx-auto lg:mx-0">
                            {/* Background Glow */}
                            <div className={`
                                absolute inset-0 rounded-full blur-3xl opacity-40 transform scale-110
                                ${theme === 'patient' ? 'bg-gradient-to-tr from-brand-secondary-orange/30 to-brand-secondary-pink/30' : 'bg-gradient-to-tr from-brand-professional-light/30 to-brand-secondary-cyan/30'}
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
                            <h1 className="text-2xl font-bold tracking-tight text-brand-professional">
                                EloSUS <span className="text-slate-700">Grupos</span>
                            </h1>
                        </div>

                        <h2 className="text-3xl font-bold text-brand-text mb-2">
                            {isLogin ? 'Entre no seu espaço' : 'Crie sua conta'}
                        </h2>
                        <p className="text-brand-text-muted font-medium">
                            {isLogin ? 'Escolha seu perfil para continuar.' : 'Preencha seus dados para começar.'}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <RoleSwitcher theme={theme} onRoleChange={handleRoleChange} />

                    {/* Form */}
                    <LoginForm
                        isLogin={isLogin}
                        theme={theme}
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isLoading={isLoading}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        onSubmit={handleSubmit}
                        onForgotPassword={() => setActiveModal('help')}
                    />

                    <div className="mt-8 text-center space-y-4">
                        <div className="pt-2">
                            <span className="text-slate-500">
                                {isLogin ? 'Ainda não tem cadastro? ' : 'Já possui cadastro? '}
                            </span>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className={`font-bold transition-colors ${theme === 'patient' ? 'text-brand-patient hover:text-brand-patient-dark' : 'text-brand-professional hover:text-brand-professional-dark'}`}
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
