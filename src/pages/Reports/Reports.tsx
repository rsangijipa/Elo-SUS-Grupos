import React from 'react';
import { BarChart, PieChart, TrendingUp, Users, AlertCircle, FileText } from 'lucide-react';

const Reports: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Relatórios e Indicadores</h2>
                    <p className="text-slate-500 mt-1">Acompanhe o desempenho da sua unidade.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                    <FileText size={18} />
                    Exportar PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-bold text-slate-700">Adesão Média</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">85%</p>
                    <p className="text-xs text-green-600 font-medium mt-1">+5% em relação ao mês anterior</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <h3 className="font-bold text-slate-700">Taxa de Evasão</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">12%</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Dentro da meta esperada (15%)</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold text-slate-700">Produção BPA</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">142</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Procedimentos registrados este mês</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart Mock */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <BarChart size={20} className="text-slate-400" />
                            Atendimentos por Grupo
                        </h3>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {/* Bar 1 */}
                        <div className="flex flex-col items-center gap-2 w-full">
                            <div className="w-full bg-blue-500 rounded-t-lg hover:opacity-90 transition-opacity relative group" style={{ height: '60%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    24
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500">Tabagismo</span>
                        </div>
                        {/* Bar 2 */}
                        <div className="flex flex-col items-center gap-2 w-full">
                            <div className="w-full bg-blue-500 rounded-t-lg hover:opacity-90 transition-opacity relative group" style={{ height: '85%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    32
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500">Gestantes</span>
                        </div>
                        {/* Bar 3 */}
                        <div className="flex flex-col items-center gap-2 w-full">
                            <div className="w-full bg-blue-500 rounded-t-lg hover:opacity-90 transition-opacity relative group" style={{ height: '45%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    18
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500">Ansiedade</span>
                        </div>
                        {/* Bar 4 */}
                        <div className="flex flex-col items-center gap-2 w-full">
                            <div className="w-full bg-blue-300 rounded-t-lg hover:opacity-90 transition-opacity relative group" style={{ height: '30%' }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    12
                                </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500">Outros</span>
                        </div>
                    </div>
                </div>

                {/* Pie Chart Mock */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <PieChart size={20} className="text-slate-400" />
                            Status dos Pacientes
                        </h3>
                    </div>
                    <div className="flex items-center justify-center h-64">
                        <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
                            {/* CSS Conic Gradient for Pie Chart */}
                            <div className="absolute inset-0 rounded-full" style={{
                                background: 'conic-gradient(#3b82f6 0% 65%, #22c55e 65% 85%, #ef4444 85% 100%)',
                                maskImage: 'radial-gradient(transparent 55%, black 56%)',
                                WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)'
                            }}></div>
                            <div className="text-center z-10">
                                <p className="text-3xl font-bold text-slate-800">145</p>
                                <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-sm text-slate-600">Ativos (65%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-sm text-slate-600">Alta (20%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-sm text-slate-600">Inativos (15%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
