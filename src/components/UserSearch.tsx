import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User as UserIcon } from 'lucide-react';
import { patientService } from '../services/patientService';
import type { Patient } from '../types/patient';

interface UserSearchProps {
    onSelect: (patient: Patient) => void;
    placeholder?: string;
    excludeIds?: string[];
}

export default function UserSearch({ onSelect, placeholder = "Buscar por nome ou e-mail...", excludeIds = [] }: UserSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setLoading(true);
                try {
                    const patients = await patientService.searchPatients(searchTerm);
                    // Filter out excluded IDs
                    const filtered = patients.filter(p => !excludeIds.includes(p.id!));
                    setResults(filtered);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 400); // 400ms delay

        return () => clearTimeout(timer);
    }, [searchTerm, excludeIds]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (patient: Patient) => {
        onSelect(patient);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                    {loading ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-64 overflow-y-auto animate-fade-in">
                    {results.map((patient) => (
                        <button
                            key={patient.id}
                            onClick={() => handleSelect(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {patient.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{patient.name}</p>
                                <p className="text-xs text-slate-500 truncate">{patient.email || 'Sem e-mail'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && results.length === 0 && searchTerm.length >= 2 && !loading && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-4 text-center">
                    <p className="text-sm text-slate-500">Nenhum usuário encontrado.</p>
                </div>
            )}
        </div>
    );
}
