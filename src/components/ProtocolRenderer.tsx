import React from 'react';
import { GroupProtocol } from '../types/group';
import TobaccoAnamnesisForm from '../pages/Protocols/Tobacco/TobaccoAnamnesisForm';

interface ProtocolRendererProps {
    protocol: GroupProtocol;
    patientId: string;
    onSave: (data: any) => void;
}

export default function ProtocolRenderer({ protocol, patientId, onSave }: ProtocolRendererProps) {
    switch (protocol) {
        case 'TABAGISMO':
            return <TobaccoAnamnesisForm patientId={patientId} onSave={onSave} />;
        default:
            return (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p>Protocolo <strong>{protocol}</strong> ainda não implementado.</p>
                </div>
            );
    }
}
