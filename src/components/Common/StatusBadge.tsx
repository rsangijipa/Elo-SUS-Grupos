import React from 'react';

type StatusBadgeValue =
    | 'active'
    | 'waiting'
    | 'inactive'
    | 'discharged'
    | 'dropout'
    | 'planned'
    | 'completed'
    | 'archived'
    | 'paused'
    | 'closed'
    | 'encaminhado'
    | 'convidado'
    | 'concluido'
    | 'cancelado'
    | 'critical'
    | 'support'
    | 'monitor'
    | 'normal'
    | 'alto'
    | 'moderado'
    | 'baixo';

interface StatusBadgeProps {
    status: StatusBadgeValue;
    label?: string;
    className?: string;
}

const STATUS_STYLES: Record<StatusBadgeValue, string> = {
    active: 'bg-status-active/10 text-status-active',
    waiting: 'bg-status-waiting/10 text-status-waiting',
    inactive: 'bg-status-inactive/15 text-slate-600',
    discharged: 'bg-status-discharged/10 text-status-discharged',
    dropout: 'bg-status-dropout/10 text-status-dropout',
    planned: 'bg-status-discharged/10 text-status-discharged',
    completed: 'bg-status-active/10 text-status-active',
    archived: 'bg-status-inactive/15 text-slate-600',
    paused: 'bg-status-waiting/10 text-status-waiting',
    closed: 'bg-status-inactive/15 text-slate-600',
    encaminhado: 'bg-status-discharged/10 text-status-discharged',
    convidado: 'bg-brand-patient/10 text-brand-patient',
    concluido: 'bg-status-active/10 text-status-active',
    cancelado: 'bg-status-inactive/15 text-slate-600',
    critical: 'bg-status-dropout/10 text-status-dropout',
    support: 'bg-status-waiting/10 text-status-waiting',
    monitor: 'bg-status-discharged/10 text-status-discharged',
    normal: 'bg-status-active/10 text-status-active',
    alto: 'bg-status-dropout/10 text-status-dropout',
    moderado: 'bg-status-waiting/10 text-status-waiting',
    baixo: 'bg-status-active/10 text-status-active'
};

const STATUS_LABELS: Record<StatusBadgeValue, string> = {
    active: 'Ativo',
    waiting: 'Aguardando',
    inactive: 'Inativo',
    discharged: 'Alta',
    dropout: 'Abandono',
    planned: 'Planejado',
    completed: 'Concluido',
    archived: 'Arquivado',
    paused: 'Pausado',
    closed: 'Fechado',
    encaminhado: 'Encaminhado',
    convidado: 'Convidado',
    concluido: 'Concluido',
    cancelado: 'Cancelado',
    critical: 'Critico',
    support: 'Suporte',
    monitor: 'Monitorar',
    normal: 'Normal',
    alto: 'Alto',
    moderado: 'Moderado',
    baixo: 'Baixo'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status]} ${className}`.trim()}>
            {label || STATUS_LABELS[status]}
        </span>
    );
};

export default StatusBadge;
