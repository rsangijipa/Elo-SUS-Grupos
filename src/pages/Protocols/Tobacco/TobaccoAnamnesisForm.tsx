import React, { useState, useEffect } from 'react';
import { Save, Calculator, Activity, History, AlertCircle, CheckCircle } from 'lucide-react';
import { TobaccoAnamnesis, INITIAL_FAGERSTROM_QUESTIONS, DependenceLevel } from '../../../types/protocols/tobacco';

interface TobaccoAnamnesisFormProps {
    patientId: string;
    initialData?: TobaccoAnamnesis;
    onSave: (data: TobaccoAnamnesis) => void;
}

export default function TobaccoAnamnesisForm({ patientId, initialData, onSave }: TobaccoAnamnesisFormProps) {
    const [activeTab, setActiveTab] = useState<'history' | 'fagerstrom' | 'physical'>('history');
    const [formData, setFormData] = useState<TobaccoAnamnesis>(initialData || {
        id: crypto.randomUUID(),
        patientId,
        date: new Date().toISOString(),
        smokingHistory: {
            startAge: 0,
            dailyQuantity: 0,
            type: 'industrial',
            associatedTriggers: []
        },
        fagerstrom: {
            questions: INITIAL_FAGERSTROM_QUESTIONS,
            totalScore: 0,
            dependenceLevel: 'Muito Baixo'
        },
        attemptsToQuit: {
            count: 0,
            methodsUsed: [],
            withdrawalSymptoms: []
        },
        comorbidities: {
            hypertension: false,
            diabetes: false,
            respiratory: false,
            cardiac: false,
            psychiatric: false
        },
        motivationStage: 'contemplation'
    });

    // Auto-calculate Fagerström Score
    useEffect(() => {
        const score = formData.fagerstrom.questions.reduce((acc, q) => acc + (q.selectedOption || 0), 0);
        let level: DependenceLevel = 'Muito Baixo';
        if (score >= 8) level = 'Muito Elevado';
        else if (score >= 6) level = 'Elevado';
        else if (score >= 5) level = 'Médio';
        else if (score >= 3) level = 'Baixo';

        setFormData(prev => ({
            ...prev,
            fagerstrom: {
                ...prev.fagerstrom,
                totalScore: score,
                dependenceLevel: level
            }
        }));
    }, [formData.fagerstrom.questions]);

    const handleFagerstromAnswer = (questionId: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            fagerstrom: {
                ...prev.fagerstrom,
                questions: prev.fagerstrom.questions.map(q =>
                    q.id === questionId ? { ...q, selectedOption: value } : q
                )
            }
        }));
    };

    const toggleTrigger = (trigger: string) => {
        setFormData(prev => {
            const triggers = prev.smokingHistory.associatedTriggers.includes(trigger)
                ? prev.smokingHistory.associatedTriggers.filter(t => t !== trigger)
                : [...prev.smokingHistory.associatedTriggers, trigger];
            return { ...prev, smokingHistory: { ...prev.smokingHistory, associatedTriggers: triggers } };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-white text-[#0054A6] border-t-2 border-[#0054A6]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History size={18} /> Histórico
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('fagerstrom')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'fagerstrom' ? 'bg-white text-[#0054A6] border-t-2 border-[#0054A6]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Calculator size={18} /> Teste de Fagerström
                    <span className={`text-xs px-2 py-0.5 rounded-full ${formData.fagerstrom.totalScore >= 6 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {formData.fagerstrom.totalScore}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('physical')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'physical' ? 'bg-white text-[#0054A6] border-t-2 border-[#0054A6]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Activity size={18} /> Avaliação Física
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'history' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Idade de Início</label>
                                <input
                                    type="number"
                                    value={formData.smokingHistory.startAge}
                                    onChange={e => setFormData({ ...formData, smokingHistory: { ...formData.smokingHistory, startAge: parseInt(e.target.value) } })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6]/20 focus:border-[#0054A6] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cigarros por Dia</label>
                                <input
                                    type="number"
                                    value={formData.smokingHistory.dailyQuantity}
                                    onChange={e => setFormData({ ...formData, smokingHistory: { ...formData.smokingHistory, dailyQuantity: parseInt(e.target.value) } })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6]/20 focus:border-[#0054A6] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Gatilhos Associados</label>
                            <div className="flex flex-wrap gap-2">
                                {['Café', 'Álcool', 'Estresse', 'Após Refeições', 'Dirigir', 'Solidão', 'Ansiedade'].map(trigger => (
                                    <button
                                        key={trigger}
                                        type="button"
                                        onClick={() => toggleTrigger(trigger)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.smokingHistory.associatedTriggers.includes(trigger)
                                            ? 'bg-[#0054A6] text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {trigger}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Estágio Motivacional</label>
                            <select
                                value={formData.motivationStage}
                                onChange={e => setFormData({ ...formData, motivationStage: e.target.value as any })}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6]/20 focus:border-[#0054A6] outline-none"
                            >
                                <option value="pre-contemplation">Pré-contemplação (Não pensa em parar)</option>
                                <option value="contemplation">Contemplação (Pensa em parar)</option>
                                <option value="preparation">Preparação (Marcou data)</option>
                                <option value="action">Ação (Parou recentemente)</option>
                                <option value="maintenance">Manutenção (Parou há mais de 6 meses)</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'fagerstrom' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 border border-blue-100">
                            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
                                <Calculator size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Resultado Atual</p>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {formData.fagerstrom.totalScore} pontos
                                    <span className="text-lg font-medium text-slate-500 ml-2">({formData.fagerstrom.dependenceLevel})</span>
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.fagerstrom.questions.map((q) => (
                                <div key={q.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                                    <p className="font-medium text-slate-800 mb-3 break-words">{q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt) => (
                                            <label key={opt.label} className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${q.selectedOption === opt.value ? 'border-[#0054A6] bg-[#0054A6]' : 'border-slate-300 group-hover:border-[#0054A6]'
                                                    }`}>
                                                    {q.selectedOption === opt.value && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    className="hidden"
                                                    checked={q.selectedOption === opt.value}
                                                    onChange={() => handleFagerstromAnswer(q.id, opt.value)}
                                                />
                                                <span className={`text-sm break-words ${q.selectedOption === opt.value ? 'text-[#0054A6] font-medium' : 'text-slate-600'}`}>
                                                    {opt.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'physical' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border border-slate-200 rounded-xl">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-red-500" /> Comorbidades
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { key: 'hypertension', label: 'Hipertensão Arterial' },
                                        { key: 'diabetes', label: 'Diabetes Mellitus' },
                                        { key: 'respiratory', label: 'Doenças Respiratórias' },
                                        { key: 'cardiac', label: 'Doenças Cardíacas' },
                                        { key: 'psychiatric', label: 'Transtornos Psiquiátricos' }
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(formData.comorbidities as any)[item.key]}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    comorbidities: { ...formData.comorbidities, [item.key]: e.target.checked }
                                                })}
                                                className="w-5 h-5 rounded border-slate-300 text-[#0054A6] focus:ring-[#0054A6]"
                                            />
                                            <span className="text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 rounded-xl">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-orange-500" /> Monoximetria
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">CO (ppm)</label>
                                        <input
                                            type="number"
                                            value={formData.monoximetry?.co || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                monoximetry: { ...formData.monoximetry!, co: parseFloat(e.target.value) }
                                            })}
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-[#0054A6]"
                                            placeholder="0.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">%HbCO</label>
                                        <input
                                            type="number"
                                            value={formData.monoximetry?.hbco || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                monoximetry: { ...formData.monoximetry!, hbco: parseFloat(e.target.value) }
                                            })}
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-[#0054A6]"
                                            placeholder="0.0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                    type="button"
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-[#0054A6] text-white rounded-lg font-bold hover:bg-[#004282] transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <Save size={18} /> Salvar Ficha
                </button>
            </div>
        </form>
    );
}
