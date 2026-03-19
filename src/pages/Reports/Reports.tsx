import React from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Calendar, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import PatientReports from './PatientReports';
import KPICard from '../../components/Common/KPICard';
import { pdfService } from '../../services/pdfService';

const ProfessionalReports: React.FC = () => {
    const { patients, groups } = useData();

    // KPI Calculations
    const totalPatients = patients.length;
    const dischargedPatients = patients.filter(p => p.status === 'discharged').length;
    const dropoutPatients = patients.filter(p => p.status === 'dropout').length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const waitingPatients = patients.filter(p => p.status === 'waiting').length;

    // Chart Data: Participants per Group
    const attendanceData = groups
        .filter(g => g.status === 'active')
        .map(g => ({
            name: g.name,
            participantes: g.participants?.length || 0,
            capacidade: g.maxParticipants || 20
        }));

    // Chart Data: Patient Status Distribution
    const outcomeData = [
        { name: 'Em Acompanhamento', value: activePatients, color: '#22C55E' },
        { name: 'Alta', value: dischargedPatients, color: '#3B82F6' },
        { name: 'Abandono', value: dropoutPatients, color: '#EF4444' },
        { name: 'Aguardando', value: waitingPatients, color: '#F59E0B' },
    ].filter(d => d.value > 0);

    const handleExportPdf = () => {
        void pdfService.captureAndExport(
            '#chart-container',
            'Unidade de Saude',
            [
                { label: 'Total Pacientes', value: totalPatients },
                { label: 'Em Acompanhamento', value: activePatients },
                { label: 'Altas Clínicas', value: dischargedPatients },
                { label: 'Abandonos', value: dropoutPatients },
            ],
            'Relatorio Gerencial'
        );
    };

    const handleExportCsv = () => {
        toast.loading('Gerando CSV...', { id: 'reports-csv' });

        const patientRows = patients.map(p => [
            p.name,
            p.cns || '-',
            p.status || '-',
            p.neighborhood || '-'
        ]);

        const attendanceRows = groups.map(group => [
            group.name,
            group.status || '-',
            group.participants?.length || 0,
            group.maxParticipants || 0
        ]);

        const dateStr = new Date().toISOString().split('T')[0];
        pdfService.exportCsvSections([
            {
                title: 'Pacientes por status',
                headers: ['Nome', 'CNS', 'Status', 'Bairro'],
                rows: patientRows
            },
            {
                title: 'Presenca por grupo',
                headers: ['Grupo', 'Status', 'Participantes', 'Capacidade'],
                rows: attendanceRows
            }
        ], `relatorio_unidade_${dateStr}.csv`);

        toast.success('CSV gerado com sucesso!', { id: 'reports-csv' });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Relatórios e Indicadores</h2>
                    <p className="text-slate-500 mt-1">Acompanhe o desempenho dos grupos e evolução dos pacientes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-professional text-white rounded-lg hover:bg-brand-professional-dark transition-colors font-medium text-sm shadow-sm"
                    >
                        <Download size={16} />
                        Exportar PDF
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                    >
                        <FileSpreadsheet size={16} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    title="Total Pacientes"
                    value={totalPatients}
                    subtitle="Cadastrados no sistema"
                    icon={<Users size={24} />}
                    iconBg="bg-blue-50 text-blue-600"
                />
                <KPICard
                    title="Em Acompanhamento"
                    value={activePatients}
                    subtitle="Ativos em grupos"
                    icon={<Calendar size={24} />}
                    iconBg="bg-green-50 text-green-600"
                />
                <KPICard
                    title="Altas Clinicas"
                    value={dischargedPatients}
                    subtitle="Pacientes que receberam alta"
                    icon={<TrendingUp size={24} />}
                    iconBg="bg-purple-50 text-purple-600"
                />
                <KPICard
                    title="Abandonos"
                    value={dropoutPatients}
                    subtitle={`Taxa de abandono: ${totalPatients > 0 ? ((dropoutPatients / totalPatients) * 100).toFixed(1) : 0}%`}
                    icon={<AlertCircle size={24} />}
                    iconBg="bg-red-50 text-red-600"
                />
            </div>

            {/* Charts Grid */}
            <div id="chart-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Participantes por Grupo Ativo</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="participantes" name="Participantes" fill="#0054A6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Outcomes Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Status dos Pacientes</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={outcomeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {outcomeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 mt-4">
                        {outcomeData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-xs font-bold text-slate-600">{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reports: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (user.role === 'patient') {
        return <PatientReports />;
    }

    return <ProfessionalReports />;
};

export default Reports;
