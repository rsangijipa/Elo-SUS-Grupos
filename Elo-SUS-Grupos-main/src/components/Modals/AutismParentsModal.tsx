import React from 'react';
import { X, Heart, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';
import TTSButton from '../Common/TTSButton';

interface AutismParentsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AutismParentsModal: React.FC<AutismParentsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Heart size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Apoio a Pais Atípicos</h2>
                            <p className="text-xs text-slate-500">Recursos e acolhimento para sua jornada</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TTSButton text="Apoio a Pais Atípicos. Recursos e acolhimento para sua jornada." />
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">

                    <div className="text-center space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">Você não está sozinho(a)</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Sabemos que a jornada de pais atípicos tem desafios únicos.
                            Aqui você encontra materiais de apoio e canais de escuta especializados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold">
                                <BookOpen size={20} />
                                <span>Guia de Direitos</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">Conheça os direitos garantidos por lei para pessoas com TEA e suas famílias.</p>
                            <a href="#" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                                Acessar Guia <ExternalLink size={14} />
                            </a>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold">
                                <MessageCircle size={20} />
                                <span>Grupos de Apoio</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">Conecte-se com outros pais e troque experiências em nossos grupos mediados.</p>
                            <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                                Ver Horários <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2">Precisa conversar agora?</h4>
                        <p className="text-sm text-blue-700 mb-4">
                            Nossa equipe de acolhimento está disponível para te ouvir.
                        </p>
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200">
                            Solicitar Acolhimento Individual
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AutismParentsModal;
