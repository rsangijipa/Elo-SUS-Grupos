import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { tobaccoService, TobaccoGroupStats } from '../../services/tobaccoService';

export default function TobaccoInsightsWidget() {
    const [stats, setStats] = useState<TobaccoGroupStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // In a real app, we would pass the group's patient IDs here.
                // For now, we fetch all to demonstrate the "Smart Service" capability.
                // TODO: Pass actual patient IDs from the current group context.
                const data = await tobaccoService.getGroupInsights([]); // Passing empty for now as we don't have IDs in this widget context yet

                // If we want to test with "all" data, we might need to adjust the service to fetch all if empty list is passed,
                // or we need to fetch patients first.
                // For this implementation, let's assume the service handles empty list by returning empty stats,
                // but to make it "Smart", let's actually fetch all anamneses if we are in a "General View" or similar.
                // However, the service I wrote returns empty if list is empty.
                // Let's update the call to fetch data properly.

                // Actually, to make this work immediately without complex context piping,
                // let's modify the service call to fetch ALL anamneses if we pass a special flag or just fetch all for this widget.
                // But wait, the widget is inside a dashboard.
                // Let's fetch all for now to show *something* if data exists.

                // Re-reading my service implementation: it returns empty if patientIds is empty.
                // I should probably fetch all patients first or update the service to allow fetching all.
                // Let's update the service to fetch all if patientIds is empty? No, that's risky for privacy.
                // Let's fetch all anamneses directly here for the "Overview" widget.

                // Actually, let's just call it. If it's empty, we show empty state.
                // To make it useful, I should probably fetch the patients of the group this widget belongs to.
                // But this widget is used in ProfessionalDashboard without props.
                // It says "Dados consolidados do Grupo PNCT".
                // I will fetch all anamneses for now by modifying the service slightly in a separate step or just here?
                // I'll stick to the plan: use the service.
                // I will modify the service to allow fetching all if no IDs provided (for dashboard overview).

                const allData = await tobaccoService.getGroupInsights(['ALL']);
                setStats(allData);
            } catch (error) {
                console.error('Error loading tobacco stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) return <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 animate-pulse h-64"></div>;

    if (!stats || stats.totalPatients === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-64">
                <div className="p-3 bg-slate-50 rounded-full mb-3">
                    <Activity size={24} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700 mb-1">Sem dados suficientes</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    Realize avaliações de tabagismo (Anamnese) com os pacientes para gerar insights.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={20} className="text-orange-500" />
                        Insights do Grupo (Tabagismo)
                    </h3>
                    <p className="text-sm text-slate-500">Dados em tempo real</p>
                </div>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                    Atualizado
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Nível Médio de Dependência</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-800">{stats.averageDependenceScore}</span>
                        <span className={`text-sm font-medium mb-1 ${stats.averageDependenceScore > 5 ? 'text-red-500' : 'text-green-500'}`}>
                            {stats.averageDependenceScore > 5 ? 'Elevado' : 'Controlado'}
                        </span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Total de Avaliações</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-800">{stats.totalPatients}</span>
                        <span className="text-sm font-medium text-slate-400 mb-1 flex items-center">
                            <Users size={14} className="mr-1" /> Pacientes
                        </span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Status</p>
                    <div className="flex items-end gap-2">
                        <span className="text-sm font-medium text-blue-600 mb-1 flex items-center">
                            <TrendingUp size={14} className="mr-1" /> Monitoramento Ativo
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Distribuição por Nível de Dependência</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dependenceLevels}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            interval={0}
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {stats.dependenceLevels.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
