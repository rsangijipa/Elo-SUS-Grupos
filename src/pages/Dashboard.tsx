import React from 'react';
import { Users, Calendar, CheckCircle, Clock, Database } from 'lucide-react';
import { seedDatabase } from '../utils/seedData';

const Dashboard: React.FC = () => {
    const stats = [
        { name: 'Grupos Ativos', value: '12', icon: Users, color: 'bg-blue-500' },
        { name: 'Pacientes Atendidos (Mês)', value: '148', icon: CheckCircle, color: 'bg-green-500' },
        { name: 'Sessões Agendadas', value: '24', icon: Calendar, color: 'bg-purple-500' },
        { name: 'Lista de Espera', value: '35', icon: Clock, color: 'bg-yellow-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Painel de Controle</h2>
                <button
                    onClick={seedDatabase}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 border border-purple-200"
                    title="Gerar dados de demonstração"
                >
                    <Database size={14} />
                    Seed Data
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`rounded-md p-3 ${item.color}`}>
                                        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{item.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Próximas Sessões</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-12 text-center bg-white rounded border border-gray-200 p-1">
                                        <span className="block text-xs text-gray-500">NOV</span>
                                        <span className="block text-lg font-bold text-gray-900">{21 + i}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Grupo de Tabagismo</h4>
                                        <p className="text-sm text-gray-500">14:00 - Sala 03 (UBS Central)</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Confirmado
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Avisos Recentes</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Lembrete: Reunião de coordenação na sexta-feira às 09h.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        Novos materiais psicoeducativos adicionados à biblioteca.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
