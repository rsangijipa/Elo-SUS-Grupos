import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface AvatarSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar: string | null;
    onSelect: (avatar: string) => void;
}

const PRESET_AVATARS = Array.from({ length: 8 }, (_, i) => `avatar_perfil${i + 1}`);

const getAvatarSrc = (avatar: string | null) => {
    if (!avatar) return PRESET_AVATARS[0]; // Fallback to first avatar
    if (avatar.startsWith('avatar_perfil')) return `/${avatar}.png`;
    // If it's a data URL (upload) or external URL, return as is
    return avatar;
};

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ isOpen, onClose, currentAvatar, onSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSelect(reader.result as string);
                onClose();
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Escolha seu Avatar</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Avatar */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-purple-100 overflow-hidden shadow-sm">
                            <img src={getAvatarSrc(currentAvatar)} alt="Current" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Presets */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Sugestões</label>
                        <div className="grid grid-cols-4 gap-3">
                            {PRESET_AVATARS.map((avatar, index) => (
                                <button
                                    key={index}
                                    onClick={() => { onSelect(avatar); onClose(); }}
                                    className={`w-16 h-16 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${currentAvatar === avatar ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-100 hover:border-purple-300'}`}
                                >
                                    <img src={`/${avatar}.png`} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Ou envie uma foto</label>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
                        >
                            <Upload size={20} />
                            Carregar do dispositivo
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelector;
