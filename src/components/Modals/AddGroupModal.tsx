import React from 'react';
import { X, Users, Clock, MapPin, FileText, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useZodForm } from '../../hooks/useZodForm';
import { GroupSchema, type GroupFormValues } from '../../schemas';
import { PROTOCOLS } from '../../config/protocols';
import { GroupProtocol } from '../../types/group';
import toast from 'react-hot-toast';

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddGroupModal({ isOpen, onClose }: AddGroupModalProps) {
    const { addGroup } = useData();
    const { user } = useAuth();
    const { values: formData, errors, validate, setValues, setFieldValue, handleChange } = useZodForm<GroupFormValues>(GroupSchema, {
        name: '',
        description: '',
        schedule: '',
        room: '',
        protocol: 'STANDARD' as GroupProtocol,
        maxParticipants: 10
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = validate();
        if (!result.success) {
            toast.error('Revise os campos do grupo antes de salvar.');
            return;
        }

        await addGroup({
            name: result.data.name,
            description: result.data.description,
            schedule: result.data.schedule,
            room: result.data.room,
            status: 'active',
            facilitatorId: user?.id || 'unknown',
            protocol: result.data.protocol,
            maxParticipants: result.data.maxParticipants
        });
        onClose();
        setValues({ name: '', description: '', schedule: '', room: '', protocol: 'STANDARD', maxParticipants: 10 });
    };

    return (
        <div className="fixed inset-0 flex items-start justify-center z-50 animate-fade-in p-4 pt-20">
            <div role="dialog" aria-modal="true" aria-labelledby="add-group-modal-title" className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-[#0054A6] p-6 flex justify-between items-center text-white">
                    <h2 id="add-group-modal-title" className="text-xl font-bold flex items-center gap-2">
                        <Users size={24} />
                        Novo Grupo
                    </h2>
                    <button onClick={onClose} aria-label="Fechar modal" className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
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
                                onClick={() => setValues({
                                    name: 'Grupo de Tabagismo',
                                    description: 'Grupo focado na cessacao do tabagismo com abordagem cognitivo-comportamental.',
                                    schedule: formData.schedule,
                                    room: formData.room,
                                    protocol: 'TABAGISMO',
                                    maxParticipants: formData.maxParticipants
                                })}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                                + Tabagismo
                            </button>
                            <button
                                type="button"
                                onClick={() => setValues({
                                    name: 'Grupo de Gestantes',
                                    description: 'Acompanhamento pre-natal e orientacoes para gestantes.',
                                    schedule: formData.schedule,
                                    room: formData.room,
                                    protocol: 'STANDARD',
                                    maxParticipants: formData.maxParticipants
                                })}
                                className="px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-bold rounded-lg border border-pink-100 hover:bg-pink-100 transition-colors whitespace-nowrap"
                            >
                                + Gestantes
                            </button>
                            <button
                                type="button"
                                onClick={() => setValues({
                                    name: 'Grupo de Ansiedade',
                                    description: 'Estrategias de enfrentamento para ansiedade e estresse.',
                                    schedule: formData.schedule,
                                    room: formData.room,
                                    protocol: 'STANDARD',
                                    maxParticipants: formData.maxParticipants
                                })}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors whitespace-nowrap"
                            >
                                + Ansiedade
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <label htmlFor="group-name" className="text-sm font-bold text-slate-700">Nome do Grupo</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                id="group-name"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                                placeholder="Ex: Grupo de Tabagismo"
                                value={formData.name}
                                name="name"
                                onChange={handleChange}
                            />
                        </div>
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>


                    {/* Protocol */}
                    <div className="space-y-1">
                        <label htmlFor="group-protocol" className="text-sm font-bold text-slate-700">Protocolo Clínico</label>
                        <select
                            id="group-protocol"
                            value={formData.protocol}
                            name="protocol"
                            onChange={handleChange}
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
                        <label htmlFor="group-description" className="text-sm font-bold text-slate-700">Descrição</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea
                                required
                                id="group-description"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none h-24"
                            placeholder="Objetivos e público-alvo..."
                            value={formData.description}
                            name="description"
                            onChange={handleChange}
                            />
                        </div>
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Schedule */}
                        <div className="space-y-1">
                            <label htmlFor="group-schedule" className="text-sm font-bold text-slate-700">Horário</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    id="group-schedule"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                                    placeholder="Ex: Segundas, 14h"
                                    value={formData.schedule}
                                    name="schedule"
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.schedule && <p className="text-xs text-red-500">{errors.schedule}</p>}
                        </div>

                        {/* Room */}
                        <div className="space-y-1">
                            <label htmlFor="group-room" className="text-sm font-bold text-slate-700">Local/Sala</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    id="group-room"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                                    placeholder="Ex: Sala 04"
                                    value={formData.room}
                                    name="room"
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.room && <p className="text-xs text-red-500">{errors.room}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="group-max" className="text-sm font-bold text-slate-700">Maximo de Participantes</label>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            id="group-max"
                            name="maxParticipants"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                            value={formData.maxParticipants}
                            onChange={(e) => setFieldValue('maxParticipants', Number(e.target.value))}
                        />
                        {errors.maxParticipants && <p className="text-xs text-red-500">{errors.maxParticipants}</p>}
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
