import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';

const Schedule: React.FC = () => {
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8h to 17h

    // Mock Events
    const events = [
        { id: 1, title: 'Grupo Tabagismo', day: 'Seg', hour: 9, duration: 2, type: 'group' },
        { id: 2, title: 'Atendimento Individual', day: 'Ter', hour: 14, duration: 1, type: 'individual' },
        { id: 3, title: 'Reunião Equipe', day: 'Qui', hour: 10, duration: 1, type: 'meeting' },
    ];

    const getEventStyle = (type: string) => {
        switch (type) {
            case 'group': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'individual': return 'bg-green-100 text-green-700 border-green-200';
            case 'meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Agenda Semanal</h2>
                    <p className="text-slate-500 mt-1">Gerencie seus atendimentos e grupos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                        <RefreshCw size={18} />
                        Sincronizar Google Agenda
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm">
                        <Plus size={18} />
                        Novo Agendamento
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-4">
                        <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                            <ChevronLeft size={20} className="text-slate-500" />
                        </button>
                        <span className="font-bold text-slate-700">Novembro 2025</span>
                        <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                            <ChevronRight size={20} className="text-slate-500" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Grupo
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Individual
                        </span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-6 border-b border-slate-200">
                            <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase border-r border-slate-100">
                                Horário
                            </div>
                            {weekDays.map(day => (
                                <div key={day} className="p-4 text-center text-sm font-bold text-slate-700 border-r border-slate-100 last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Time Rows */}
                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-6 border-b border-slate-100 last:border-b-0 h-20">
                                <div className="p-2 text-center text-xs font-medium text-slate-400 border-r border-slate-100 flex items-center justify-center">
                                    {hour}:00
                                </div>
                                {weekDays.map(day => {
                                    const event = events.find(e => e.day === day && e.hour === hour);
                                    return (
                                        <div key={`${day}-${hour}`} className="relative border-r border-slate-100 last:border-r-0 p-1">
                                            {event && (
                                                <div
                                                    className={`absolute top-1 left-1 right-1 bottom-1 rounded-lg p-2 border text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity overflow-hidden ${getEventStyle(event.type)}`}
                                                    style={{ height: `calc(${event.duration * 100}% - 8px)`, zIndex: 10 }}
                                                >
                                                    <div className="truncate">{event.title}</div>
                                                    <div className="font-normal opacity-80">{event.hour}:00 - {event.hour + event.duration}:00</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
