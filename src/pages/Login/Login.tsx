import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Lock, Mail, ArrowRight, Activity, ShieldCheck, User, Eye, EyeOff, HelpCircle, Send, X, FileText, Info } from 'lucide-react';

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

        setActiveModal(null);
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
                await login(formData.email, formData.password);
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

    // Reusable Modal Component
    const ModalContent = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
        <div className="absolute inset-0 z-50 bg-white rounded-3xl flex flex-col overflow-hidden animate-fade-in shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === 'patient' ? 'text-purple-700' : 'text-blue-700'}`}>
                    {title}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                    <X size={24} />
                </button>
            </div>
        </div>
    );

    // DEV: Cleanup
    const handleCleanup = async () => {
        if (window.confirm('Delete all test data?')) {
            const { cleanupDatabase } = await import('../../utils/cleanup');
            await cleanupDatabase();
            alert('Cleanup complete');
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-700 bg-gradient-to-br ${colors.gradient}`}>
            <button onClick={handleCleanup} className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-50">
                DEV: Cleanup DB
            </button>

            <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-center relative min-h-[700px]">

                {/* Visuals - Left Side */}
                <div className={`
                    w-full lg:w-[50%] lg:absolute lg:left-0 lg:top-0 lg:bottom-0 
                    p-6 lg:p-16 
                    flex flex-col justify-center transition-all duration-700 order-1 z-0
                `}>
                    <div className="max-w-lg mx-auto lg:mx-0 space-y-8 pt-8 lg:pt-0">
                        {/* Title */}
                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
                                Cuidar de você <br />
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme === 'patient' ? 'from-purple-600 to-pink-500' : 'from-blue-600 to-cyan-500'}`}>
                                    começa aqui.
                                </span>
                            </h1>
                        </div>

                        {/* Description Box */}
                        <div className={`
                            p-6 rounded-[2rem] border-2 backdrop-blur-sm transition-colors duration-700
                            ${theme === 'patient'
                                ? 'bg-white/40 border-purple-200 text-slate-700'
                                : 'bg-white/40 border-blue-200 text-slate-700'}
                        `}>
                            <p className="text-lg font-medium leading-relaxed">
                                Seu espaço pessoal de saúde mental no SUS, feito para acompanhar sua jornada com leveza e acolhimento.
                            </p>
                        </div >

                        {/* Illustration Container */}
                        < div className="relative flex justify-center lg:justify-start" >
                            {/* Background Glow */}
                            < div className={`
                                absolute inset-0 rounded-full blur-3xl opacity-40 transform scale-110
                                ${theme === 'patient' ? 'bg-gradient-to-tr from-orange-200 to-pink-200' : 'bg-gradient-to-tr from-blue-200 to-cyan-200'}
                            `}></div >

                            <img
                                src="/elosusgrupos_setting_login.png"
                                className="relative z-10 w-full max-w-md h-auto object-contain drop-shadow-2xl rounded-3xl transform hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Login Card - Prominent, Rounded, Shadowed */}
                    <div className="w-full lg:w-[50%] lg:ml-auto bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 relative z-10 order-2 border border-slate-100">

                        {/* Modal Overlays */}
                        {
                            activeModal === 'help' && (
                                <ModalContent title="Suporte" onClose={() => setActiveModal(null)}>
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm">
                                            <p className="font-medium mb-1">Precisa de ajuda?</p>
                                            <p>Descreva sua dúvida ou problema no campo abaixo. Nossa equipe vai analisar sua mensagem e retornar pelo e-mail informado o mais breve possível. 💬</p>
                                        </div>
                                        <form onSubmit={handleHelpSubmit} className="space-y-4">
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
                                                rows={5}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all resize-none"
                                                style={{ borderColor: theme === 'patient' ? '#d8b4fe' : '#93c5fd' }}
                                                value={helpData.message}
                                                onChange={e => setHelpData({ ...helpData, message: e.target.value })}
                                            />
                                            <button
                                                type="submit"
                                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${theme === 'patient' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                Enviar Mensagem <Send size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </ModalContent>
                            )
                        }

                        {
                            activeModal === 'terms' && (
                                <ModalContent title="Termos de Uso" onClose={() => setActiveModal(null)}>
                                    <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4">
                                        <p className="font-bold">1. Termos de Uso – EloSUS Grupos (23/11/2025)</p>
                                        <h4 className="font-bold text-slate-800">1. Quem somos</h4>
                                        <p>O EloSUS Grupos é uma plataforma digital destinada ao apoio à gestão e participação em grupos terapêuticos no âmbito do SUS, podendo ser utilizada por: Profissionais de saúde e Usuários/pacientes.</p>
                                        <h4 className="font-bold text-slate-800">2. Objetivo do aplicativo</h4>
                                        <p>Profissionais: auxiliar na organização, registro e acompanhamento de grupos terapêuticos. Usuários/pacientes: atuar como um companion de saúde mental.</p>
                                        <h4 className="font-bold text-slate-800">3. Público-alvo e perfis de acesso</h4>
                                        <p>O aplicativo pode ser utilizado em dois perfis principais: Profissional de saúde / SUS e Usuário/paciente.</p>
                                        <h4 className="font-bold text-slate-800">4. Cadastro e autenticação</h4>
                                        <p>Para utilizar todas as funcionalidades, é necessário realizar cadastro e login. Você se compromete a informar dados verdadeiros e manter sua senha em sigilo.</p>
                                        <h4 className="font-bold text-slate-800">5. Responsabilidades do usuário</h4>
                                        <p>Não utilizar o aplicativo para fins ilícitos. Respeitar a confidencialidade das informações.</p>
                                        <h4 className="font-bold text-slate-800">6. Responsabilidades do EloSUS Grupos</h4>
                                        <p>Empregar esforços de segurança e manter a disponibilidade do serviço. O aplicativo não substitui atendimento clínico individual.</p>
                                        <h4 className="font-bold text-slate-800">7. Funcionalidades principais</h4>
                                        <p>Cadastro e gestão de grupos, registro de presenças, agenda, painéis de indicadores, visualização de encontros, check-in emocional.</p>
                                        <h4 className="font-bold text-slate-800">8. Privacidade e proteção de dados</h4>
                                        <p>O tratamento de dados pessoais é regulado pela Política de Privacidade.</p>
                                        <h4 className="font-bold text-slate-800">9. Propriedade intelectual</h4>
                                        <p>Marcas e elementos do EloSUS Grupos são protegidos por direitos de propriedade intelectual.</p>
                                        <h4 className="font-bold text-slate-800">10. Suspensão, alteração e encerramento</h4>
                                        <p>O EloSUS Grupos poderá suspender o acesso ou alterar estes termos com aviso prévio.</p>
                                        <h4 className="font-bold text-slate-800">11. Contato e suporte</h4>
                                        <p>E-mail: [inserir e-mail oficial]</p>
                                        <h4 className="font-bold text-slate-800">12. Foro</h4>
                                        <p>Fica eleito o foro da Comarca de [cidade/UF].</p>
                                    </div>
                                </ModalContent>
                            )
                        }

                        {
                            activeModal === 'privacy' && (
                                <ModalContent title="Política de Privacidade" onClose={() => setActiveModal(null)}>
                                    <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4">
                                        <p className="font-bold">Política de Privacidade – EloSUS Grupos (23/11/2025)</p>
                                        <h4 className="font-bold text-slate-800">1. Introdução</h4>
                                        <p>Esta Política explica como coletamos, utilizamos e protegemos seus dados pessoais em conformidade com a LGPD.</p>
                                        <h4 className="font-bold text-slate-800">2. Dados pessoais que podemos coletar</h4>
                                        <p>Dados de identificação, dados profissionais, dados de saúde e participação em grupos (dados sensíveis), dados de uso e navegação.</p>
                                        <h4 className="font-bold text-slate-800">3. Para que utilizamos seus dados</h4>
                                        <p>Gestão de grupos terapêuticos, organização da assistência, comunicação, monitoramento, geração de indicadores, segurança.</p>
                                        <h4 className="font-bold text-slate-800">4. Bases legais (LGPD)</h4>
                                        <p>Execução de políticas públicas, contrato, obrigação legal, legítimo interesse, consentimento.</p>
                                        <h4 className="font-bold text-slate-800">5. Compartilhamento de dados</h4>
                                        <p>Com serviços de saúde, gestores, fornecedores de tecnologia, mediante requisição legal.</p>
                                        <h4 className="font-bold text-slate-800">6. Armazenamento e segurança</h4>
                                        <p>Adotamos medidas técnicas e organizacionais para proteger os dados. Nenhum sistema é totalmente isento de riscos.</p>
                                        <h4 className="font-bold text-slate-800">7. Direitos do titular de dados</h4>
                                        <p>Confirmar, acessar, corrigir, anonimizar, portar, revogar consentimento.</p>
                                        <h4 className="font-bold text-slate-800">8. Cookies</h4>
                                        <p>Podemos utilizar cookies para manter sessão e gerar estatísticas.</p>
                                        <h4 className="font-bold text-slate-800">9. Retenção e descarte</h4>
                                        <p>Dados mantidos pelo tempo necessário para cumprimento das finalidades e obrigações legais.</p>
                                        <h4 className="font-bold text-slate-800">10. Crianças e adolescentes</h4>
                                        <p>Tratamento de dados observará disposições específicas da LGPD e vínculo com responsável legal.</p>
                                        <h4 className="font-bold text-slate-800">11. Atualizações</h4>
                                        <p>Esta política poderá ser atualizada periodicamente.</p>
                                    </div>
                                </ModalContent>
                            )
                        }

                        {/* Header with Logo Above Login Area */}
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/elosusgrupos_logo.png" alt="EloSUS Logo" className="h-12 w-auto object-contain" />
                                <h1 className="text-3xl font-bold tracking-tight text-blue-600">
                                    EloSUS <span className="text-slate-700">Grupos</span>
                                </h1>
                            </div>

                            <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                {isLogin ? 'Entre no seu espaço' : 'Crie sua conta'}
                            </h2>
                            <p className="text-slate-500">
                                {isLogin ? 'Escolha seu perfil para continuar.' : 'Preencha seus dados para começar.'}
                            </p>
                        </div>

                        {/* Role Toggle */}
                        <div className="bg-slate-100/70 p-1.5 rounded-2xl flex mb-8 border border-slate-200">
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

                        {/* Form */}
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

                            {!isLogin && (
                                <div className="space-y-1 animate-fade-in">
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-current transition-colors" size={20} style={{ color: theme === 'patient' ? '#9333ea' : '#2563eb' }} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            style={{ '--tw-ring-color': theme === 'patient' ? '#d8b4fe' : '#93c5fd' } as React.CSSProperties}
                                            placeholder="CPF"
                                            value={formData.cpf}
                                            onChange={e => setFormData({ ...formData, cpf: e.target.value })}
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
                                    onClick={() => setActiveModal('help')}
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
                                <div className="flex justify-center gap-6 text-xs text-slate-400 mb-4">
                                    <button onClick={() => setActiveModal('terms')} className="hover:text-slate-600 transition-colors">Termos</button>
                                    <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-600 transition-colors">Privacidade</button>
                                    <button onClick={() => setActiveModal('help')} className="hover:text-slate-600 transition-colors">Suporte</button>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Desenvolvido por: Richard Brian Sangi - Psicólogo Clinico / Contato richardbraian@hotmail.com

                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
