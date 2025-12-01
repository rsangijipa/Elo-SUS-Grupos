import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import ReferralModal from '../../components/Modals/ReferralModal';
import { patientService } from '../../services/patientService';
import { getAge, formatDate } from '../../utils/dateUtils';

const PatientList: React.FC = () => {
    const { deletePatient: deletePatientContext } = useData();
    const [localPatients, setLocalPatients] = useState<any[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Initial load
    useEffect(() => {
        loadPatients();
    }, []);

    // Search effect with debounce could be better, but for now simple effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            } else {
                // Reset to paginated view if search is cleared
                loadPatients(true);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadPatients = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const currentLastDoc = reset ? null : lastDoc;
            const result = await patientService.getPatientsPaginated(currentLastDoc);

            if (reset) {
                setLocalPatients(result.patients);
            } else {
                setLocalPatients(prev => [...prev, ...result.patients]);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.patients.length === 20); // Assuming limit is 20
        } catch (error) {
            console.error("Error loading patients:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = async (term: string) => {
        setLoading(true);
        try {
            const results = await patientService.searchPatients(term);
            setLocalPatients(results);
            setHasMore(false); // Disable load more during search
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (patient: any) => {
        if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                await deletePatientContext(patient.id);
                setLocalPatients(prev => prev.filter(p => p.id !== patient.id));
            } catch (error) {
                console.error("Error deleting patient:", error);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Pacientes</h2>
                    <p className="text-slate-500 mt-1">
                        Lista de pacientes cadastrados na unidade.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/patients/new')}
                        className="flex items-center gap-2 bg-white text-[#0054A6] border border-[#0054A6] px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-all shadow-sm font-medium"
                    >
                        <Plus size={20} />
                        Novo Paciente
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#0054A6] text-white px-5 py-2.5 rounded-lg hover:bg-[#004080] transition-all shadow-sm hover:shadow-md font-medium"
                    >
                        <Building2 size={20} />
                        Encaminhar Paciente
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nascimento</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading && localPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0054A6] rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : localPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum paciente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                localPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-[#0054A6] font-bold text-sm border border-blue-100">
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#0054A6] transition-colors">{patient.name}</div>
                                                    <div className="text-xs text-slate-500">CNS: {patient.cns || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-700 font-medium">{formatDate(patient.birthDate)}</div>
                                            <div className="text-xs text-slate-400">
                                                {getAge(patient.birthDate)} anos
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-700">{patient.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${patient.status === 'active' ? 'bg-green-100 text-green-700' :
                                                patient.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                {patient.status === 'active' ? 'Ativo' :
                                                    patient.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/patients/edit/${patient.id}`)}
                                                    className="p-2 text-slate-400 hover:text-[#0054A6] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(patient)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Load More Button */}
                {!searchTerm && hasMore && (
                    <div className="p-4 border-t border-slate-100 flex justify-center">
                        <button
                            onClick={() => loadPatients()}
                            disabled={loadingMore}
                            className="text-[#0054A6] font-medium hover:text-[#004080] disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {loadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    Carregando...
                                </>
                            ) : (
                                'Carregar Mais Pacientes'
                            )}
                        </button>
                    </div>
                )}
            </div>

            <ReferralModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PatientList;
