import React, { useMemo } from 'react';
import { Map, AlertTriangle, Users } from 'lucide-react';
import { Patient } from '../../types/patient';

interface HeatmapWidgetProps {
    patients: Patient[];
}

const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({ patients }) => {
    const neighborhoodData = useMemo(() => {
        const stats: Record<string, { total: number; highRisk: number }> = {};

        patients.forEach(patient => {
            // Normalize neighborhood: trim, lowercase, handle empty/undefined
            let hood = patient.neighborhood?.trim() || 'Não Informado';
            if (hood === '') hood = 'Não Informado';

            // Capitalize for display
            const displayName = hood === 'Não Informado' ? hood : hood.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

            if (!stats[displayName]) {
                stats[displayName] = { total: 0, highRisk: 0 };
            }

            stats[displayName].total += 1;
            if (patient.hasAlert) {
                stats[displayName].highRisk += 1;
            }
        });

        // Convert to array and sort by High Risk count (descending)
        return Object.entries(stats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.highRisk - a.highRisk || b.total - a.total)
            .slice(0, 5); // Top 5 neighborhoods
    }, [patients]);

    const maxTotal = Math.max(...neighborhoodData.map(d => d.total), 1);

    // Generate insight text
    const topHood = neighborhoodData[0];
    const insight = topHood && topHood.highRisk > 0
        ? `Atenção: O bairro ${topHood.name} concentra ${Math.round((topHood.highRisk / topHood.total) * 100)}% dos casos de risco.`
        : "Nenhum foco de risco crítico identificado no momento.";

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Map className="text-blue-500" size={20} />
                    Visão Territorial (Top 5)
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mapa de Calor
                </span>
            </div>

            {/* Insight Alert */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800 font-medium leading-snug">
                    {insight}
                </p>
            </div>

            {/* List */}
            <div className="space-y-5">
                {neighborhoodData.map((hood, idx) => (
                    <div key={hood.name}>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="text-slate-300 w-4">{idx + 1}.</span>
                                {hood.name}
                            </span>
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-3">
                                <span className="flex items-center gap-1 text-amber-600">
                                    <AlertTriangle size={12} />
                                    {hood.highRisk}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {hood.total}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar Stack */}
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            {/* High Risk Segment */}
                            <div
                                className="h-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${(hood.highRisk / maxTotal) * 100}%` }}
                                title="Alto Risco"
                            ></div>
                            {/* Normal Segment */}
                            <div
                                className="h-full bg-blue-400 transition-all duration-500"
                                style={{ width: `${((hood.total - hood.highRisk) / maxTotal) * 100}%` }}
                                title="Baixo Risco"
                            ></div>
                        </div>
                    </div>
                ))}

                {neighborhoodData.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                        <Map size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Sem dados de localização suficientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeatmapWidget;
