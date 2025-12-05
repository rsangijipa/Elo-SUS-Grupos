import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GroupIdentityCard from './GroupIdentityCard';

interface UserCardProps {
    isOpen: boolean;
    onClose: () => void;
    groupData?: {
        name: string;
        startDate: string;
        attendanceCount: number;
    };
}

const UserCard: React.FC<UserCardProps> = ({ isOpen, onClose, groupData }) => {
    const { user } = useAuth();

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="relative transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <GroupIdentityCard
                    patientName={user.name}
                    groupName={groupData?.name || 'EloSUS Digital'}
                    startDate={groupData?.startDate || new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    attendanceCount={groupData?.attendanceCount || 0}
                    user={user}
                />

                <button
                    onClick={onClose}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default UserCard;


