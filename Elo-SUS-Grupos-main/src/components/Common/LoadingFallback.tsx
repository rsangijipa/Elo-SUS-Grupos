import React from 'react';

const LoadingFallback: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">Carregando...</p>
            </div>
        </div>
    );
};

export default LoadingFallback;
