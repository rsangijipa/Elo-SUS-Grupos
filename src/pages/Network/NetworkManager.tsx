import React, { useState } from 'react';
import { MapPin, Activity, Users, Plus, Building2 } from 'lucide-react';

import { unitService, HealthUnit } from '../../services/unitService';

const NetworkManager: React.FC = () => {
    const [units, setUnits] = useState<HealthUnit[]>([]);

    React.useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        const data = await unitService.getAll();
        setUnits(data);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0054A6]">Gestão de Rede</h2>
                    <p className="text-slate-500 mt-1">Gerenciamento de Unidades de Saúde e Territórios.</p>
                </div>
                <button className="bg-[#0054A6] text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#004080] transition-all flex items-center gap-2">
                    <Plus size={18} />
                    Nova Unidade
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(unit => (
                    <div key={unit.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${unit.type === 'CAPS' ? 'bg-[#6C4FFE]/10 text-[#6C4FFE]' : 'bg-[#0054A6]/10 text-[#0054A6]'}`}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 group-hover:text-[#0054A6] transition-colors">{unit.name}</h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{unit.type} • {unit.region}</span>
                                </div>
                            </div>
                            <span className={`w-3 h-3 rounded-full ${unit.status === 'active' ? 'bg-[#0B8A4D] shadow-[0_0_8px_#0B8A4D]' : 'bg-red-400'}`} title={unit.status === 'active' ? 'Ativo' : 'Inativo'}></span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Users size={18} className="text-slate-400" />
                                <span className="text-sm font-bold">{unit.activeGroups} Grupos</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Activity size={18} className="text-slate-400" />
                                <span className="text-sm font-bold">{unit.status === 'active' ? 'Operacional' : 'Sem Atividade'}</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-3 text-sm font-bold text-[#0054A6] bg-[#F6F8FE] rounded-xl hover:bg-[#0054A6] hover:text-white transition-all">
                            Ver Detalhes
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NetworkManager;
