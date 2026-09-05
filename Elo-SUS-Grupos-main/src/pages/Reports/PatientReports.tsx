import React, { useState, useEffect } from 'react';
import { TrendingUp, Moon, Brain, Lightbulb } from 'lucide-react';
import { moodService, MoodEntry } from '../../services/integrations/moodService';
import { useAuth } from '../../contexts/AuthContext';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

const PatientReports: React.FC = () => {
    const { user } = useAuth();
    const [moodData, setMoodData] = useState<MoodEntry[]>([]);

    useEffect(() => {
        if (user?.id) {
            moodService.getMoodHistory(user.id).then(data => {
                setMoodData(data);
            });
        }
    }, [user]);

    const averageMood = moodData.length > 0
        ? (moodData.reduce((acc, curr) => acc + curr.moodScore, 0) / moodData.length).toFixed(1)
        : '-';

    const averageSleep = moodData.length > 0
        ? (moodData.reduce((acc, curr) => acc + curr.sleepHours, 0) / moodData.length).toFixed(1)
        : '-';

    if (moodData.length === 0) {
        return (
            <div className="space-y-8 animate-fade-in pb-12">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Relatórios de Progresso</h2>
                    <p className="text-slate-500 mt-1">Análise integrada da sua saúde mental e física.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <Brain size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Ainda não há dados suficientes</h3>
                    <p className="text-slate-500 max-w-md">
                        Comece a registrar seu humor e sono diariamente para visualizar seus relatórios e receber insights personalizados.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Relatórios de Progresso</h2>
                <p className="text-slate-500 mt-1">Análise integrada da sua saúde mental e física.</p>
            </div>

            {/* Insight Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Lightbulb size={24} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-1">Insight da Semana</h3>
                    <p className="text-indigo-100 leading-relaxed">
                        Continue registrando seu humor e sono para receber insights personalizados sobre seus padrões de bem-estar.
                    </p>
                </div>
            </div>

            {/* Data Fusion Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="text-purple-600" size={20} />
                        Humor vs. Qualidade do Sono
                    </h3>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1 text-purple-600">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div> Humor (0-10)
                        </span>
                        <span className="flex items-center gap-1 text-blue-500">
                            <div className="w-3 h-3 rounded-full bg-blue-400 opacity-50"></div> Sono (Horas)
                        </span>
                    </div>
                </div>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" domain={[0, 10]} hide />
                            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" domain={[0, 12]} hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar yAxisId="right" dataKey="sleepHours" name="Horas de Sono" fill="#60a5fa" fillOpacity={0.3} barSize={20} radius={[4, 4, 0, 0]} />
                            <Line yAxisId="left" type="monotone" dataKey="moodScore" name="Nível de Humor" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                        <Brain size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase">Média de Humor</p>
                        <h4 className="text-2xl font-bold text-slate-900">{averageMood}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Moon size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase">Média de Sono</p>
                        <h4 className="text-2xl font-bold text-slate-900">{averageSleep}h</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientReports;
