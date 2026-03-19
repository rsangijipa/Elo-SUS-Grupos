import React, { useCallback, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, UserX } from 'lucide-react';
import EmptyState from '../../components/Common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import ReferralModal from '../../components/Modals/ReferralModal';
import { patientService } from '../../services/patientService';
import { getAge, formatDate } from '../../utils/dateUtils';
import type { Patient } from '../../types/patient';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import StatusBadge from '../../components/Common/StatusBadge';

const PatientList: React.FC = () => {
    const { deletePatient: deletePatientContext } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const loadPatients = useCallback(() => patientService.getAll(), []);

    const {
        data: patients,
        loading,
        refetch
    } = useFirestoreQuery<Patient>(loadPatients);

    const filteredPatients = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) {
            return patients;
        }

        return patients.filter((patient) => {
            return patient.name.toLowerCase().includes(normalizedSearch)
                || patient.cns?.toLowerCase().includes(normalizedSearch)
                || patient.phone?.toLowerCase().includes(normalizedSearch);
        });
    }, [patients, searchTerm]);

    const handleDelete = async (patient: Patient) => {
        if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                if (!patient.id) {
                    return;
                }
                await deletePatientContext(patient.id);
                refetch();
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
                    <h2 className="text-2xl font-bold text-slate-900">Hub de Triagem</h2>
                    <p className="text-slate-500 mt-1">
                        Gerencie pacientes e encaminhamentos da unidade.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#0054A6] text-white px-5 py-2.5 rounded-lg hover:bg-[#004080] transition-all shadow-sm hover:shadow-md font-bold"
                    >
                        <Plus size={20} />
                        Novo Encaminhamento
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
                            {loading && filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0054A6] rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12">
                                        <EmptyState
                                            title="Nenhum paciente encontrado"
                                            description={searchTerm ? `Não encontramos ninguém com o nome "${searchTerm}".` : "Sua lista de pacientes está vazia."}
                                            icon={UserX}
                                            actionLabel={searchTerm ? "Limpar busca" : "Cadastrar novo paciente"}
                                            onAction={searchTerm ? () => setSearchTerm('') : () => setIsModalOpen(true)}
                                        />
                                    </td>
                                </tr>
                             ) : (
                                 filteredPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                    >
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
                                            <StatusBadge status={patient.status || 'inactive'} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => navigate(`/patients/edit/${patient.id}`)}
                                                    className="p-2 text-slate-400 hover:text-[#0054A6] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                    aria-label={`Editar ${patient.name}`}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(patient)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                    aria-label={`Excluir ${patient.name}`}
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

            </div>

            <ReferralModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PatientList;
