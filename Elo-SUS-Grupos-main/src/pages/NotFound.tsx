import React from 'react';
import { MapPinned, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-3xl rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-xl shadow-blue-100/40">
                <div className="h-2 bg-gradient-to-r from-[#0054A6] via-[#00A99D] to-[#F5821F]" />
                <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] p-8 md:p-12 items-center bg-[radial-gradient(circle_at_top_left,_rgba(0,84,166,0.08),_transparent_45%),linear-gradient(180deg,_#ffffff,_#f8fbff)]">
                    <div className="space-y-5">
                        <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0054A6]">
                            Erro 404
                        </div>
                        <div>
                            <p className="text-6xl md:text-7xl font-black text-slate-900 leading-none">404</p>
                            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">Pagina nao encontrada</h1>
                            <p className="mt-3 text-slate-600 max-w-xl">
                                O caminho acessado nao existe ou pode ter sido movido. Vamos te levar de volta para o painel principal do EloSUS.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0054A6] px-5 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-[#004080]"
                        >
                            Voltar ao inicio
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-100 blur-2xl opacity-80" />
                        <div className="relative rounded-[1.75rem] border border-white/80 bg-white/80 backdrop-blur p-8 text-center shadow-lg">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#0054A6] text-white shadow-lg shadow-blue-200">
                                <MapPinned size={42} />
                            </div>
                            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Navegacao</p>
                            <p className="mt-2 text-lg font-semibold text-slate-800">O mapa terminou aqui</p>
                            <p className="mt-2 text-sm text-slate-500">
                                Confira o endereco digitado ou retorne ao dashboard para seguir sua jornada no sistema.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
