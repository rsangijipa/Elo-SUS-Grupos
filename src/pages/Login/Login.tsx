import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    X,
    LifeBuoy,
    ShieldCheck,
    User,
    Heart,
    Sparkles
} from 'lucide-react';

// --- Components ---

const LogoEloSUS = ({ light = false }: { light?: boolean }) => (
    <div className="flex items-center gap-3 mb-2">
        <img src="/elosusgrupos_logo.png" alt="EloSUS Grupos" className="h-12 w-auto" />
        <div className="flex flex-col">
            <h1 className={`text-2xl font-bold leading-none ${light ? 'text-white' : 'text-[#0054A6]'}`}>
                EloSUS <span className="font-light">Grupos</span>
            </h1>
            <span className={`text-[10px] font-medium tracking-wider uppercase ${light ? 'text-blue-100' : 'text-[#0054A6]/70'}`}>
                Saúde Mental & Bem-estar
            </span>
        </div>
    </div>
);

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState<'professional' | 'patient'>('professional');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSupportModal, setShowSupportModal] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Redirect when authenticated
    useEffect(() => {
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

    return (
        <div className="min-h-screen bg-[#F6F8FE] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Noise/Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl shadow-[#0054A6]/10 overflow-hidden flex flex-col md:flex-row min-h-[650px] relative z-10">

                {/* LEFT SIDE: Hero / Emotional Connection */}
                <div className="md:w-1/2 bg-gradient-to-br from-[#6C4FFE] via-[#F5A3D3] to-[#0054A6] p-12 flex flex-col justify-between relative overflow-hidden text-white">
                    {/* Decorative Blobs */}
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#FFC857]/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <LogoEloSUS light />
                        <div className="mt-16 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium text-white mb-4">
                                <Sparkles size={16} className="text-[#FFC857]" />
                                <span>Nova Experiência EloSUS</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                                Cuidar de você <br /> começa aqui.
                            </h2>
                            <p className="text-white/90 text-lg font-medium max-w-md leading-relaxed">
                                Seu espaço pessoal de saúde mental no SUS, feito para acompanhar sua jornada com leveza e acolhimento.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-4">
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#FFC857] flex items-center justify-center text-xs font-bold text-[#0054A6]">A</div>
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#F5A3D3] flex items-center justify-center text-xs font-bold text-[#0054A6]">B</div>
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#6C4FFE] flex items-center justify-center text-xs font-bold text-white">C</div>
                            </div>
                            <div className="text-sm font-medium text-white/90 ml-2">
                                +12k pacientes conectados
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Login Form */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[#0054A6]">Entre no seu espaço</h2>
                            <p className="text-slate-400 mt-2">Escolha seu perfil para continuar.</p>
                        </div>

                        {/* Role Toggle - Modern Pill Style */}
                        <div className="flex p-1.5 bg-[#F6F8FE] rounded-2xl mb-8 relative">
                            <button
                                onClick={() => setRole('professional')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${role === 'professional'
                                    ? 'bg-white text-[#0054A6] shadow-md shadow-blue-900/5'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <ShieldCheck size={18} />
                                Profissional
                            </button>
                            <button
                                onClick={() => setRole('patient')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${role === 'patient'
                                    ? 'bg-white text-[#6C4FFE] shadow-md shadow-purple-900/5'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Heart size={18} />
                                Paciente
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                                <X size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-[#0054A6] transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-12 py-3.5 bg-[#F6F8FE] border-2 border-transparent focus:bg-white focus:border-[#0054A6]/20 rounded-xl outline-none transition-all text-slate-700 placeholder:text-slate-300 font-medium"
                                        placeholder={role === 'professional' ? "seu.nome@saude.gov.br" : "seu.email@exemplo.com"}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                                    <button onClick={() => setShowSupportModal(true)} className="text-xs font-bold text-[#0054A6] hover:text-[#004080]">Esqueceu?</button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-[#0054A6] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 py-3.5 bg-[#F6F8FE] border-2 border-transparent focus:bg-white focus:border-[#0054A6]/20 rounded-xl outline-none transition-all text-slate-700 placeholder:text-slate-300 font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6 ${role === 'professional'
                                    ? 'bg-[#0054A6] shadow-[#0054A6]/20'
                                    : 'bg-[#6C4FFE] shadow-[#6C4FFE]/20'
                                    }`}
                            >
                                {isLoading ? 'Entrando...' : <>Entrar <ArrowRight size={20} /></>}
                            </button>
                        </form>

                        {/* Emotional Banner */}
                        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-[#FFC857]/10 to-[#F5A3D3]/10 border border-[#F5A3D3]/20 text-center">
                            <p className="text-sm text-slate-600 font-medium">
                                "Cada dia é uma oportunidade de se sentir melhor. Estamos aqui com você."
                            </p>
                        </div>

                        <div className="mt-6 text-center space-y-4">
                            <p className="text-sm text-slate-500">
                                Novo por aqui? <a href="#" className={`font-bold hover:underline ${role === 'professional' ? 'text-[#0054A6]' : 'text-[#6C4FFE]'}`}>Crie sua conta</a>
                            </p>

                            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
                                <a href="#" className="hover:text-[#0054A6]">Termos</a>
                                <span>•</span>
                                <a href="#" className="hover:text-[#0054A6]">Privacidade</a>
                                <span>•</span>
                                <button onClick={() => setShowSupportModal(true)} className="hover:text-[#0054A6]">Suporte</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Modal */}
            {showSupportModal && (
                <div className="fixed inset-0 bg-[#0054A6]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#F6F8FE]">
                            <h3 className="font-bold text-[#0054A6] flex items-center gap-2 text-lg">
                                <LifeBuoy size={24} />
                                Central de Ajuda
                            </h3>
                            <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-2 rounded-full shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <p className="text-slate-600 mb-8 text-center leading-relaxed">
                                Precisa de assistência técnica ou tem dúvidas sobre o acesso? Nossa equipe está pronta para ajudar.
                            </p>

                            <a
                                href="mailto:doll.ricardoll@gmail.com"
                                className="w-full py-4 bg-[#0054A6] text-white rounded-xl flex items-center justify-center gap-3 hover:bg-[#004080] transition-all shadow-lg shadow-[#0054A6]/20 group"
                            >
                                <Mail size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold">Fale com o Suporte</span>
                            </a>

                            <div className="mt-8 text-center">
                                <p className="text-xs text-slate-400">
                                    Tempo médio de resposta: 24 horas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
