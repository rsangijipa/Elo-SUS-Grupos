import React, { useState, useEffect } from 'react';
import {
    Activity, Users, TrendingUp, AlertTriangle,
    MapPin, Search, Calendar, CheckCircle2,
    PieChart as PieIcon, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

// --- Intefaces ---
interface EpidemiologyData {
    totalPatients: number;
    activePatients: number;
    resolvabilityRate: number;
    waitingListCount: number;
    tfdIndex: number; // Percentage
    riskDistribution: { name: string; value: number; color: string }[];
    cidPrevalence: { name: string; count: number }[];
    recentDropouts: { id: string; name: string; date: string; reason?: string }[];
}

// --- Mock Data Generator ---
// In a real app, this would be fetched from backend or calculated from a large 'patients' array
const generateMockData = (): EpidemiologyData => {
    return {
        totalPatients: 850,
        activePatients: 620,
        resolvabilityRate: 78.5, // Target is 80%
        waitingListCount: 45,
        tfdIndex: 12.4, // 12.4% live > 50km away
        riskDistribution: [
            { name: 'Risco Alto', value: 15, color: '#EF4444' },    // Red
            { name: 'Risco Médio', value: 35, color: '#F59E0B' },   // Amber
            { name: 'Risco Baixo', value: 50, color: '#10B981' },   // Green
        ],
        cidPrevalence: [
            { name: 'F41 (Ansiedade)', count: 245 },
            { name: 'F32 (Depressão)', count: 180 },
            { name: 'F43 (Estresse)', count: 95 },
            { name: 'F31 (Bipolar)', count: 40 },
            { name: 'Z73 (Esgotamento)', count: 35 },
        ],
        recentDropouts: [
            { id: '1', name: 'Carlos Alves', date: '2025-10-24', reason: 'Não compareceu a 3 sessões' },
            { id: '2', name: 'Mariana Silva', date: '2025-10-22', reason: 'Mudança de cidade' },
            { id: '3', name: 'João Pereira', date: '2025-10-20', reason: 'Desistência voluntária' },
        ]
    };
};

// --- Components ---

const KPICard = ({ title, value, subtext, icon: Icon, trend, trendValue, colorClass }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [data, setData] = useState<EpidemiologyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate Calculation Delay
        setTimeout(() => {
            const metrics = generateMockData();
            setData(metrics);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Activity className="text-[#0054A6]" />
                        Sala de Situação - Saúde Mental
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Monitoramento epidemiológico e gestão de eficiência da unidade.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        Referência: Outubro/2025
                    </span>
                    <button className="bg-[#0054A6] hover:bg-[#004080] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-200/50 flex items-center gap-2">
                        <BarChart3 size={18} />
                        Gerar Relatório Gerencial
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total de Pacientes"
                    value={data.totalPatients}
                    subtext={`${data.activePatients} ativos neste momento`}
                    icon={Users}
                    trend="up"
                    trendValue="+5% este mês"
                    colorClass="bg-blue-50 text-blue-600"
                />
                <KPICard
                    title="Taxa de Resolutividade"
                    value={`${data.resolvabilityRate}%`}
                    subtext="Meta OMS: > 80%"
                    icon={CheckCircle2}
                    trend={data.resolvabilityRate >= 80 ? 'up' : 'down'}
                    trendValue="vs. Mês Anterior"
                    colorClass={data.resolvabilityRate >= 80 ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}
                />
                <KPICard
                    title="Fila de Espera Virtual"
                    value={data.waitingListCount}
                    subtext="Aguardando alocação em grupo"
                    icon={Calendar}
                    trend="down" // Down is good for waiting list
                    trendValue="-12% (Melhoria)"
                    colorClass="bg-purple-50 text-purple-600"
                />
                <KPICard
                    title="Índice TFD (>50km)"
                    value={`${data.tfdIndex}%`}
                    subtext="Pacientes em área remota"
                    icon={MapPin}
                    trend="up"
                    trendValue="Atenção à Logística"
                    colorClass="bg-orange-50 text-orange-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Epidemiological Risk Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieIcon size={20} className="text-slate-400" />
                        Distribuição de Risco
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CID Prevalence */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-slate-400" />
                        Prevalência Epidemiológica (Top 5 Diagnósticos)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.cidPrevalence}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#0054A6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Management Alerts / Search Active */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-red-500">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        Alertas de Gestão: Busca Ativa Necessária
                    </h3>
                    <button className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
                        Ver Todos
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Paciente</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data do Alerta</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Motivo</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.recentDropouts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="py-4 pl-4 font-bold text-slate-700">{alert.name}</td>
                                    <td className="py-4 text-slate-600 text-sm">
                                        {new Date(alert.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="py-4 text-slate-600 text-sm">{alert.reason}</td>
                                    <td className="py-4">
                                        <button className="text-xs font-bold bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                                            Iniciar Protocolo
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
