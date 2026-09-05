import React, { useState, useEffect, useRef } from 'react';
import { healthService, HealthLog } from '../../services/healthService';

const SystemHealth: React.FC = () => {
    const [logs, setLogs] = useState<HealthLog[]>([]);
    const [status, setStatus] = useState({
        auth: 'pending',
        read: 'pending',
        write: 'pending',
        socket: 'pending'
    });
    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, status: HealthLog['status'] = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, status }]);
    };

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const parseError = (error: any): string => {
        const code = error?.code || 'unknown';
        switch (code) {
            case 'permission-denied':
                return "Alerta: Suas Regras de Segurança (Firestore Rules) estão bloqueando esta ação. Verifique o console do Firebase.";
            case 'unavailable':
                return "Alerta: O cliente está offline ou não consegue alcançar os servidores do Google (Verifique sua internet/DNS).";
            case 'failed-precondition':
                return "Alerta: Falta um índice composto. Verifique o link no console do navegador.";
            default:
                return `Erro desconhecido: ${error?.message || JSON.stringify(error)}`;
        }
    };

    const runDiagnostics = async () => {
        setLogs([]);
        setStatus({ auth: 'pending', read: 'pending', write: 'pending', socket: 'pending' });
        addLog("Iniciando Protocolo de Diagnóstico...", 'info');

        // 1. Auth Check
        try {
            addLog("Verificando Autenticação...", 'info');
            await healthService.checkAuthStatus();
            addLog("Autenticação: OK (Token Válido)", 'ok');
            setStatus(prev => ({ ...prev, auth: 'ok' }));
        } catch (error: any) {
            addLog(`Falha na Autenticação: ${error.message}`, 'error');
            setStatus(prev => ({ ...prev, auth: 'error' }));
        }

        // 2. Latency / Write Check
        try {
            addLog("Testando Latência de Escrita (Ping)...", 'info');
            const { rtt, status: latStatus } = await healthService.checkLatency();
            addLog(`Latência: ${rtt}ms (${latStatus.toUpperCase()})`, latStatus === 'excellent' ? 'ok' : 'warning');
            setStatus(prev => ({ ...prev, write: 'ok' }));
        } catch (error: any) {
            addLog(`Falha na Escrita: ${parseError(error)}`, 'error');
            setStatus(prev => ({ ...prev, write: 'error' }));
        }

        // 3. Socket Sync Check
        try {
            addLog("Testando Sincronização de Socket (Real-time)...", 'info');
            await healthService.checkSocketSync((log: HealthLog) => addLog(log.message, log.status));
            addLog("Socket Sync: OK (Recebido do Servidor)", 'ok');
            setStatus(prev => ({ ...prev, socket: 'ok', read: 'ok' })); // Assume read is ok if socket works
        } catch (error: any) {
            addLog(`Falha no Socket: ${parseError(error)}`, 'error');
            setStatus(prev => ({ ...prev, socket: 'error', read: 'error' }));
        }

        addLog("Diagnóstico Finalizado.", 'info');
    };

    const handleForceReconnect = async () => {
        addLog("Iniciando Reconexão Forçada...", 'warning');
        try {
            await healthService.forceReconnect();
            addLog("Rede Reiniciada. Aguardando estabilização...", 'ok');
            setTimeout(runDiagnostics, 2000);
        } catch (error: any) {
            addLog(`Erro ao reconectar: ${error.message}`, 'error');
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-green-400 font-mono p-6 overflow-hidden flex flex-col">
            <header className="mb-6 flex justify-between items-center border-b border-green-800 pb-4">
                <h1 className="text-2xl font-bold tracking-wider glitch-effect">
                    &gt; SISTEMA_DIAGNÓSTICO_V1.0
                </h1>
                <button
                    onClick={handleForceReconnect}
                    className="bg-red-900 hover:bg-red-700 text-white px-4 py-2 rounded border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all"
                >
                    ⚠ FORÇAR RECONEXÃO
                </button>
            </header>

            {/* Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(status).map(([key, val]) => (
                    <div key={key} className={`p-4 border ${val === 'ok' ? 'border-green-500 bg-green-900/20' : val === 'error' ? 'border-red-500 bg-red-900/20' : 'border-yellow-500 bg-yellow-900/20'} rounded`}>
                        <div className="text-xs uppercase opacity-70 mb-1">{key}</div>
                        <div className={`text-xl font-bold ${val === 'ok' ? 'text-green-400' : val === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {val.toUpperCase()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Console Log */}
            <div className="flex-1 bg-black border border-green-700 rounded p-4 overflow-y-auto shadow-inner font-mono text-sm relative">
                <div className="absolute top-2 right-2 text-xs text-green-800 animate-pulse">LIVE_CONNECTION</div>
                {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                        <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                        <span className={
                            log.status === 'error' ? 'text-red-500 font-bold' :
                                log.status === 'warning' ? 'text-yellow-500' :
                                    log.status === 'ok' ? 'text-green-400' :
                                        'text-gray-300'
                        }>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>

            <div className="mt-4 text-xs text-center text-gray-600">
                DIAGNOSTIC_TOOL_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} // SECURE_CHANNEL
            </div>
        </div>
    );
};

export default SystemHealth;
