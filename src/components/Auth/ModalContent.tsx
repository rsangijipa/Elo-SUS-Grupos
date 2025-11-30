import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalContentProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const ModalContent: React.FC<ModalContentProps> = ({ title, onClose, children }) => {
    const { theme } = useTheme();

    return (
        <div className="absolute inset-0 z-50 bg-white rounded-3xl flex flex-col overflow-hidden animate-fade-in shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === 'patient' ? 'text-purple-700' : 'text-blue-700'}`}>
                    {title}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};

export default ModalContent;
