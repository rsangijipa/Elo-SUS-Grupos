import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';
import { useZodForm } from '../../hooks/useZodForm';
import { LoginSchema, RegisterSchema, type RegisterFormValues } from '../../schemas';
import TermsModal from '../../components/Auth/TermsModal';
import PrivacyModal from '../../components/Auth/PrivacyModal';
import HelpModal from '../../components/Auth/HelpModal';
import RoleSwitcher from './components/RoleSwitcher';
import LoginForm from './components/LoginForm';
import AuroraCarousel from './components/AuroraCarousel';
import { toast } from 'react-hot-toast';
import { capitalizeName } from '../../utils/stringUtils';

export default function Login() {
    const navigate = useNavigate();
    const { login, register, user } = useAuth();
    const { setTheme } = useTheme();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal States
    const [activeModal, setActiveModal] = useState<'help' | 'terms' | 'privacy' | null>(null);

    const initialFormValues: RegisterFormValues = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cpf: '',
        crp: '',
        cns: '',
        role: 'patient'
    };

    const { values: formData, errors, validate, handleChange, setValues, setFieldValue, setErrors } = useZodForm<RegisterFormValues>(RegisterSchema, initialFormValues);

    // Set default role to patient on mount
    useEffect(() => {
        setTheme('patient');
        setFieldValue('role', 'patient');
    }, [setFieldValue, setTheme]);

    // Redirection useEffect based on logged in user state
    useEffect(() => {
        if (user) {
            console.log(`[Login] Redirecting user with role: ${user.role}`);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleRoleChange = (newRole: 'patient' | 'professional') => {
        setTheme(newRole);
        setFieldValue('role', newRole);
        setErrors({});
        setValues((current) => ({
            ...current,
            role: newRole,
            crp: newRole === 'professional' ? current.crp || '' : '',
            cns: newRole === 'patient' ? current.cns || '' : ''
        }));
    };

    const handleForgotPassword = async () => {
        const emailValidation = LoginSchema.pick({ email: true }).safeParse({ email: formData.email });

        if (!emailValidation.success) {
            const nextErrors: Record<string, string> = {};
            for (const issue of emailValidation.error.issues) {
                const field = issue.path[0];
                if (typeof field === 'string' && !nextErrors[field]) {
                    nextErrors[field] = issue.message;
                }
            }
            setErrors(nextErrors);
            toast.error('Informe um e-mail valido para redefinir a senha.');
            return;
        }

        try {
            await authService.sendResetPassword(formData.email.trim().toLowerCase());
            toast.success('Enviamos um link de redefinicao para o seu e-mail.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel enviar o e-mail de redefinicao.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLogin) {
            const loginValidation = LoginSchema.safeParse({ email: formData.email, password: formData.password });
            if (!loginValidation.success) {
                const nextErrors: Record<string, string> = {};
                for (const issue of loginValidation.error.issues) {
                    const field = issue.path[0];
                    if (typeof field === 'string' && !nextErrors[field]) {
                        nextErrors[field] = issue.message;
                    }
                }
                setErrors(nextErrors);
                return;
            }
        } else {
            const registerValidation = validate();
            if (!registerValidation.success) {
                toast.error('Revise os campos destacados.');
                return;
            }
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(formData.email.trim().toLowerCase(), formData.password, formData.role);
            } else {
                await register({
                    name: capitalizeName(formData.name),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    role: formData.role,
                    cpf: formData.cpf,
                    crp: formData.role === 'professional' ? formData.crp : undefined,
                    cns: formData.role === 'patient' ? formData.cns : undefined
                });
            }
        } catch (error) {
            console.error('Auth error', error);
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel concluir o acesso.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            await authService.signInWithGoogle(formData.role);
        } catch (error: any) {
            console.error('Google login error', error);
            toast.error(error.message || 'Erro no login com Google.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F8F9FC] font-sans flex items-center justify-center p-4 lg:p-8">

            {/* --- Aurora Background Blobs --- */}
            <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-[#0054A6] to-[#4E8FFF] rounded-full blur-[100px] opacity-35 animate-float-slow"></div>
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-[#00A99D] to-[#4E8FFF] rounded-full blur-[100px] opacity-35 animate-float-medium"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#F5821F] rounded-full blur-[120px] opacity-15 animate-pulse-slow"></div>

            {/* Glass Overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] z-0"></div>

            {/* --- Main Content Container --- */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 items-center">

                {/* Left Side: Carousel (Desktop Only) */}
                <div className="hidden lg:flex flex-col justify-center items-center lg:items-start order-1">
                    <AuroraCarousel />
                </div>

                {/* Mobile Header (Logo Only) */}
                <div className="lg:hidden flex flex-col items-center mb-6 order-1">
                    <div className="flex items-center gap-3">
                        <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-10 w-auto object-contain" />
                        <span className="text-2xl font-bold text-[#0054A6]">EloSUS</span>
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto order-2 px-4 md:px-0">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-[#0054A6]/10 rounded-[2rem] p-8 lg:p-10 flex flex-col transition-all duration-500 hover:shadow-[#0054A6]/20">

                        {/* Modal Overlays */}
                        {activeModal === 'help' && <HelpModal onClose={() => setActiveModal(null)} />}
                        {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
                        {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}

                        {/* Card Header */}
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="hidden lg:flex items-center gap-3 mb-6">
                                <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-10 w-auto object-contain" />
                                <h1 className="text-2xl font-bold tracking-tight text-[#0054A6]">
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

                        {/* Role Toggle */}
                        <RoleSwitcher theme={formData.role as any} onRoleChange={handleRoleChange} />

                        {/* Form */}
                        <div className="mt-6">
                            <LoginForm
                                isLogin={isLogin}
                                theme={formData.role as any}
                                formData={formData}
                                onFieldChange={handleChange}
                                errors={errors as Record<string, string>}
                                isLoading={isLoading}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                onSubmit={handleSubmit}
                                onForgotPassword={handleForgotPassword}
                            />

                            {/* Google Login Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">ou continue com</span>
                                </div>
                            </div>

                            {/* Google Login Button */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm btn-press"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Entrar com Google
                            </button>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-8 text-center space-y-4">
                            <div className="pt-2">
                                <span className="text-slate-500">
                                    {isLogin ? 'Ainda não tem cadastro? ' : 'Já possui cadastro? '}
                                </span>
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setErrors({});
                                        setValues({ ...initialFormValues, role: formData.role });
                                    }}
                                    className="font-bold text-[#0054A6] hover:text-[#003d7a] transition-colors"
                                >
                                    {isLogin ? 'Cadastre-se' : 'Fazer login'}
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60">
                                <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4">
                                    <button onClick={() => setActiveModal('terms')} className="hover:text-[#0054A6] transition-colors">Termos de Uso</button>
                                    <button onClick={() => setActiveModal('privacy')} className="hover:text-[#0054A6] transition-colors">Privacidade</button>
                                    <button onClick={() => setActiveModal('help')} className="hover:text-[#0054A6] transition-colors">Ajuda</button>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    © 2026 EloSUS Grupos — Sistema Único de Saúde
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animation Injection for Blobs */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, 40px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-30px, 20px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
                }
                .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 8s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
