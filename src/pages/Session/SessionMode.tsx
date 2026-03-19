import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    Save,
    Users,
    XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProtocolRenderer from '../../components/ProtocolRenderer';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { sessionService, type SessionRecord } from '../../services/sessionService';
import { toJsDate } from '../../utils/dateUtils';

type AttendanceStatus = 'present' | 'absent' | 'justified';

const defaultChecklist = {
    psychoeducation: false,
    materials: false,
    snack: false
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

const SessionMode: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { groups, patients, isInitialized } = useData();

    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [evolution, setEvolution] = useState('');
    const [checklist, setChecklist] = useState(defaultChecklist);
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [activeSession, setActiveSession] = useState<SessionRecord | null>(null);
    const [selectedPatientForProtocol, setSelectedPatientForProtocol] = useState<string | null>(null);

    const hasHydratedRef = useRef(false);
    const autosaveTimeoutRef = useRef<number | null>(null);
    const todayKey = useMemo(() => getTodayKey(), []);

    const sessionGroup = useMemo(() => groups.find((group) => group.id === id) || null, [groups, id]);

    const sessionPatients = useMemo(() => {
        if (!sessionGroup) {
            return [];
        }

        const participantIds = new Set(sessionGroup.participants || []);

        return patients.filter((patient) => {
            if (!patient.id) {
                return false;
            }

            return participantIds.size > 0
                ? participantIds.has(patient.id)
                : patient.groupId === sessionGroup.id;
        });
    }, [patients, sessionGroup]);

    const hasSessionData = useMemo(() => {
        return Object.keys(attendance).length > 0 || evolution.trim().length > 0 || Object.values(checklist).some(Boolean);
    }, [attendance, checklist, evolution]);

    useEffect(() => {
        if (!isInitialized || !sessionGroup) {
            return;
        }

        let isCancelled = false;

        const loadSession = async () => {
            setIsLoadingSession(true);

            try {
                const existingSession = await sessionService.getByGroupAndDate(sessionGroup.id, todayKey);

                if (isCancelled) {
                    return;
                }

                if (existingSession) {
                    setActiveSession(existingSession);
                    setAttendance(existingSession.attendance || {});
                    setEvolution(existingSession.evolution || '');
                    setChecklist({ ...defaultChecklist, ...(existingSession.checklist || {}) });
                    setLastSaved(toJsDate(existingSession.updatedAt));
                } else {
                    setActiveSession(null);
                    setAttendance({});
                    setEvolution('');
                    setChecklist(defaultChecklist);
                    setLastSaved(null);
                }

                hasHydratedRef.current = true;
            } catch (error) {
                toast.error('Nao foi possivel carregar a sessao de hoje.');
            } finally {
                if (!isCancelled) {
                    setIsLoadingSession(false);
                }
            }
        };

        loadSession();

        return () => {
            isCancelled = true;
        };
    }, [isInitialized, sessionGroup, todayKey]);

    useEffect(() => {
        if (!hasHydratedRef.current || !sessionGroup || !user || !hasSessionData) {
            return;
        }

        if (autosaveTimeoutRef.current) {
            window.clearTimeout(autosaveTimeoutRef.current);
        }

        autosaveTimeoutRef.current = window.setTimeout(async () => {
            setIsAutosaving(true);

            try {
                const savedSession = await sessionService.upsert({
                    groupId: sessionGroup.id,
                    date: todayKey,
                    attendance,
                    evolution,
                    checklist,
                    facilitatorId: user.id
                });

                setActiveSession(savedSession);
                setLastSaved(toJsDate(savedSession.updatedAt));
            } catch (error) {
                toast.error('Falha ao salvar automaticamente a sessao.');
            } finally {
                setIsAutosaving(false);
            }
        }, 1200);

        return () => {
            if (autosaveTimeoutRef.current) {
                window.clearTimeout(autosaveTimeoutRef.current);
            }
        };
    }, [attendance, checklist, evolution, hasSessionData, sessionGroup, todayKey, user]);

    const handleAttendance = (patientId: string, status: AttendanceStatus) => {
        setAttendance((prev) => ({ ...prev, [patientId]: status }));
    };

    const handleSaveSession = async () => {
        if (!sessionGroup || !user) {
            return;
        }

        setIsSaving(true);

        try {
            const savedSession = await sessionService.upsert({
                groupId: sessionGroup.id,
                date: todayKey,
                attendance,
                evolution,
                checklist,
                facilitatorId: user.id
            });

            setActiveSession(savedSession);
            setLastSaved(toJsDate(savedSession.updatedAt));
            toast.success('Sessao salva com sucesso!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Erro ao salvar sessao.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveProtocolData = (_data: unknown) => {
        toast.success('Dados do protocolo salvos com sucesso!');
        setSelectedPatientForProtocol(null);
    };

    if (!isInitialized || isLoadingSession) {
        return (
            <div className="p-8 flex items-center justify-center text-slate-500 gap-3">
                <Loader2 size={20} className="animate-spin" /> Carregando sessao...
            </div>
        );
    }

    if (!sessionGroup) {
        return <div className="p-8 text-center">Grupo nao encontrado.</div>;
    }

    const getAttendanceButtonClass = (patientId: string, type: AttendanceStatus) => {
        const status = attendance[patientId];
        const baseClass = 'p-2 rounded-lg transition-all';

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

        return status === 'justified'
            ? `${baseClass} bg-orange-100 text-orange-700 ring-2 ring-orange-500`
            : `${baseClass} bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-600`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20 relative">
            {selectedPatientForProtocol && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-slate-800 text-lg">
                                Ficha Clinica - {patients.find((patient) => patient.id === selectedPatientForProtocol)?.name}
                            </h3>
                            <button
                                onClick={() => setSelectedPatientForProtocol(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                aria-label="Fechar ficha clinica"
                            >
                                <XCircle size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ProtocolRenderer
                                protocol={sessionGroup.protocol as never}
                                patientId={selectedPatientForProtocol}
                                patientName={patients.find(p => p.id === selectedPatientForProtocol)?.name || ''}
                                onSave={handleSaveProtocolData}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Voltar">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900">{sessionGroup.name} - Sessao de hoje</h1>
                        {(activeSession || hasSessionData) && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                Sessao em andamento
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 flex-wrap">
                        <Clock size={16} /> {sessionGroup.schedule} - <Users size={16} /> {sessionPatients.length} pacientes
                        {sessionGroup.protocol && sessionGroup.protocol !== 'STANDARD' && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                Protocolo: {sessionGroup.protocol}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle size={20} className="text-blue-600" />
                                Chamada Digital
                            </h3>
                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {Object.values(attendance).filter((status) => status === 'present').length} presentes
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {sessionPatients.map((patient) => (
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
                                        {sessionGroup.protocol && sessionGroup.protocol !== 'STANDARD' && (
                                            <button
                                                onClick={() => setSelectedPatientForProtocol(patient.id || '')}
                                                className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all mr-2"
                                                title="Abrir ficha clinica"
                                                aria-label={`Abrir ficha clinica de ${patient.name}`}
                                            >
                                                <FileText size={20} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleAttendance(patient.id || '', 'present')}
                                            className={getAttendanceButtonClass(patient.id || '', 'present')}
                                            title="Presente"
                                            aria-label={`Marcar ${patient.name} como presente`}
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(patient.id || '', 'absent')}
                                            className={getAttendanceButtonClass(patient.id || '', 'absent')}
                                            title="Falta"
                                            aria-label={`Marcar ${patient.name} como falta`}
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAttendance(patient.id || '', 'justified')}
                                            className={getAttendanceButtonClass(patient.id || '', 'justified')}
                                            title="Justificada"
                                            aria-label={`Marcar ${patient.name} como falta justificada`}
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

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-purple-600" />
                            Checklist de atividades
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.psychoeducation}
                                    onChange={(event) => setChecklist({ ...checklist, psychoeducation: event.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700">Psicoeducacao realizada</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.materials}
                                    onChange={(event) => setChecklist({ ...checklist, materials: event.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700">Material entregue</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={checklist.snack}
                                    onChange={(event) => setChecklist({ ...checklist, snack: event.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700">Lanche ofertado</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
                        <div className="flex justify-between items-center mb-4 gap-3">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={20} className="text-orange-600" />
                                Evolucao do grupo
                            </h3>
                            {isAutosaving ? (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Salvando...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-xs text-green-600">
                                    Salvo as {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            Esta evolucao sera replicada para todos os pacientes presentes. Depois voce podera complementar o registro individual.
                        </p>
                        <textarea
                            value={evolution}
                            onChange={(event) => setEvolution(event.target.value)}
                            placeholder="Descreva como foi o encontro, temas abordados e participacao do grupo..."
                            className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-700"
                        />

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <button
                                onClick={handleSaveSession}
                                disabled={isSaving}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg bg-[#0054A6] text-white rounded-xl hover:bg-[#004080] transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isSaving ? 'Salvando sessao...' : 'Finalizar sessao'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionMode;
