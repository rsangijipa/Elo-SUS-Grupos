import EmptyState from '../components/ui/EmptyState';

export default function Reports() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Relatórios e Indicadores</h2>
            <EmptyState
                title="Nenhum relatório gerado"
                description="Selecione um período ou grupo específico para gerar relatórios de produção (BPA) e frequência."
                actionLabel="Gerar Novo Relatório"
                onAction={() => console.log('Gerar relatório')}
            />
        </div>
    );
}
