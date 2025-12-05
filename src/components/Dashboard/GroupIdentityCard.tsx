import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface GroupIdentityCardProps {
    patientName: string;
    groupName: string;
    startDate: string;
    attendanceCount: number;
    totalSessions?: number;
}

const GroupIdentityCard: React.FC<GroupIdentityCardProps> = ({
    patientName,
    groupName,
    startDate,
    attendanceCount,
    totalSessions = 10
}) => {
    return (
        <div className="relative w-full max-w-md h-56 rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300 mx-auto">
            {/* Background Gradient & Noise */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7A5CFF] via-[#6c4df0] to-[#4E8FFF] opacity-90"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Glass Effect Overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px]"></div>

            {/* Shine Effect */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

            {/* Conteúdo */}
            <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                            {/* Ícone EloSUS SVG */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-semibold tracking-wide text-white/90 text-sm">EloSUS Grupos</span>
                    </div>
                    {/* Chip Simulado */}
                    <div className="w-10 h-7 rounded-md border border-yellow-200/40 bg-gradient-to-tr from-yellow-100/20 to-yellow-500/20 backdrop-blur-sm shadow-inner flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 border-r border-yellow-200/30 w-1/3 left-0"></div>
                        <div className="absolute inset-0 border-l border-yellow-200/30 w-1/3 right-0"></div>
                        <div className="absolute top-1/2 left-0 right-0 border-t border-yellow-200/30"></div>
                    </div>
                </div>

                {/* Info Principal */}
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm truncate">{groupName || "Grupo Terapêutico"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-indigo-100 font-medium uppercase tracking-wider">Membro desde {startDate || "Jun/2025"}</p>
                        <span className="bg-green-400/20 text-green-100 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-400/30">ATIVO</span>
                    </div>
                    <p className="text-lg font-medium text-white mt-1 shadow-black/10 drop-shadow-md">{patientName}</p>
                </div>

                {/* Footer: Stamps & QR */}
                <div className="flex justify-between items-end">
                    {/* Stamps de Presença */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">Frequência</span>
                        <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                            {[...Array(totalSessions)].map((_, i) => (
                                <div key={i} className={`w-5 h-5 rounded-full border border-white/30 flex items-center justify-center transition-all ${i < attendanceCount ? 'bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-110' : 'bg-white/5'}`}>
                                    {i < attendanceCount && <div className="w-1.5 h-1.5 rounded-full bg-[#6C4FFE]"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QR Code Area */}
                    <div className="bg-white p-1.5 rounded-lg shadow-lg">
                        <QRCodeSVG value={`elosus-member:${patientName}-${groupName}`} size={42} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupIdentityCard;
