import React, { useState } from 'react';
import { X, Calendar, Clock, User, Users, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AddAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: Date;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, initialDate }) => {
    const { addAppointment, groups, patients } = useData();
    const [formData, setFormData] = useState({
        groupId: '',
        patientId: '', // Optional, for individual sessions
        date: initialDate ? initialDate.toISOString().split('T')[0] : '',
        time: initialDate ? `${initialDate.getHours().toString().padStart(2, '0')}:${initialDate.getMinutes().toString().padStart(2, '0')}` : '',
        type: 'group' as 'group' | 'individual',
        topic: ''
    });

    React.useEffect(() => {
        if (initialDate) {
            setFormData(prev => ({
                ...prev,
                date: initialDate.toISOString().split('T')[0],
                time: `${initialDate.getHours().toString().padStart(2, '0')}:${initialDate.getMinutes().toString().padStart(2, '0')}`
            }));
        }
    }, [initialDate]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const [year, month, day] = formData.date.split('-').map(Number);
        const [hours, minutes] = formData.time.split(':').map(Number);
        const appointmentDate = new Date(year, month - 1, day, hours, minutes);

        addAppointment({
            groupId: formData.groupId,
            patientId: formData.patientId || undefined,
            date: appointmentDate,
            room: formData.type === 'group'
                ? groups.find(g => g.id === formData.groupId)?.room || 'Sala Virtual'
                : 'Consultório 1',
            status: 'scheduled',
            type: formData.type,
            topic: formData.topic
        });

        onClose();
        setFormData({
            groupId: '',
            patientId: '',
            date: '',
            time: '',
            type: 'group',
            topic: ''
        });
        alert('Agendamento criado com sucesso!');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-[#0054A6]" />
                        Novo Agendamento
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Tipo de Sessão</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="group"
                                    checked={formData.type === 'group'}
                                    onChange={() => setFormData({ ...formData, type: 'group' })}
                                    className="text-[#0054A6] focus:ring-[#0054A6]"
                                />
                                <span className="text-sm text-slate-700">Grupo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="individual"
                                    checked={formData.type === 'individual'}
                                    onChange={() => setFormData({ ...formData, type: 'individual' })}
                                    className="text-[#0054A6] focus:ring-[#0054A6]"
                                />
                                <span className="text-sm text-slate-700">Individual</span>
                            </label>
                        </div>
                    </div>

                    {formData.type === 'group' ? (
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Grupo</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    required
                                    value={formData.groupId}
                                    onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0054A6] outline-none transition-all bg-white appearance-none"
                                >
                                    <option value="">Selecione o grupo...</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Paciente</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    required
                                    value={formData.patientId}
                                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0054A6] outline-none transition-all bg-white appearance-none"
                                >
                                    <option value="">Selecione o paciente...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0054A6] outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Horário</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0054A6] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Tópico / Observação</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea
                                required
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0054A6] outline-none transition-all resize-none h-24"
                                placeholder="Ex: Dinâmica de grupo, Avaliação inicial..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[#0054A6] hover:bg-[#004080] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
                    >
                        Agendar Sessão
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAppointmentModal;
