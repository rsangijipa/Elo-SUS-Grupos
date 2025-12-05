import React, { Component, ErrorInfo, ReactNode } from 'react';
import { CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReport = () => {
        if (this.state.error) {
            navigator.clipboard.writeText(this.state.error.toString());
            alert('Erro copiado para a área de transferência!');
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 border border-white/50 text-center relative overflow-hidden">

                        {/* Background Accents */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-50"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-50"></div>

                        <div className="relative mb-6">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CloudOff size={40} className="text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-2">Ops, algo inesperado aconteceu.</h1>
                            <p className="text-slate-500">
                                Não se preocupe, seus dados estão seguros. Tente recarregar a página.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="mb-6 p-3 bg-red-50 rounded-xl text-left border border-red-100">
                                <p className="text-xs font-mono text-red-600 break-words line-clamp-3">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Recarregar Aplicação
                            </button>

                            <button
                                onClick={this.handleReport}
                                className="w-full py-3 bg-white text-slate-500 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <AlertTriangle size={16} />
                                Copiar Erro para Suporte
                            </button>
                        </div>

                        <p className="mt-8 text-[10px] text-slate-400">
                            EloSUS Grupos - Resiliência do Sistema
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
