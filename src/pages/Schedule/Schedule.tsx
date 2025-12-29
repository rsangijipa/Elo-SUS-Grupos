import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import AddAppointmentModal from '../../components/Modals/AddAppointmentModal';
import { toast } from 'react-hot-toast';

const Schedule: React.FC = () => {
    const { appointments, groups, loading, fetchAppointments, fetchGroups } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        fetchAppointments();
        fetchGroups();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const events = appointments.map(apt => {
        const group = groups.find(g => g.id === apt.groupId);
        const dateObj = new Date(apt.date);
        return {
            ...apt,
            title: group?.name || 'Sessão de Grupo',
            location: group?.room || 'Sala Virtual',
            time: `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
        };
    });

    const handleSlotClick = (hour: number) => {
        const today = new Date(); // In a real app, use the currently viewed date
        today.setHours(hour, 0, 0, 0);
        setSelectedDate(today);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Minha Agenda</h2>
                    <p className="text-slate-500 mt-1">Gerencie seus atendimentos e grupos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <CalendarIcon size={18} />
                        Sincronizar Agenda
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDate(undefined);
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 bg-[#0054A6] text-white px-4 py-2 rounded-lg hover:bg-[#004080] transition-colors"
                    >
                        <Plus size={18} />
                        Novo Agendamento
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Novembro 2025</h3>
                        <div className="flex gap-1">
                            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronLeft size={20} className="text-slate-500" />
                            </button>
                            <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronRight size={20} className="text-slate-500" />
                            </button>
                        </div>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1 text-sm font-bold text-slate-600 rounded-md hover:bg-white hover:shadow-sm transition-all">Dia</button>
                        <button className="px-3 py-1 text-sm font-bold text-blue-700 bg-white shadow-sm rounded-md transition-all">Semana</button>
                        <button className="px-3 py-1 text-sm font-bold text-slate-600 rounded-md hover:bg-white hover:shadow-sm transition-all">Mês</button>
                    </div>
                </div>

                <div className="grid grid-cols-8 border-b border-slate-100">
                    <div className="p-4 border-r border-slate-100 bg-slate-50"></div>
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => (
                        <div key={day} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                            <span className="block text-xs font-bold text-slate-500 uppercase">{day}</span>
                            <span className={`block text-lg font-bold mt-1 ${i === 0 ? 'text-blue-600 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-slate-800'}`}>
                                {20 + i}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="h-[600px] overflow-y-auto relative">
                    <div className="grid grid-cols-8 min-h-full">
                        <div className="border-r border-slate-100 bg-slate-50">
                            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                                <div key={hour} className="h-24 border-b border-slate-100 p-2 text-xs font-bold text-slate-400 text-right">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Mock Events Grid */}
                        <div className="col-span-7 relative">
                            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                                <div
                                    key={hour}
                                    className="h-24 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer relative group"
                                    onClick={() => handleSlotClick(hour)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                        <Plus className="text-slate-300" size={24} />
                                    </div>
                                </div>
                            ))}

                            {/* Event Card */}
                            {events.map((event, index) => (
                                <div key={index} className="absolute top-24 left-[14.28%] w-[14.28%] p-1 pointer-events-none">
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer h-20 pointer-events-auto" onClick={(e) => { e.stopPropagation(); toast(`Detalhes do agendamento: ${event.topic}`, { icon: '📅' }); }}>
                                        <p className="text-xs font-bold text-blue-700 truncate">{event.title}</p>
                                        <p className="text-[10px] text-blue-600 flex items-center gap-1 mt-1">
                                            <Clock size={10} /> {event.time}
                                        </p>
                                        <p className="text-[10px] text-blue-600 flex items-center gap-1">
                                            <MapPin size={10} /> {event.location}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AddAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialDate={selectedDate}
            />
        </div>
    );
};

export default Schedule;
