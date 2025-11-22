import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Users,
    BarChart3,
    Clock,
    Stethoscope,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    X,
    UserPlus,
    FileBadge,
    BrainCircuit,
    ShieldPlus
} from 'lucide-react';

// Componente de Logo
const LogoEloSUS = () => (
    <div className="flex items-center gap-3 mb-6">
        <img src="/elosusgrupos_logo.png" alt="EloSUS Grupos" className="h-12 w-auto" />
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-blue-900 leading-none">
                EloSUS <span className="font-light">Grupos</span>
            </h1>
            <span className="text-xs text-blue-600 font-medium tracking-wider uppercase">
                Gestão Terapêutica
            </span>
        </div>
    </div>
);

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    colorClass: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, colorClass }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 group">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

export default function Login() {
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register States
    const [name, setName] = useState('');
    const [crp, setCrp] = useState('');
    const [approach, setApproach] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Redirect when authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            // Navigation handled by useEffect
        } catch (err) {
            setError('Falha ao fazer login. Verifique suas credenciais.');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!/^\d{2}\/\d{5}$/.test(crp)) {
            setError('Formato de CRP inválido. Use XX/XXXXX');
            return;
        }

        setIsLoading(true);
        try {
            await register({ name, email, password, crp, approach });
            setSuccessMsg('Cadastro realizado com sucesso! Entrando...');
            // Navigation handled by useEffect
        } catch (err) {
            setError('Erro ao criar conta. Tente novamente.');
            setIsLoading(false);
        }
    };

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock API call
        setTimeout(() => {
            setSuccessMsg('Link de recuperação enviado para seu email.');
            setIsLoading(false);
            setTimeout(() => {
                setMode('login');
                setSuccessMsg('');
            }, 3000);
        }, 1500);
    };

    // Mask CRP
    const handleCrpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 7) value = value.slice(0, 7);
        if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setCrp(value);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px]">

                {/* LEFT SIDE - Branding */}
                <div className="w-full lg:w-3/5 bg-slate-50/80 p-8 md:p-12 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-50 pointer-events-none"></div>

                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <LogoEloSUS />
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 leading-tight">
                            A Plataforma para gestão inteligente de <span className="text-blue-700">Grupos Terapêuticos</span> no SUS.
                        </h2>
                        <p className="text-slate-600 text-lg mb-10 max-w-lg">
                            Organize grupos, presenças e relatórios clínicos em um só lugar. Desenvolvido para a rotina dos serviços municipais.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FeatureCard icon={Users} title="Grupos Padronizados" description="Cadastre roteiros e registros de presença." colorClass="bg-rose-100 text-rose-600" />
                            <FeatureCard icon={BarChart3} title="Indicadores" description="Acompanhe frequência e produção." colorClass="bg-blue-100 text-blue-600" />
                            <FeatureCard icon={Clock} title="Listas de Espera" description="Organize a fila de usuários." colorClass="bg-amber-100 text-amber-600" />
                            <FeatureCard icon={Stethoscope} title="Equipe Multi" description="Dados integrados para a equipe." colorClass="bg-emerald-100 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Dynamic Form */}
                <div className="w-full lg:w-2/5 bg-white p-8 md:p-12 flex flex-col justify-center relative">
                    <div className="max-w-sm mx-auto w-full">

                        {/* Header Text */}
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">
                            {mode === 'login' && 'Entrar'}
                            {mode === 'register' && 'Criar Conta Profissional'}
                            {mode === 'forgot' && 'Recuperar Senha'}
                        </h2>
                        <p className="text-slate-500 text-sm mb-6">
                            {mode === 'login' && 'Acesse sua plataforma com segurança.'}
                            {mode === 'register' && 'Preencha seus dados profissionais.'}
                            {mode === 'forgot' && 'Digite seu email para receber o link.'}
                        </p>

                        {/* Alerts */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                                <X size={16} /> {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                                <CheckCircle2 size={16} /> {successMsg}
                            </div>
                        )}

                        {/* LOGIN FORM */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10 w-full py-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="seu@email.com" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10 w-full py-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-70 flex justify-center items-center gap-2">
                                    {isLoading ? 'Acessando...' : <>Entrar <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        )}

                        {/* REGISTER FORM */}
                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-3">
                                <div className="relative">
                                    <Users className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="Nome Completo" required />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="Email Profissional" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <FileBadge className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input type="text" value={crp} onChange={handleCrpChange} className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="CRP XX/XXXXX" required maxLength={9} />
                                    </div>
                                    <div className="relative">
                                        <BrainCircuit className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <select value={approach} onChange={e => setApproach(e.target.value)} className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-slate-600 text-sm" required>
                                            <option value="">Abordagem</option>
                                            <option value="TCC">TCC</option>
                                            <option value="Psicanálise">Psicanálise</option>
                                            <option value="Humanista">Humanista</option>
                                            <option value="ABA">ABA</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="Senha" required />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="Confirmar Senha" required />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex justify-center items-center gap-2">
                                    {isLoading ? 'Cadastrando...' : <>Criar Conta <UserPlus size={18} /></>}
                                </button>
                            </form>
                        )}

                        {/* FORGOT FORM */}
                        {mode === 'forgot' && (
                            <form onSubmit={handleForgot} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input type="email" className="pl-10 w-full py-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="Digite seu email cadastrado" required />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-70">
                                    {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                                </button>
                            </form>
                        )}

                        {/* Footer Actions */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-center">
                            {mode === 'login' && (
                                <>
                                    <button onClick={() => setMode('register')} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                                        Novo(a) usuário(a)? Clique para se cadastrar.
                                    </button>
                                    <button onClick={() => setMode('forgot')} className="text-slate-400 hover:text-slate-600 text-xs font-medium">
                                        Esqueci minha senha
                                    </button>
                                </>
                            )}
                            {(mode === 'register' || mode === 'forgot') && (
                                <button onClick={() => setMode('login')} className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center justify-center gap-2">
                                    <ArrowRight className="rotate-180" size={14} /> Voltar para Login
                                </button>
                            )}
                        </div>

                        <div className="mt-6 p-3 bg-emerald-50 rounded-lg flex items-start gap-3 border border-emerald-100">
                            <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-700 leading-tight">
                                Ambiente seguro e restrito a profissionais autorizados.
                            </p>
                        </div>

                        {/* Support Link */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-400">
                                Precisa de ajuda? <a href="/support" className="text-blue-500 hover:underline">doll.ricardoll@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
