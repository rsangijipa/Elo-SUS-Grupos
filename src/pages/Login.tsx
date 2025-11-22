import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';
import {
    Users,
    BarChart3,
    ClipboardList,
    Users2,
    Mail,
    Lock,
    ArrowRight,
    X
} from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Falha ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row min-h-[600px]">

                {/* LEFT COLUMN - Informational */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0054A6] to-[#004080] p-8 md:p-12 text-white flex flex-col relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0B8A4D]/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                    {/* Header / Logo */}
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <img src="/elosusgrupos_logo.png" alt="Logo EloSUS" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
                        <span className="text-2xl font-bold tracking-tight">EloSUS <span className="font-light">Grupos</span></span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 relative z-10 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            A Plataforma para gestão inteligente de Grupos Terapêuticos no SUS.
                        </h1>
                        <p className="text-blue-100 text-lg mb-10">
                            Organize grupos, presenças e relatórios clínicos <span className="text-[#FFC857] font-semibold">em um só lugar.</span>
                        </p>

                        {/* Grid of Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                                <Users className="w-6 h-6 text-[#FFC857] mb-2" />
                                <h3 className="font-bold text-sm mb-1">Grupos Padronizados</h3>
                                <p className="text-xs text-blue-100">Cadastre roteiros de grupos, registros de presença e objetivos terapêuticos.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                                <BarChart3 className="w-6 h-6 text-[#FFC857] mb-2" />
                                <h3 className="font-bold text-sm mb-1">Indicadores e Relatórios</h3>
                                <p className="text-xs text-blue-100">Acompanhe frequência, faltas e produção para a gestão municipal.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                                <ClipboardList className="w-6 h-6 text-[#FFC857] mb-2" />
                                <h3 className="font-bold text-sm mb-1">Listas de Espera</h3>
                                <p className="text-xs text-blue-100">Organize entrada, saída e fila de usuários por serviço.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                                <Users2 className="w-6 h-6 text-[#FFC857] mb-2" />
                                <h3 className="font-bold text-sm mb-1">Equipe Multiprofissional</h3>
                                <p className="text-xs text-blue-100">PSI, TO, FONO e coordenação visualizam os mesmos dados.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-xs text-blue-200 relative z-10">
                        Desenvolvido para a rotina dos serviços municipais.
                    </div>
                </div>

                {/* RIGHT COLUMN - Login Form */}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center items-center relative">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-[#0054A6]">Entrar</h2>
                            <p className="mt-2 text-gray-500">Acesse sua plataforma com segurança.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                                <X size={16} />
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email profissional
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="seu.email@servico.com.br"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#0054A6] focus:border-[#0054A6] transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#0054A6] focus:border-[#0054A6] transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0054A6] hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0054A6] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="flex flex-col items-center gap-3 text-sm">
                            <button
                                onClick={() => setShowRegisterModal(true)}
                                className="text-[#0054A6] hover:text-[#004080] hover:underline font-medium transition-colors"
                            >
                                Novo(a) usuário(a)? Clique para se cadastrar.
                            </button>
                            <button
                                onClick={() => setShowForgotModal(true)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Esqueci minha senha.
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <Lock size={12} />
                                Ambiente restrito a profissionais autorizados da rede de saúde.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-slide-up">
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#0054A6]">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Solicitar acesso</h3>
                        </div>

                        <div className="space-y-4 text-center">
                            <p className="text-gray-600 text-sm">
                                Para solicitar um novo acesso ao <strong>EloSUS Grupos</strong>, entre em contato com a coordenação municipal de saúde ou com o responsável pela gestão do sistema no seu município.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-[#0054A6]">
                                <p>Este módulo é destinado exclusivamente a profissionais autorizados da rede pública.</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-slide-up">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#FFC857]">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Recuperar acesso</h3>
                        </div>

                        <div className="space-y-4 text-center">
                            <p className="text-gray-600 text-sm">
                                Se você esqueceu sua senha, tente utilizar a opção de redefinição de senha do seu e-mail institucional ou entre em contato com a equipe responsável pelo sistema no seu município.
                            </p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setShowForgotModal(false)}
                                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
