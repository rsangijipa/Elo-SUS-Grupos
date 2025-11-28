import React, { useState } from 'react';
import { X, Users, Clock, MapPin, FileText, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { PROTOCOLS } from '../../config/protocols';
import { GroupProtocol } from '../../types/group';

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddGroupModal({ isOpen, onClose }: AddGroupModalProps) {
    const { addGroup } = useData();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        schedule: '',
        room: '',
        protocol: 'STANDARD' as GroupProtocol
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addGroup({
            name: formData.name,
            description: formData.description,
            schedule: formData.schedule,
            room: formData.room,
            status: 'active',
            facilitatorId: 'u1', // Default to current user or mock
            protocol: formData.protocol,
            maxParticipants: 10
        });
        onClose();
        setFormData({ name: '', description: '', schedule: '', room: '', protocol: 'STANDARD' });
    };

    return (
        <div className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in p-4 pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-[#0054A6] p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users size={24} />
                        Novo Grupo
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Quick Templates */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Modelos Rápidos</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    name: 'Grupo de Tabagismo',
                                    description: 'Grupo focado na cessação do tabagismo com abordagem cognitivo-comportamental.',
                                    protocol: 'TABAGISMO'
                                })}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                                + Tabagismo
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    name: 'Grupo de Gestantes',
                                    description: 'Acompanhamento pré-natal e orientações para gestantes.',
                                    protocol: 'STANDARD'
                                })}
                                className="px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-bold rounded-lg border border-pink-100 hover:bg-pink-100 transition-colors whitespace-nowrap"
                            >
                                + Gestantes
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    name: 'Grupo de Ansiedade',
                                    description: 'Estratégias de enfrentamento para ansiedade e estresse.',
                                    protocol: 'STANDARD'
                                })}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors whitespace-nowrap"
                            >
                                + Ansiedade
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Nome do Grupo</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                                placeholder="Ex: Grupo de Tabagismo"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>


                    {/* Protocol */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Protocolo Clínico</label>
                        <select
                            value={formData.protocol}
                            onChange={e => setFormData({ ...formData, protocol: e.target.value as GroupProtocol })}
                            className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none bg-white"
                        >
                            {Object.values(PROTOCOLS).map(protocol => (
                                <option key={protocol.id} value={protocol.id}>
                                    {protocol.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Descrição</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none h-24"
                                placeholder="Objetivos e público-alvo..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Schedule */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Horário</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                                    placeholder="Ex: Segundas, 14h"
                                    value={formData.schedule}
                                    onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Room */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Local/Sala</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                                    placeholder="Ex: Sala 04"
                                    value={formData.room}
                                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#0054A6] text-white font-bold rounded-lg hover:bg-[#004080] transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                        >
                            <Save size={18} />
                            Salvar Grupo
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
