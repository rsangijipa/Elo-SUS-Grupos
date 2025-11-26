import React from 'react';
import { Trash2, AlertTriangle, Map as MapIcon, Cloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DeveloperTools: React.FC = () => {
    const { user } = useAuth();

    const handleCleanup = async () => {
        if (window.confirm('ATENÇÃO: Isso apagará TODOS os dados de teste do banco de dados. Tem certeza?')) {
            try {
                const { cleanupDatabase } = await import('../../utils/cleanup');
                await cleanupDatabase();
                alert('Banco de dados limpo com sucesso.');
            } catch (error) {
                console.error('Erro ao limpar banco de dados:', error);
                alert('Erro ao limpar banco de dados. Verifique o console.');
            }
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="p-8 text-center text-red-600">
                <AlertTriangle size={48} className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Acesso Negado</h1>
                <p>Esta área é restrita para desenvolvedores.</p>
                <div className="mt-4 p-4 bg-red-50 rounded text-xs text-left inline-block">
                    <p>Debug Info:</p>
                    <p>Email: {user?.email}</p>
                    <p>ID: {user?.id}</p>
                    <p>Role: {user?.role}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Ferramentas de Desenvolvedor</h1>
                <p className="text-slate-500">Utilitários para manutenção e testes do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Tools */}
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Trash2 className="text-red-500" size={20} />
                        Banco de Dados
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Ações destrutivas para resetar o ambiente de testes.
                    </p>
                    <button
                        onClick={handleCleanup}
                        className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-200"
                    >
                        <Trash2 size={18} />
                        Limpar Banco de Dados (Cleanup DB)
                    </button>
                </div>

                {/* Territory Tools */}
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MapIcon className="text-blue-500" size={20} />
                        Território & UBS
                    </h2>
                    <p className="text-sm text-slate-600 mb-6">
                        Gerenciar unidades de saúde e sincronizar lista padrão de Ariquemes.
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const { healthUnitService } = await import('../../services/healthUnitService');
                                const count = await healthUnitService.syncInitialHealthUnits(true);
                                alert(`${count} Unidades Sincronizadas com Sucesso!`);
                            } catch (error) {
                                console.error('Erro ao sincronizar UBS:', error);
                                alert('Erro ao sincronizar UBS. Verifique o console.');
                            }
                        }}
                        className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-blue-200"
                    >
                        <Cloud className="w-5 h-5" />
                        Sincronizar UBS Ariquemes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeveloperTools;
