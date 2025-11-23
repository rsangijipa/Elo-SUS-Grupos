import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Activity, Calendar, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { patientService } from '../../services/patientService';
import type { Patient } from '../../types/patient';

const PatientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPatient(id);
        }
    }, [id]);

    const loadPatient = async (patientId: string) => {
        try {
            const data = await patientService.getById(patientId);
            setPatient(data);
        } catch (error) {
            console.error('Error loading patient:', error);
        } finally {
            setLoading(false);
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

    const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

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
                            <h1 className="text-3xl font-bold text-slate-900">{patient.nomeCompleto}</h1>
                            <p className="text-slate-500 mt-1 font-medium">CNS: {patient.cns || 'Não informado'} • Nascimento: {new Date(patient.dataNascimento).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    {getRiskBadge()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</span>
                        <span className="text-slate-700 font-medium">{patient.telefone}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico Principal</span>
                        <span className="text-slate-700 font-medium">F32.2 - Episódio depressivo grave</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unidade de Referência</span>
                        <span className="text-slate-700 font-medium">UBS Santa Cecília</span>
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
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Documentos Enviados pelo Paciente</h2>
                        <button className="text-sm font-bold text-[#0054A6] hover:underline">Baixar Todos</button>
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
            )}
        </div>
    );
};

export default PatientDetail;
