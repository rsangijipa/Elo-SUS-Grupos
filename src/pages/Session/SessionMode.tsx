import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, Save, ArrowLeft, FileText, Coffee, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SessionMode: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { db } = useAuth();

    // Mock session data loading based on ID (in real app, fetch from DB)
    const sessionGroup = db.groups.find(g => g.id === id) || db.groups[0]; // Fallback for demo
    const sessionPatients = db.patients.filter(p => p.groupId === sessionGroup?.id);

    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'justified'>>({});
    const [evolution, setEvolution] = useState('');
    const [checklist, setChecklist] = useState({
        psychoeducation: false,
        materials: false,
        snack: false
    });

    const handleAttendance = (patientId: string, status: 'present' | 'absent' | 'justified') => {
        setAttendance(prev => ({ ...prev, [patientId]: status }));
    };

    const handleSaveSession = async () => {
        // In a real app, this would save to the database
        console.log('Saving Session:', {
            groupId: sessionGroup?.id,
            date: new Date(),
            attendance,
            evolution,
            checklist
        });

        // Simulate saving
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Sessão finalizada com sucesso!');
        navigate('/dashboard');
    };

    if (!sessionGroup) {
        return <div className="p-8 text-center">Grupo não encontrado.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{sessionGroup.name} - Encontro #4</h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <Clock size={16} /> {sessionGroup.schedule} • <Users size={16} /> {sessionPatients.length} Pacientes
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Attendance & Checklist */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Attendance Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle size={20} className="text-blue-600" />
                                Chamada Digital
                            </h3>
                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {Object.values(attendance).filter(s => s === 'present').length} Presentes
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {sessionPatients.map(patient => (
                                <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                            {patient.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{patient.name}</p>
                                            <p className="text-xs text-slate-500">CNS: {patient.cns}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAttendance(patient.id, 'present')}
                                            className={`p-2 rounded-lg transition-all ${attendance[patient.id] === 'present' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                                            title="Presente"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(patient.id, 'absent')}
                                            className={`p-2 rounded-lg transition-all ${attendance[patient.id] === 'absent' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                                            title="Falta"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(patient.id, 'justified')}
                                            className={`p-2 rounded-lg transition-all ${attendance[patient.id] === 'justified' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' : 'bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-600'}`}
                                            title="Justificativa"
                                        >
                                            <AlertTriangle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {sessionPatients.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    Nenhum paciente vinculado a este grupo.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Checklist Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-purple-600" />
                            Checklist de Atividades
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.psychoeducation}
                                    onChange={e => setChecklist({ ...checklist, psychoeducation: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700">Psicoeducação Realizada</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.materials}
                                    onChange={e => setChecklist({ ...checklist, materials: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700">Material Entregue</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.snack}
                                    onChange={e => setChecklist({ ...checklist, snack: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700">Lanche Ofertado</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Evolution */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-orange-600" />
                            Evolução do Grupo
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">
                            Esta evolução será replicada para todos os pacientes presentes. Você poderá editar individualmente depois.
                        </p>
                        <textarea
                            value={evolution}
                            onChange={e => setEvolution(e.target.value)}
                            placeholder="Descreva como foi o encontro, temas abordados, participação do grupo..."
                            className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-700"
                        />

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <button
                                onClick={handleSaveSession}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg"
                            >
                                <Save size={20} />
                                Finalizar Sessão
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionMode;
