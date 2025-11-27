import React from 'react';
import { X } from 'lucide-react';
import UserSearch from '../UserSearch';
import type { Patient } from '../../types/patient';

interface AddParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (patientId: string) => Promise<void>;
    currentParticipantIds: string[];
}

export default function AddParticipantModal({ isOpen, onClose, onAdd, currentParticipantIds }: AddParticipantModalProps) {
    if (!isOpen) return null;

    const handleSelectUser = async (user: any) => {
        // if (window.confirm(`Adicionar ${user.name} ao grupo?`)) {
        await onAdd(user.id);
        // }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h3 className="font-bold text-lg text-slate-800">Adicionar Participante</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <p className="text-sm text-slate-500">
                        Busque por pacientes para adicionar a este grupo.
                    </p>

                    <UserSearch
                        onSelect={handleSelectUser}
                        excludeIds={currentParticipantIds}
                        placeholder="Nome ou E-mail do paciente..."
                    />

                    <div className="pt-4 text-center">
                        <button
                            onClick={onClose}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
