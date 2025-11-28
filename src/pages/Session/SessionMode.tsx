import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, Save, ArrowLeft, FileText, BookOpen, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import ProtocolRenderer from '../../components/ProtocolRenderer';
import toast from 'react-hot-toast';

const SessionMode: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { groups, patients } = useData();

    // Mock session data loading based on ID
    const sessionGroup = groups.find(g => g.id === id) || groups[0];
    const sessionPatients = patients.filter(p => p.groupId === sessionGroup?.id);

    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'justified'>>({});
    const [evolution, setEvolution] = useState('');
    const [checklist, setChecklist] = useState({
        psychoeducation: false,
        materials: false,
        snack: false
    });
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [selectedPatientForProtocol, setSelectedPatientForProtocol] = useState<string | null>(null);

    // Autosave Effect
    useEffect(() => {
        if (!evolution) return;

        const timer = setTimeout(() => {
            setIsAutosaving(true);
            // Simulate API save
            setTimeout(() => {
                setIsAutosaving(false);
                setLastSaved(new Date());
            }, 800);
        }, 2000);

        return () => clearTimeout(timer);
    }, [evolution]);

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
        toast.success('Sessão finalizada com sucesso!');
        navigate('/dashboard');
    };

    const handleSaveProtocolData = (data: any) => {
        console.log('Protocol Data Saved:', data);
        toast.success('Dados do protocolo salvos com sucesso!');
        setSelectedPatientForProtocol(null);
    };

    if (!sessionGroup) {
        return <div className="p-8 text-center">Grupo não encontrado.</div>;
    }

    const getAttendanceButtonClass = (patientId: string, type: 'present' | 'absent' | 'justified') => {
        const status = attendance[patientId];
        const baseClass = "p-2 rounded-lg transition-all";

        if (type === 'present') {
            return status === 'present'
                ? `${baseClass} bg-green-100 text-green-700 ring-2 ring-green-500`
                : `${baseClass} bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600`;
        }
        if (type === 'absent') {
            return status === 'absent'
                ? `${baseClass} bg-red-100 text-red-700 ring-2 ring-red-500`
                : `${baseClass} bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600`;
        }
        if (type === 'justified') {
            return status === 'justified'
                ? `${baseClass} bg-orange-100 text-orange-700 ring-2 ring-orange-500`
                : `${baseClass} bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-600`;
        }
        return baseClass;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20 relative">
            {/* Protocol Modal */}
            {selectedPatientForProtocol && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-slate-800 text-lg">
                                Ficha Clínica - {patients.find(p => p.id === selectedPatientForProtocol)?.name}
                            </h3>
                            <button
                                onClick={() => setSelectedPatientForProtocol(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ProtocolRenderer
                                protocol={sessionGroup.protocol as any}
                                patientId={selectedPatientForProtocol}
                                onSave={handleSaveProtocolData}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{sessionGroup.name} - Encontro #4</h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <Clock size={16} /> {sessionGroup.schedule} • <Users size={16} /> {sessionPatients.length} Pacientes
                        {sessionGroup.protocol && sessionGroup.protocol !== 'STANDARD' && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                Protocolo: {sessionGroup.protocol}
                            </span>
                        )}
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
                                        {/* Protocol Button */}
                                        {sessionGroup.protocol && sessionGroup.protocol !== 'STANDARD' && (
                                            <button
                                                onClick={() => setSelectedPatientForProtocol(patient.id || '')}
                                                className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all mr-2"
                                                title="Abrir Ficha Clínica"
                                            >
                                                <FileText size={20} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleAttendance(patient.id || '', 'present')}
                                            className={getAttendanceButtonClass(patient.id || '', 'present')}
                                            title="Presente"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(patient.id || '', 'absent')}
                                            className={getAttendanceButtonClass(patient.id || '', 'absent')}
                                            title="Falta"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(patient.id || '', 'justified')}
                                            className={getAttendanceButtonClass(patient.id || '', 'justified')}
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={20} className="text-orange-600" />
                                Evolução do Grupo
                            </h3>
                            {isAutosaving ? (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Salvando...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-xs text-green-600">
                                    Salvo às {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : null}
                        </div>
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
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg bg-[#0054A6] text-white rounded-xl hover:bg-[#004080] transition-colors shadow-lg shadow-blue-900/20"
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
