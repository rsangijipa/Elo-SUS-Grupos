import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, Eye, ArrowRight } from 'lucide-react';
import type { Patient } from '../../types/patient';
import type { MoodLog } from '../../services/moodService';

interface HealthRadarProps {
    patients: Patient[];
    moodMap: Record<string, MoodLog | null>;
}

const HealthRadar: React.FC<HealthRadarProps> = ({ patients, moodMap }) => {
    const navigate = useNavigate();

    const stats = useMemo(() => {
        let totalMood = 0;
        let moodCount = 0;
        let activeCount = 0;
        const risks: { type: 'critical' | 'support' | 'monitor', patient: Patient, mood?: number, daysAbsent?: number }[] = [];

        const now = new Date();

        patients.forEach(p => {
            // Mood Stats
            const moodLog = moodMap[p.id || ''];
            if (moodLog) {
                totalMood += moodLog.value;
                moodCount++;
            }

            // Engagement Stats
            let daysAbsent = 999;
            if (p.stats?.lastLogin) {
                const lastLoginDate = new Date(p.stats.lastLogin.seconds ? p.stats.lastLogin.seconds * 1000 : p.stats.lastLogin);
                const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
                daysAbsent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (daysAbsent <= 3) activeCount++;
            }

            // Risk Logic
            const moodVal = moodLog?.value || 3; // Default to neutral if unknown for safety, but logic below handles it

            if (moodLog && moodVal < 2 && daysAbsent > 7) {
                risks.push({ type: 'critical', patient: p, mood: moodVal, daysAbsent });
            } else if (moodLog && moodVal < 2 && daysAbsent <= 3) {
                risks.push({ type: 'support', patient: p, mood: moodVal, daysAbsent });
            } else if (moodLog && moodVal > 4 && daysAbsent > 15) {
                risks.push({ type: 'monitor', patient: p, mood: moodVal, daysAbsent });
            }
        });

        return {
            avgMood: moodCount > 0 ? (totalMood / moodCount).toFixed(1) : '0.0',
            engagementRate: patients.length > 0 ? Math.round((activeCount / patients.length) * 100) : 0,
            risks: risks.slice(0, 3) // Top 3
        };
    }, [patients, moodMap]);

    // Chart Data
    const moodData = [
        { name: 'Score', value: parseFloat(stats.avgMood) },
        { name: 'Remaining', value: 5 - parseFloat(stats.avgMood) }
    ];

    const engagementData = [
        { name: 'Active', value: stats.engagementRate },
        { name: 'Inactive', value: 100 - stats.engagementRate }
    ];

    const getMoodColor = (score: number) => {
        if (score >= 4) return '#22c55e'; // Green
        if (score >= 2.5) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Thermometer */}
                <div className="lg:col-span-1 border-r border-slate-100 pr-6">
                    <h3 className="font-bold text-slate-800 mb-6">Status da Unidade</h3>

                    <div className="flex items-center justify-around">
                        {/* Mood Chart */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={moodData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={45}
                                            startAngle={180}
                                            endAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill={getMoodColor(parseFloat(stats.avgMood))} />
                                            <Cell fill="#f1f5f9" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1 text-center">
                                    <span className="text-xl font-bold text-slate-800">{stats.avgMood}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-bold text-center mt-[-20px]">Bem-Estar</p>
                            </div>
                        </div>

                        {/* Engagement Chart */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={engagementData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={45}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#f1f5f9" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className="text-xl font-bold text-slate-800">{stats.engagementRate}%</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-bold mt-[-10px]">Engajamento</p>
                        </div>
                    </div>
                </div>

                {/* Right: Risk Matrix */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Atenção Prioritária</h3>
                        <button
                            onClick={() => navigate('/reports/unit')}
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            Ver Relatório Completo
                        </button>
                    </div>

                    <div className="space-y-3">
                        {stats.risks.length > 0 ? (
                            stats.risks.map((risk, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${risk.type === 'critical' ? 'bg-red-50 border-red-100' :
                                    risk.type === 'support' ? 'bg-yellow-50 border-yellow-100' :
                                        'bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${risk.type === 'critical' ? 'bg-red-100 text-red-600' :
                                            risk.type === 'support' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {risk.type === 'critical' ? <AlertTriangle size={18} /> :
                                                risk.type === 'support' ? <Activity size={18} /> :
                                                    <Eye size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{risk.patient.name}</p>
                                            <p className="text-xs text-slate-600">
                                                {risk.type === 'critical' ? 'Risco de Abandono/Crise' :
                                                    risk.type === 'support' ? 'Pedindo Ajuda (Alta Frequência)' :
                                                        'Possível Alta ou Desistência'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-500">
                                            Humor: {risk.mood} • Ausente: {risk.daysAbsent}d
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 flex items-center justify-end gap-1 mt-1 hover:underline">
                                            Ver Perfil <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                Nenhum alerta crítico identificado no momento.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthRadar;
