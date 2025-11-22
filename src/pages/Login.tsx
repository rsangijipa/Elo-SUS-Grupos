import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';
import {
    Users,
    BarChart3,
    Clock,
    Stethoscope,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    X
} from 'lucide-react';

// Componente de Logo (Adaptado para usar a imagem)
const LogoEloSUS = () => (
    <div className="flex items-center gap-3 mb-6">
        <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md p-1">
            <img src="/elosusgrupos_logo.png" alt="Logo EloSUS" className="w-full h-full object-contain" />
        </div>
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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Falha ao fazer login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">

            {/* Main Container - Card Style similar to NeuroElo */}
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[650px]">

                {/* LEFT SIDE - Value Proposition (Fundo Azul Claro como no exemplo) */}
                <div className="w-full lg:w-3/5 bg-slate-50/80 p-8 md:p-12 flex flex-col relative overflow-hidden">

                    {/* Elementos decorativos de fundo */}
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

                        {/* Grid de Features inspirado no NeuroElo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FeatureCard
                                icon={Users}
                                title="Grupos Padronizados"
                                description="Cadastre roteiros de grupos, registros de presença e objetivos terapêuticos."
                                colorClass="bg-rose-100 text-rose-600"
                            />
                            <FeatureCard
                                icon={BarChart3}
                                title="Indicadores e Relatórios"
                                description="Acompanhe frequência, faltas e produção para a gestão municipal."
                                colorClass="bg-blue-100 text-blue-600"
                            />
                            <FeatureCard
                                icon={Clock}
                                title="Listas de Espera"
                                description="Organize entrada, saída e fila de usuários por serviço de forma prática."
                                colorClass="bg-amber-100 text-amber-600"
                            />
                            <FeatureCard
                                icon={Stethoscope}
                                title="Equipe Multiprofissional"
                                description="PSI, TO, FONO e coordenação visualizam os mesmos dados integrados."
                                colorClass="bg-emerald-100 text-emerald-600"
                            />
                        </div>

                        <div className="mt-auto pt-8 text-xs text-slate-400">
                            Desenvolvido por profissionais de Psicologia para a prática em saúde pública.
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Login Form */}
                <div className="w-full lg:w-2/5 bg-white p-8 md:p-16 flex flex-col justify-center relative">

                    <div className="max-w-sm mx-auto w-full">
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Entrar</h2>
                        <p className="text-slate-500 text-sm mb-8">
                            Acesse sua plataforma com segurança.
                        </p>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                                <X size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 ml-1">Email Profissional</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all sm:text-sm"
                                        placeholder="seu@email.com.br"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-medium text-slate-700">Senha</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all sm:text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Acessando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Entrar na Plataforma <ArrowRight size={16} />
                                    </span>
                                )}
                            </button>

                        </form>

                        {/* Footer Links */}
                        <div className="mt-8 space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white text-slate-400">Opções de acesso</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 text-center text-sm">
                                <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                    Novo(a) usuário(a)? Clique para se cadastrar.
                                </button>
                                <button className="text-slate-400 hover:text-slate-600 text-xs transition-colors">
                                    Esqueci minha senha
                                </button>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-10 p-3 bg-emerald-50 rounded-lg flex items-start gap-3 border border-emerald-100">
                            <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-700 leading-tight">
                                Ambiente seguro e restrito a profissionais autorizados da rede de saúde.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
