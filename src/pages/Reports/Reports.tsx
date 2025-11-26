import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import PatientReports from './PatientReports';

const ProfessionalReports: React.FC = () => {
    const { patients, groups } = useData();

    // KPI Calculations
    const totalPatients = patients.length;
    const dischargedPatients = patients.filter(p => p.status === 'discharged').length;
    const dropoutPatients = patients.filter(p => p.status === 'dropout').length;
    const activePatients = patients.filter(p => p.status === 'active').length;

    // Chart Data: Participants per Group
    const attendanceData = groups
        .filter(g => g.status === 'active')
        .map(g => ({
            name: g.name,
            participantes: g.participants?.length || 0,
            capacidade: 20 // Assuming a default capacity or we could add this to Group type
        }));

    // Chart Data: Patient Status Distribution
    const outcomeData = [
        { name: 'Em Acompanhamento', value: activePatients, color: '#3b82f6' },
        { name: 'Alta', value: dischargedPatients, color: '#22c55e' },
        { name: 'Abandono', value: dropoutPatients, color: '#ef4444' },
        { name: 'Aguardando', value: patients.filter(p => p.status === 'waiting').length, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Relatórios e Indicadores</h2>
                <p className="text-slate-500 mt-1">Acompanhe o desempenho dos grupos e evolução dos pacientes.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Total Pacientes</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalPatients}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={24} />
                        </div>
                    </div>
                    <span className="text-slate-400 text-xs font-bold mt-4 block">
                        Cadastrados no sistema
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Em Acompanhamento</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{activePatients}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <span className="text-green-600 text-xs font-bold flex items-center gap-1 mt-4">
                        <TrendingUp size={12} /> Ativos em grupos
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Altas Clínicas</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{dischargedPatients}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <span className="text-slate-400 text-xs font-bold mt-4 block">
                        Pacientes que receberam alta
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Abandonos</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{dropoutPatients}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <span className="text-red-600 text-xs font-bold flex items-center gap-1 mt-4">
                        Taxa de abandono: {totalPatients > 0 ? ((dropoutPatients / totalPatients) * 100).toFixed(1) : 0}%
                    </span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                <Bar dataKey="participantes" name="Participantes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
