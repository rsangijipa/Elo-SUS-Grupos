import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Reports: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Mock Data
    const attendanceData = [
        { name: 'Grupo Tabagismo', presentes: 12, faltas: 3 },
        { name: 'Grupo Ansiedade', presentes: 15, faltas: 1 },
        { name: 'Grupo Idosos', presentes: 8, faltas: 4 },
        { name: 'Grupo Gestantes', presentes: 10, faltas: 2 },
    ];

    const outcomeData = [
        { name: 'Alta', value: 12, color: '#22c55e' },
        { name: 'Em Acompanhamento', value: 45, color: '#3b82f6' },
        { name: 'Abandono', value: 5, color: '#ef4444' },
        { name: 'Encaminhamento', value: 8, color: '#f59e0b' },
    ];

    const evolutionData = [
        { month: 'Jan', atendimentos: 45 },
        { month: 'Fev', atendimentos: 52 },
        { month: 'Mar', atendimentos: 48 },
        { month: 'Abr', atendimentos: 61 },
        { month: 'Mai', atendimentos: 55 },
        { month: 'Jun', atendimentos: 67 },
    ];

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
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">72</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={24} />
                        </div>
                    </div>
                    <span className="text-green-600 text-xs font-bold flex items-center gap-1 mt-4">
                        <TrendingUp size={12} /> +12% este mês
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Taxa de Presença</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">85%</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <span className="text-slate-400 text-xs font-bold mt-4 block">Média dos últimos 30 dias</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Altas Clínicas</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">12</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <span className="text-green-600 text-xs font-bold flex items-center gap-1 mt-4">
                        <TrendingUp size={12} /> +3 este mês
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase">Abandonos</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">5</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <span className="text-red-600 text-xs font-bold flex items-center gap-1 mt-4">
                        <TrendingUp size={12} /> +1 este mês
                    </span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Presença por Grupo</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="presentes" name="Presentes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="faltas" name="Faltas" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Outcomes Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Desfechos Clínicos</h3>
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
                    <div className="flex justify-center gap-6 mt-4">
                        {outcomeData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
