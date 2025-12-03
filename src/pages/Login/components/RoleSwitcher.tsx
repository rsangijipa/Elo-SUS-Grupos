import React from 'react';
import { User, Activity } from 'lucide-react';

interface RoleSwitcherProps {
    theme: string;
    onRoleChange: (role: 'patient' | 'professional') => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ theme, onRoleChange }) => {
    return (
        <div className="bg-slate-100 p-1.5 rounded-xl flex mb-8 border border-slate-200 relative">
            <button
                type="button"
                onClick={() => onRoleChange('patient')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 ${theme === 'patient'
                    ? 'bg-white text-brand-patient shadow-md ring-1 ring-black/5 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
            >
                <User size={18} className={theme === 'patient' ? 'stroke-[2.5px]' : ''} />
                Paciente
            </button>
            <button
                type="button"
                onClick={() => onRoleChange('professional')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 ${theme === 'professional'
                    ? 'bg-white text-brand-professional shadow-md ring-1 ring-black/5 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
            >
                <Activity size={18} className={theme === 'professional' ? 'stroke-[2.5px]' : ''} />
                Profissional
            </button>
        </div>
    );
};

export default RoleSwitcher;
