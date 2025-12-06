import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, FileText, CheckCircle, Sparkles, AlertTriangle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { DischargeType, DischargeStatus } from '../types/shared';
import { getDischargeText } from '../services/ReportTemplates';
import { AIService } from '../services/vertexAI';

interface DischargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientName: string;
    groupName: string;
    originUnit: string;
    distanceToUnit?: number; // Added for TFD analysis
    onConfirm: (data: DischargeData) => void;
}

export interface DischargeData {
    status: DischargeStatus;
    dischargeType: DischargeType;
    dischargeReason: string; // O texto final gerado
    destinationUnit?: string;
    cidCodeSecondary?: string;
    patientAware: boolean;
}

import { useSettings } from '../contexts/SettingsContext';

// ... interface ...

const DischargeModal: React.FC<DischargeModalProps> = ({
    isOpen, onClose, patientName, groupName, originUnit: propOriginUnit, distanceToUnit, onConfirm
}) => {
    const { unitAddress, unitName } = useSettings();
    const originUnit = propOriginUnit || unitName; // Use prop or fallback to settings

    const [dischargeType, setDischargeType] = useState<DischargeType>('IMPROVEMENT');
    const [destinationUnit, setDestinationUnit] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [patientAware, setPatientAware] = useState(false);
    const [cidSecondary, setCidSecondary] = useState('');

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<{
        cid: string;
        risk: 'LOW' | 'MEDIUM' | 'HIGH';
        tfd: boolean;
        reasoning: string;
    } | null>(null);

    // Regenera o texto quando as dependências mudam
    useEffect(() => {
        const text = getDischargeText(dischargeType, {
            NOME_PACIENTE: patientName,
            NOME_GRUPO: groupName,
            UBS_ORIGEM: originUnit,
            DESTINO_SUGERIDO: destinationUnit
        });
        setGeneratedText(text);
    }, [dischargeType, destinationUnit, patientName, groupName, originUnit]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        toast.success('Texto copiado para a área de transferência!');
    };

    const handleAnalyzeCase = async () => {
        if (!generatedText) return;

        setIsAnalyzing(true);
        // Toast loading? Default toast handles async promises well usually, but we'll manage manually
        const toastId = toast.loading('Consultando IA...');

        try {
            const result = await AIService.analyzeClinicalRisk({
                name: patientName,
                clinicalNotes: generatedText,
                group: groupName
            }, distanceToUnit || 0);

            setAiSuggestion({
                cid: result.suggestedCID,
                risk: result.riskLevel,
                tfd: result.tfdEligible,
                reasoning: result.reasoning
            });

            toast.success('Análise concluída!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao analisar caso.', { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = () => {
        if (dischargeType === 'REFERRAL' && !destinationUnit) {
            toast.error('Informe o destino sugerido para o encaminhamento.');
            return;
        }
        if (!patientAware && dischargeType !== 'ABANDONMENT') {
            toast.error('Confirme que o paciente está ciente da alta.');
            return;
        }

        // Mapeia DischargeType para Status de Enrollment
        let status: DischargeStatus = 'DISCHARGED';
        if (dischargeType === 'ABANDONMENT') status = 'DROPOUT';
        if (dischargeType === 'REFERRAL') status = 'TRANSFERRED';
        if (dischargeType === 'SHARED_CARE') status = 'SHARED_CARE';

        onConfirm({
            status,
            dischargeType,
            dischargeReason: generatedText,
            destinationUnit,
            cidCodeSecondary: cidSecondary,
            patientAware
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-md p-4 pt-10 sm:pt-20 animate-in fade-in duration-200" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all scale-100 relative z-[10000]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Finalizar Ciclo / Alta</h2>
                            <p className="text-sm text-slate-500">Geração de Contrarreferência para UBS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Tipo de Desfecho */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Desfecho</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                onClick={() => setDischargeType('IMPROVEMENT')}
                                className={`p-3 rounded-lg border text-left transition-all ${dischargeType === 'IMPROVEMENT' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-200'}`}
                            >
                                <div className="font-bold text-sm">Alta por Melhora</div>
                                <div className="text-xs opacity-80">Conclusão do ciclo terapêutico</div>
                            </button>

                            <button
                                onClick={() => setDischargeType('SHARED_CARE')}
                                className={`p-3 rounded-lg border text-left transition-all ${dischargeType === 'SHARED_CARE' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-200'}`}
                            >
                                <div className="font-bold text-sm">Cuidado Compartilhado</div>
                                <div className="text-xs opacity-80">Manutenção do vínculo com UBS</div>
                            </button>

                            <button
                                onClick={() => setDischargeType('REFERRAL')}
                                className={`p-3 rounded-lg border text-left transition-all ${dischargeType === 'REFERRAL' ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-200'}`}
                            >
                                <div className="font-bold text-sm">Encaminhamento</div>
                                <div className="text-xs opacity-80">Necessidade de maior complexidade</div>
                            </button>

                            <button
                                onClick={() => setDischargeType('ABANDONMENT')}
                                className={`p-3 rounded-lg border text-left transition-all ${dischargeType === 'ABANDONMENT' ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-slate-200 hover:border-red-200'}`}
                            >
                                <div className="font-bold text-sm">Abandono / Evasão</div>
                                <div className="text-xs opacity-80">Solicitação de Busca Ativa</div>
                            </button>
                        </div>
                    </div>

                    {/* Campos Condicionais */}
                    {dischargeType === 'REFERRAL' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Destino Sugerido *</label>
                            <input
                                type="text"
                                value={destinationUnit}
                                onChange={(e) => setDestinationUnit(e.target.value)}
                                placeholder="Ex: CAPS II, Ambulatório de Saúde Mental, Neurologia..."
                                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}

                    {/* Preview do Texto */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Texto de Orientação (Contrarreferência)</label>
                                <p className="text-xs text-slate-500">Este texto será enviado à UBS de origem.</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAnalyzeCase}
                                    disabled={isAnalyzing}
                                    data-testid="btn-ai-analysis"
                                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium border border-purple-200"
                                >
                                    {isAnalyzing ? (
                                        <span className="animate-pulse">Analisando...</span>
                                    ) : (
                                        <>
                                            <Sparkles size={14} className="text-purple-600" />
                                            Analisar com IA
                                        </>
                                    )}
                                </button>
                                <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200">
                                    <Copy size={14} /> Copiar
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={generatedText}
                            onChange={(e) => setGeneratedText(e.target.value)}
                            rows={8}
                            className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm leading-relaxed text-slate-700 shadow-inner bg-slate-50 resize-y"
                        />

                        {/* AI Feedback Area */}
                        {aiSuggestion && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-semibold text-slate-500 mr-2">Sugestões da IA:</span>

                                    {/* CID Suggestion */}
                                    <button
                                        onClick={() => setCidSecondary(aiSuggestion.cid)}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs hover:bg-indigo-100 transition-colors"
                                        title={aiSuggestion.reasoning}
                                    >
                                        <Sparkles size={12} />
                                        Sugerido: {aiSuggestion.cid}
                                    </button>

                                    {/* TFD Alert */}
                                    {aiSuggestion.tfd && (
                                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                                            <AlertTriangle size={12} />
                                            Elegível TFD (+50km)
                                        </div>
                                    )}

                                    {/* Risk Level */}
                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium
                                        ${aiSuggestion.risk === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                                            aiSuggestion.risk === 'MEDIUM' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-green-50 text-green-700 border-green-200'}`}
                                    >
                                        Risco {aiSuggestion.risk === 'HIGH' ? 'Alto' : aiSuggestion.risk === 'MEDIUM' ? 'Médio' : 'Baixo'}
                                    </div>

                                    {/* Location Info (if used) */}
                                    {distanceToUnit && distanceToUnit > 0 && (
                                        <div className="inline-flex items-center gap-1 px-2 text-xs text-slate-400">
                                            <MapPin size={12} />
                                            {distanceToUnit.toFixed(1)} km
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 max-w-xl truncate">
                                    Motivo: {aiSuggestion.reasoning}
                                </p>
                            </div>
                        )}

                    </div>

                    {/* CID Secundário (Opcional) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">CID Secundário (Opcional)</label>
                        <input
                            type="text"
                            value={cidSecondary}
                            onChange={(e) => setCidSecondary(e.target.value)}
                            placeholder="Ex: F32.2 (Se diferente do grupo)"
                            className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
                        />
                    </div>

                    {/* Checklist */}
                    {dischargeType !== 'ABANDONMENT' && (
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="aware"
                                checked={patientAware}
                                onChange={(e) => setPatientAware(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="aware" className="text-sm text-slate-700 cursor-pointer select-none">
                                Declaro que o paciente foi <strong>orientado sobre a alta</strong> e compreende a necessidade de manter vínculo com a UBS de origem ou seguir o fluxo de encaminhamento proposto.
                            </label>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0054A6] text-white font-bold rounded-lg hover:bg-[#004080] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="btn-generate-pdf"
                    >
                        <CheckCircle size={18} />
                        Confirmar e Gerar PDF
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default DischargeModal;

