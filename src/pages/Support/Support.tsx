import React, { useState } from 'react';
import { MessageCircle, LifeBuoy, ChevronDown, Send, CheckCircle } from 'lucide-react';
import { whatsappService } from '../../services/integrations/whatsappService';

const Support: React.FC = () => {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Central de Ajuda & Suporte</h2>
                <p className="text-slate-500 mt-1">Estamos aqui para ajudar você em sua jornada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Fale com a Unidade */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Fale com sua Unidade</h3>
                            <p className="text-sm text-slate-500">Recepção / Coordenação</p>
                        </div>
                    </div>

                    <p className="text-slate-600 mb-6 flex-grow">
                        Tire dúvidas sobre horários, locais dos grupos, ou avise sobre faltas diretamente pelo WhatsApp da unidade.
                    </p>

                    <button
                        onClick={() => whatsappService.getSupportLink()}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <MessageCircle size={20} />
                        Iniciar Conversa no WhatsApp
                    </button>
                </div>

                {/* Section 2: Suporte Técnico */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <LifeBuoy size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Suporte Técnico</h3>
                            <p className="text-sm text-slate-500">Problemas com o App?</p>
                        </div>
                    </div>

                    {formStatus === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Mensagem Enviada!</h4>
                            <p className="text-slate-600 text-sm">
                                Sua solicitação foi recebida pela equipe de TI.<br />
                                Protocolo: <span className="font-mono font-bold text-slate-800">#1234</span>
                            </p>
                            <button
                                onClick={() => setFormStatus('idle')}
                                className="mt-6 text-blue-600 font-medium hover:underline text-sm"
                            >
                                Enviar nova mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Assunto</label>
                                <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50">
                                    <option>Erro no Aplicativo</option>
                                    <option>Dificuldade de Acesso</option>
                                    <option>Sugestão de Melhoria</option>
                                    <option>Outro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Mensagem</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 resize-none"
                                    placeholder="Descreva seu problema..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={formStatus === 'sending'}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                            >
                                {formStatus === 'sending' ? 'Enviando...' : (
                                    <>
                                        <Send size={16} /> Enviar Mensagem
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Section 3: FAQ */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Perguntas Frequentes</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { id: 'faq1', q: 'Como confirmar minha presença no grupo?', a: 'Acesse a tela inicial (Dashboard) e procure pelo cartão "Próximo Encontro". Clique no botão "Confirmar Presença" que aparecerá 24h antes da sessão.' },
                        { id: 'faq2', q: 'Posso mudar de grupo?', a: 'A mudança de grupo deve ser avaliada pelo seu terapeuta de referência. Utilize o botão "Fale com sua Unidade" acima para solicitar uma reavaliação.' },
                        { id: 'faq3', q: 'Como atualizar meu telefone ou endereço?', a: 'Vá até a página "Meu Perfil" no menu lateral. Clique em "Editar Perfil", atualize suas informações e clique em "Salvar Alterações".' }
                    ].map((item) => (
                        <div key={item.id} className="group">
                            <button
                                onClick={() => toggleFaq(item.id)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-medium text-slate-700">{item.q}</span>
                                <ChevronDown
                                    size={20}
                                    className={`text-slate-400 transition-transform duration-200 ${openFaq === item.id ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {openFaq === item.id && (
                                <div className="px-6 pb-4 text-sm text-slate-600 animate-fade-in">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Support;
