import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import TermsModal from '../../components/Auth/TermsModal';
import PrivacyModal from '../../components/Auth/PrivacyModal';
import HelpModal from '../../components/Auth/HelpModal';
import RoleSwitcher from './components/RoleSwitcher';
import LoginForm from './components/LoginForm';
import AuroraCarousel from './components/AuroraCarousel';
import { seedDatabase } from '../../utils/seedDatabase';
import { toast } from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { addNotification } = useNotifications();
    const { theme, setTheme, getThemeColors } = useTheme();
    // Note: getThemeColors might return old palette, but we are overriding with Aurora palette for the container.

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

        // Check for seed param
        const params = new URLSearchParams(window.location.search);
        if (params.get('seed') === 'true') {
            const runSeed = async () => {
                toast.loading('Populando banco de dados...', { id: 'seed-toast' });
                const success = await seedDatabase();
                if (success) {
                    toast.success('Banco populado com sucesso!', { id: 'seed-toast' });
                } else {
                    toast.error('Erro ao popular banco.', { id: 'seed-toast' });
                }
            };
            runSeed();
        }
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

                // RBAC Redirection Logic
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
                const userData = userDoc.data();

                addNotification({
                    type: 'success',
                    title: 'Bem-vindo de volta!',
                    message: 'Login realizado com sucesso.'
                });

                if (userData?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
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
        <div className="min-h-screen relative overflow-hidden bg-[#F8F9FC] font-sans flex items-center justify-center p-4 lg:p-8">

            {/* --- Aurora Background Blobs --- */}
            {/* Blob 1: Top Left (Purple/Blue) */}
            <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-[#7A5CFF] to-[#4E8FFF] rounded-full blur-[100px] opacity-40 animate-float-slow"></div>

            {/* Blob 2: Bottom Right (Green/Blue) */}
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-[#5EE6C8] to-[#4E8FFF] rounded-full blur-[100px] opacity-40 animate-float-medium"></div>

            {/* Blob 3: Center (Pink) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FFB7D5] rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>

            {/* Glass Overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] z-0"></div>

            {/* --- Main Content Container --- */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 items-center">

                {/* Left Side: Carousel (Desktop Only / Adapted Mobile) */}
                <div className="hidden lg:flex flex-col justify-center items-center lg:items-start order-1">
                    <AuroraCarousel />
                </div>

                {/* Mobile Header (Logo Only) */}
                <div className="lg:hidden flex flex-col items-center mb-6 order-1">
                    <div className="flex items-center gap-3">
                        <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-10 w-auto object-contain" />
                        <span className="text-2xl font-bold text-[#7A5CFF]">EloSUS</span>
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto order-2 px-4 md:px-0">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-[#7A5CFF]/10 rounded-[2rem] p-8 lg:p-10 flex flex-col transition-all duration-500 hover:shadow-[#7A5CFF]/20">

                        {/* Modal Overlays */}
                        {activeModal === 'help' && <HelpModal onClose={() => setActiveModal(null)} />}
                        {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
                        {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}

                        {/* Card Header */}
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="hidden lg:flex items-center gap-3 mb-6">
                                <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-10 w-auto object-contain" />
                                <h1 className="text-2xl font-bold tracking-tight text-[#7A5CFF]">
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
                        <RoleSwitcher theme={theme} onRoleChange={handleRoleChange} />

                        {/* Form */}
                        <div className="mt-6">
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
                                onClick={async () => {
                                    try {
                                        setIsLoading(true);
                                        await authService.signInWithGoogle();

                                        // RBAC Redirection Logic for Google Login
                                        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
                                        const userData = userDoc.data();

                                        addNotification({
                                            type: 'success',
                                            title: 'Login realizado!',
                                            message: 'Bem-vindo ao EloSUS.'
                                        });

                                        if (userData?.role === 'admin') {
                                            navigate('/admin');
                                        } else {
                                            navigate('/dashboard');
                                        }
                                    } catch (error: any) {
                                        addNotification({
                                            type: 'alert',
                                            title: 'Erro no login',
                                            message: error.message || 'Não foi possível entrar com Google.'
                                        });
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
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
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-bold text-[#7A5CFF] hover:text-[#6c4df0] transition-colors"
                                >
                                    {isLogin ? 'Cadastre-se' : 'Fazer login'}
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60">
                                <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4">
                                    <button onClick={() => setActiveModal('terms')} className="hover:text-[#7A5CFF] transition-colors">Termos de Uso</button>
                                    <button onClick={() => setActiveModal('privacy')} className="hover:text-[#7A5CFF] transition-colors">Privacidade</button>
                                    <button onClick={() => setActiveModal('help')} className="hover:text-[#7A5CFF] transition-colors">Ajuda</button>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    © 2025 EloSUS Grupos - Todos os direitos reservados
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
