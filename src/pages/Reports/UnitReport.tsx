import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, AlertTriangle, Activity, Eye, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { moodService, MoodLog } from '../../services/moodService';
import { pdfService } from '../../services/pdfService';
import toast from 'react-hot-toast';
import HealthRadar from '../../components/Dashboard/HealthRadar';

const UnitReport: React.FC = () => {
    const navigate = useNavigate();
    const { patients } = useData();
    const [moodMap, setMoodMap] = useState<Record<string, MoodLog | null>>({});
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadMoods = async () => {
            const newMoodMap: Record<string, MoodLog | null> = {};
            const promises = patients.map(async (p) => {
                if (!p.id) return;
                try {
                    const history = await moodService.getPatientHistory(p.id, 1);
                    newMoodMap[p.id] = history.length > 0 ? history[0] : null;
                } catch (e) {
                    console.error(e);
                    newMoodMap[p.id] = null;
                }
            });
            await Promise.all(promises);
            setMoodMap(newMoodMap);
        };
        loadMoods();
    }, [patients]);

    // Risk Calculation Helper (Duplicated logic from HealthRadar for filtering - ideal would be shared utility)
    const getRiskLevel = (patientId: string) => {
        const moodLog = moodMap[patientId];
        const patient = patients.find(p => p.id === patientId);

        let daysAbsent = 0;
        if (patient?.stats?.lastLogin) {
            const lastLoginDate = new Date(patient.stats.lastLogin.seconds ? patient.stats.lastLogin.seconds * 1000 : patient.stats.lastLogin);
            const diffTime = Math.abs(new Date().getTime() - lastLoginDate.getTime());
            daysAbsent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const moodVal = moodLog?.value || 3;

        if (moodLog && moodVal < 2 && daysAbsent > 7) return 'critical';
        if (moodLog && moodVal < 2 && daysAbsent <= 3) return 'support';
        if (moodLog && moodVal > 4 && daysAbsent > 15) return 'monitor';
        return 'normal';
    };

    const filteredPatients = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const risk = getRiskLevel(p.id || '');
        const matchesRisk = filterRisk === 'all' || risk === filterRisk;
        return matchesSearch && matchesRisk;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Relatório da Unidade</h1>
                    <p className="text-slate-500">Visão detalhada de engajamento e bem-estar.</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <HealthRadar patients={patients} moodMap={moodMap} />
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Download size={20} /> Exportar Dados
                    </h3>
                    <p className="text-blue-100 text-sm mb-6">
                        Baixe o relatório completo em PDF ou CSV para análise externa ou apresentação.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={async () => {
                                try {
                                    toast.loading('Gerando PDF...', { id: 'pdf-unit' });
                                    await pdfService.generateUnitReportPdf(filteredPatients, moodMap);
                                    toast.success('Relatório baixado!', { id: 'pdf-unit' });
                                } catch (error) {
                                    console.error(error);
                                    toast.error('Erro ao gerar PDF', { id: 'pdf-unit' });
                                }
                            }}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors border border-white/20">
                            Baixar PDF
                        </button>
                        <button className="w-full py-3 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                            Exportar CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Patient List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-lg text-slate-800">Detalhamento por Paciente</h3>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="relative">
                            <Filter size={18} className="absolute left-3 top-3 text-slate-400" />
                            <select
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer font-medium text-slate-600"
                            >
                                <option value="all">Todos os Riscos</option>
                                <option value="critical">Crítico</option>
                                <option value="support">Suporte</option>
                                <option value="monitor">Monitorar</option>
                                <option value="normal">Normal</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Último Humor</th>
                                <th className="px-6 py-4">Engajamento</th>
                                <th className="px-6 py-4">Status de Risco</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.map(patient => {
                                const risk = getRiskLevel(patient.id || '');
                                const mood = moodMap[patient.id || ''];

                                return (
                                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {patient.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {mood ? (
                                                <span className={`px-2 py-1 rounded-lg font-bold text-xs ${mood.value >= 4 ? 'bg-green-100 text-green-700' :
                                                    mood.value >= 3 ? 'bg-blue-100 text-blue-700' :
                                                        mood.value >= 2 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {mood.value}/5
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min((patient.stats?.totalSessions || 0) * 10, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold">{patient.stats?.totalSessions || 0} sessões</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {risk === 'critical' && (
                                                <span className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-full w-fit">
                                                    <AlertTriangle size={14} /> Crítico
                                                </span>
                                            )}
                                            {risk === 'support' && (
                                                <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded-full w-fit">
                                                    <Activity size={14} /> Suporte
                                                </span>
                                            )}
                                            {risk === 'monitor' && (
                                                <span className="flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-full w-fit">
                                                    <Eye size={14} /> Monitorar
                                                </span>
                                            )}
                                            {risk === 'normal' && (
                                                <span className="text-slate-400 text-xs font-medium">Normal</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/patients/${patient.id}`)}
                                                className="text-blue-600 font-bold text-xs hover:underline"
                                            >
                                                Ver Perfil
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UnitReport;
