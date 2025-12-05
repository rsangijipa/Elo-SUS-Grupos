import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Activity, Calendar, FileText, Clock, CheckCircle, XCircle, Plus, ArrowRight, Flame, Snowflake, Trophy, Heart, Brain, Lightbulb } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { moodService, MoodLog } from '../../services/moodService';
import { quizService } from '../../services/quizService';
import { AIService } from '../../services/vertexAI';
import type { QuizResult } from '../../types/quiz';
import type { Patient } from '../../types/patient';
import { toast } from 'react-hot-toast';
import { pdfService } from '../../services/pdfService';

const PatientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [selfCareResult, setSelfCareResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ riskScore: number; suggestedCID: string; tfdAlert: boolean; reasoning: string; } | null>(null);

    useEffect(() => {
        if (id) {
            loadPatient(id);
        }
    }, [id]);

    const loadPatient = async (patientId: string) => {
        try {
            const data = await patientService.getById(patientId);
            setPatient(data);
            if (data) {
                const moodData = await moodService.getPatientHistory(patientId);
                setMoodHistory(moodData);
                const quizData = await quizService.getQuizResultById(patientId, 'mental-health-general-13');
                const scData = await quizService.getQuizResultById(patientId, 'self-care-smart');
                setQuizResult(quizData);
                setSelfCareResult(scData);
            }
        } catch (error) {
            console.error('Error loading patient:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeRisk = async () => {
        if (!patient) return;
        setIsAnalyzing(true);
        try {
            const result = await AIService.analyzeRiskAndCoding({
                patientData: patient,
                attendanceRecords: [], // Mock attendance for now
                distanceKm: 12.5, // Mock distance, ideally comes from patient.coordinates
                notes: "Paciente relata desânimo constante e dificuldade de sono." // Mock or last clinical note
            });
            setAiAnalysis(result);
            toast.success("Análise de Risco Concluída!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao analisar dados.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando prontuário...</div>;
    if (!patient) return <div className="p-8 text-center text-slate-500">Paciente não encontrado.</div>;

    // Mock Risk Data (In real app, this would come from the patient record)
    const riskLevel = 'attention' as 'high' | 'attention' | 'standard';

    const getRiskBadge = () => {
        switch (riskLevel) {
            case 'high':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-sm">
                        <AlertTriangle size={16} />
                        Risco Alto
                    </div>
                );
            case 'attention':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold text-sm">
                        <Activity size={16} />
                        Atenção
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                        <CheckCircle size={16} />
                        Acompanhamento Padrão
                    </div>
                );
        }
    };

    const handleExportReport = async () => {
        if (!patient) return;

        try {
            toast.loading('Gerando relatório...', { id: 'pdf-gen' });
            // Casting patient to any to avoid strict type mismatch if types differ slightly
            await pdfService.generateClinicalReportPdf(patient as any, moodHistory, quizResult);
            toast.success('Relatório gerado com sucesso!', { id: 'pdf-gen' });
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Erro ao gerar relatório.', { id: 'pdf-gen' });
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'emotional'>('overview');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0054A6] to-[#6C4FFE]"></div>
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-[#0054A6] transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
                            <p className="text-slate-500 mt-1 font-medium">CNS: {patient.cns || 'Não informado'} • Nascimento: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAnalyzeRisk}
                            disabled={isAnalyzing}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg font-bold text-sm hover:bg-purple-100 transition-colors shadow-sm"
                        >
                            {isAnalyzing ? (
                                <Activity size={16} className="animate-spin" />
                            ) : (
                                <Brain size={16} />
                            )}
                            {isAnalyzing ? 'Analisando...' : 'Analisar Risco (IA)'}
                        </button>
                        <button
                            onClick={handleExportReport}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <FileText size={16} className="text-[#0054A6]" />
                            Exportar Relatório
                        </button>
                        {getRiskBadge()}
                    </div>
                </div>

                {/* AI Analysis Result Panel */}
                {aiAnalysis && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 animate-slide-down">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Lightbulb size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    Análise do Agente Sentinela
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${aiAnalysis.riskScore > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        Risco: {aiAnalysis.riskScore}%
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    {aiAnalysis.reasoning}
                                </p>
                                <div className="flex gap-4 mt-3">
                                    <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                        Sugestão CID: {aiAnalysis.suggestedCID}
                                    </div>
                                    {aiAnalysis.tfdAlert && (
                                        <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1">
                                            <AlertTriangle size={12} />
                                            Requer TFD (Tratamento Fora de Domicílio)
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</span>
                        <span className="text-slate-700 font-medium">{patient.phone}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico Principal</span>
                        <span className="text-slate-700 font-medium">F32.2 - Episódio depressivo grave</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unidade de Origem</span>
                        <span className="text-slate-700 font-medium">{patient.originUnit || 'Não informada'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50 mt-4">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Endereço</span>
                        <span className="text-slate-700 font-medium">{patient.address || 'Não informado'}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bairro</span>
                        <span className="text-slate-700 font-medium">{patient.neighborhood || 'Não informado'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeTab === 'overview'
                        ? 'text-[#0054A6]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Visão Geral
                    {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0054A6] rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeTab === 'documents'
                        ? 'text-[#0054A6]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Documentos do Paciente
                    {activeTab === 'documents' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0054A6] rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('emotional')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeTab === 'emotional'
                        ? 'text-[#0054A6]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Sinais Vitais Emocionais
                    {activeTab === 'emotional' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0054A6] rounded-t-full"></div>}
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-[#0054A6]" />
                            Histórico Clínico
                        </h2>

                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-8">
                            {/* Timeline Item 1 */}
                            <div className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0054A6] border-4 border-white shadow-sm"></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-800">Participação em Grupo</span>
                                        <span className="text-xs text-slate-500 font-medium">15/10/2025</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">Compareceu à 3ª sessão do Grupo de Tabagismo. Relatou diminuição no consumo.</p>
                                    <div className="mt-4 flex gap-2">
                                        <span className="px-2.5 py-1 bg-blue-50 text-[#0054A6] text-xs rounded-lg font-bold">Tabagismo</span>
                                        <span className="px-2.5 py-1 bg-green-50 text-[#0B8A4D] text-xs rounded-lg font-bold">Presença Confirmada</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Item 2 */}
                            <div className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-800">Encaminhamento</span>
                                        <span className="text-xs text-slate-500 font-medium">01/09/2025</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">Encaminhado via SISREG para avaliação psiquiátrica no CAPS II.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        {/* Engagement Panel */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Trophy size={18} className="text-yellow-500" />
                                Engajamento Digital
                            </h3>

                            {/* Streak Indicator */}
                            <div className={`p-4 rounded-xl border mb-4 flex items-center gap-3 ${(patient.stats?.loginStreak || 0) > 3
                                ? 'bg-orange-50 border-orange-100'
                                : 'bg-slate-50 border-slate-100'
                                }`}>
                                <div className={`p-2 rounded-lg ${(patient.stats?.loginStreak || 0) > 3
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {(patient.stats?.loginStreak || 0) > 3 ? <Flame size={24} /> : <Snowflake size={24} />}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${(patient.stats?.loginStreak || 0) > 3 ? 'text-orange-700' : 'text-slate-600'
                                        }`}>
                                        {(patient.stats?.loginStreak || 0) > 3 ? 'Alta Adesão' : 'Baixa Frequência'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(patient.stats?.loginStreak || 0)} dias seguidos
                                    </p>
                                </div>
                            </div>

                            {/* Last Access */}
                            <div className="mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Visto por último em</p>
                                <p className="text-sm font-medium text-slate-700">
                                    {patient.stats?.lastLogin
                                        ? new Date(patient.stats.lastLogin.seconds ? patient.stats.lastLogin.seconds * 1000 : patient.stats.lastLogin).toLocaleString()
                                        : 'Nunca acessou'}
                                </p>
                            </div>

                            {/* Achievements Gallery */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conquistas Recentes</p>
                                <div className="flex flex-wrap gap-2">
                                    {patient.achievements && patient.achievements.length > 0 ? (
                                        patient.achievements.map((badgeId, index) => (
                                            <div key={index} className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center text-xs" title={badgeId}>
                                                🏆
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Nenhuma conquista ainda.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Triage Result Card */}
                        {quizResult && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${quizResult.riskLevel === 'high' ? 'bg-red-500' : quizResult.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>

                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-purple-500" />
                                    Resultado de Triagem
                                </h3>

                                <div className="mb-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-medium text-slate-600">Pontuação de Sintomas</span>
                                        <span className={`text-lg font-bold ${quizResult.riskLevel === 'high' ? 'text-red-600' : quizResult.riskLevel === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {quizResult.score}/{quizResult.totalQuestions}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${quizResult.riskLevel === 'high' ? 'bg-red-500' : quizResult.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${(quizResult.score / quizResult.totalQuestions) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {quizResult.riskLevel === 'high' && (
                                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                                        <p className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1">
                                            <AlertTriangle size={12} />
                                            Alerta de Risco
                                        </p>
                                        <p className="text-xs text-red-600 leading-tight">
                                            Paciente apresenta múltiplos sintomas. Sistema sugere encaminhamento para Grupo de Ansiedade/Depressão.
                                        </p>
                                    </div>
                                )}

                                {quizResult.riskLevel === 'high' && (
                                    <button className="w-full py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                                        Encaminhar para Grupo Agora
                                    </button>
                                )}

                                <p className="text-[10px] text-slate-400 mt-3 text-center">
                                    Realizado em {quizResult.createdAt?.seconds ? new Date(quizResult.createdAt.seconds * 1000).toLocaleDateString() : 'Data desconhecida'}
                                </p>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Grupos Anteriores</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#F6F8FE] rounded-xl border border-slate-50">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Ansiedade Leve</p>
                                        <p className="text-xs text-slate-500 font-medium">2024 • 8 Sessões</p>
                                    </div>
                                    <span className="px-2.5 py-1 bg-green-100 text-[#0B8A4D] text-xs rounded-lg font-bold">Alta</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#F6F8FE] rounded-xl border border-slate-50">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Luto e Perdas</p>
                                        <p className="text-xs text-slate-500 font-medium">2023 • 4 Sessões</p>
                                    </div>
                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-bold">Abandono</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'documents' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Documentos Enviados pelo Paciente</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                            toast.success(`Documento "${file.name}" enviado com sucesso!`);
                                            // In a real app, we would upload this file
                                        }
                                    };
                                    input.click();
                                }}
                                className="text-sm font-bold text-white bg-[#0054A6] px-4 py-2 rounded-lg hover:bg-[#004080] transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Enviar Documento
                            </button>
                            <button className="text-sm font-bold text-[#0054A6] hover:underline">Baixar Todos</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Diário de Humor - Outubro.pdf', date: '15/10/2025', size: '1.2 MB' },
                            { name: 'Encaminhamento Cardio.jpg', date: '10/10/2025', size: '2.4 MB' },
                            { name: 'Relatório Externo.pdf', date: '01/09/2025', size: '850 KB' }
                        ].map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 hover:bg-[#F6F8FE] rounded-xl transition-colors border border-slate-100 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-[#0054A6] rounded-lg group-hover:bg-[#0054A6] group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">{doc.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">Enviado em {doc.date} • {doc.size}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-[#0054A6] transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-[#F6F8FE] rounded-xl border border-dashed border-slate-300 text-center">
                        <p className="text-slate-500 text-sm">Nenhum outro documento encontrado.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Alert Card */}
                    {patient.hasAlert && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="text-red-600 shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-red-800">Atenção: Risco Emocional Detectado</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    O paciente apresenta tendência de piora emocional recente (média &lt; 2 nos últimos registros).
                                    Recomenda-se contato ativo.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chart Section (Simplified Visual) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Tendência de Humor (Últimos 15 dias)</h3>
                            <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-slate-200 pb-2">
                                {moodHistory.map((log, index) => (
                                    <div key={log.id || index} className="flex flex-col items-center gap-2 group w-full">
                                        <div
                                            className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 relative group-hover:opacity-80
                                                ${log.value >= 4 ? 'bg-green-400' : log.value === 3 ? 'bg-yellow-400' : 'bg-red-400'}
                                            `}
                                            style={{ height: `${(log.value / 5) * 100}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleDateString() : 'Hoje'} - Nota: {log.value}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {moodHistory.length === 0 && (
                                    <div className="w-full text-center text-slate-400 py-10">
                                        Nenhum registro encontrado.
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                                <span>Antigo</span>
                                <span>Recente</span>
                            </div>
                        </div>

                        {/* Tag Cloud */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Nuvem de Tags (Fatores Recorrentes)</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(moodHistory.flatMap(log => log.tags))).map(tag => {
                                    const count = moodHistory.filter(l => l.tags.includes(tag)).length;
                                    return (
                                        <span
                                            key={tag}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold border
                                                ${count > 2 ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-100'}
                                            `}
                                        >
                                            {tag} <span className="opacity-60 ml-1">({count})</span>
                                        </span>
                                    );
                                })}
                                {moodHistory.length === 0 && (
                                    <p className="text-slate-400 text-sm">Nenhuma tag registrada.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Logs List */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h3 className="font-bold text-slate-800">Histórico Detalhado</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {moodHistory.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                    <div className={`text-2xl p-2 rounded-xl ${log.value >= 4 ? 'bg-green-50' : log.value === 3 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                                        {log.value === 1 ? '😡' : log.value === 2 ? '😢' : log.value === 3 ? '😐' : log.value === 4 ? '🙂' : '😁'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-700">
                                                {log.value === 1 ? 'Muito Mal' : log.value === 2 ? 'Mal' : log.value === 3 ? 'Normal' : log.value === 4 ? 'Bem' : 'Muito Bem'}
                                            </h4>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'Data inválida'}
                                            </span>
                                        </div>
                                        {log.note && <p className="text-sm text-slate-600 mt-1">"{log.note}"</p>}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {log.tags.map(tag => (
                                                <span key={tag} className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetail;
