import React from 'react';

export interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    iconBg?: string;
    trend?: { value: number; label: string };
    onClick?: () => void;
    loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon,
    iconBg = 'bg-blue-50 text-[#0054A6]',
    trend,
    onClick,
    loading = false
}) => {
    const isPositiveTrend = (trend?.value || 0) >= 0;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`w-full text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-default'}`}
        >
            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-24 rounded bg-slate-200" />
                            <div className="h-8 w-20 rounded bg-slate-300" />
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-slate-200" />
                    </div>
                    <div className="h-3 w-32 rounded bg-slate-100" />
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">{title}</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${iconBg}`}>
                            {icon}
                        </div>
                    </div>

                    {(subtitle || trend) && (
                        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                            {subtitle ? <span className="text-xs font-bold text-slate-500">{subtitle}</span> : <span />}
                            {trend ? (
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isPositiveTrend ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                                </span>
                            ) : null}
                        </div>
                    )}
                </>
            )}
        </button>
    );
};

export default KPICard;
