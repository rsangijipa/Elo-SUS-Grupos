import React, { useState } from 'react';
import { MapPin, Activity, Users, Plus, Building2 } from 'lucide-react';

interface HealthUnit {
    id: string;
    name: string;
    type: 'UBS' | 'CAPS' | 'NASF' | 'HOSPITAL';
    region: string;
    activeGroups: number;
    status: 'active' | 'inactive';
}

const MOCK_UNITS: HealthUnit[] = [
    { id: '1', name: 'UBS Santa Cecília', type: 'UBS', region: 'Centro', activeGroups: 3, status: 'active' },
    { id: '2', name: 'CAPS II Perdizes', type: 'CAPS', region: 'Oeste', activeGroups: 5, status: 'active' },
    { id: '3', name: 'UBS República', type: 'UBS', region: 'Centro', activeGroups: 0, status: 'inactive' },
    { id: '4', name: 'NASF Pinheiros', type: 'NASF', region: 'Oeste', activeGroups: 2, status: 'active' },
];

const NetworkManager: React.FC = () => {
    const [units] = useState<HealthUnit[]>(MOCK_UNITS);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestão de Rede</h2>
                    <p className="text-slate-500 mt-1">Gerenciamento de Unidades de Saúde e Territórios.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Nova Unidade
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(unit => (
                    <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${unit.type === 'CAPS' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{unit.name}</h3>
                                    <span className="text-xs font-medium text-slate-500">{unit.type} • {unit.region}</span>
                                </div>
                            </div>
                            <span className={`w-3 h-3 rounded-full ${unit.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={unit.status === 'active' ? 'Ativo' : 'Inativo'}></span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Users size={16} className="text-slate-400" />
                                <span className="text-sm font-medium">{unit.activeGroups} Grupos</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Activity size={16} className="text-slate-400" />
                                <span className="text-sm font-medium">{unit.status === 'active' ? 'Operacional' : 'Sem Atividade'}</span>
                            </div>
                        </div>

                        <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            Ver Detalhes
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NetworkManager;
