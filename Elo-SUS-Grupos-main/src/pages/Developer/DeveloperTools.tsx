import React from 'react';
import { Trash2, AlertTriangle, Map as MapIcon, Cloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const DeveloperTools: React.FC = () => {
    const { user } = useAuth();

    const handleCleanup = async () => {
        if (window.confirm('ATENÇÃO: Isso apagará TODOS os dados de teste do banco de dados. Tem certeza?')) {
            try {
                const { cleanupDatabase } = await import('../../utils/cleanup');
                await cleanupDatabase();
                toast.success('Banco de dados limpo com sucesso.');
            } catch (error) {
                console.error('Erro ao limpar banco de dados:', error);
                toast.error('Erro ao limpar banco de dados. Verifique o console.');
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

            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">
                    As ferramentas de banco de dados e território foram movidas ou desativadas para segurança em produção.
                    Utilize o <a href="/admin" className="text-blue-600 font-bold hover:underline">Painel Administrativo</a> para gestão.
                </p>
            </div>
        </div>
    );
};

export default DeveloperTools;
