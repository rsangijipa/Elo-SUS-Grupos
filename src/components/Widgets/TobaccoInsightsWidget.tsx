import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, TrendingUp, Users } from 'lucide-react';

const MOCK_DATA = [
    { name: 'Muito Baixo', value: 4, color: '#4ADE80' },
    { name: 'Baixo', value: 6, color: '#60A5FA' },
    { name: 'Médio', value: 8, color: '#FBBF24' },
    { name: 'Elevado', value: 5, color: '#F87171' },
    { name: 'Muito Elevado', value: 2, color: '#EF4444' },
];

export default function TobaccoInsightsWidget() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={20} className="text-orange-500" />
                        Insights do Grupo (Tabagismo)
                    </h3>
                    <p className="text-sm text-slate-500">Dados consolidados do Grupo PNCT - Terças 14h</p>
                </div>
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                    Semana 4/12
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Nível Médio de Dependência</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-800">7.2</span>
                        <span className="text-sm font-medium text-red-500 mb-1">Elevado</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Taxa de Sucesso (4 semanas)</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-800">45%</span>
                        <span className="text-sm font-medium text-green-500 mb-1 flex items-center">
                            <TrendingUp size={14} className="mr-1" /> +12%
                        </span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">Pacientes Ativos</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-800">25</span>
                        <span className="text-sm font-medium text-slate-400 mb-1 flex items-center">
                            <Users size={14} className="mr-1" /> Total
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Distribuição por Nível de Dependência</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_DATA}>
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
                            {MOCK_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
