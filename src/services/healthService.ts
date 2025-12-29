import { db, auth } from './firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    enableNetwork,
    disableNetwork
} from 'firebase/firestore';
import { getIdToken } from 'firebase/auth';

export interface HealthLog {
    timestamp: string;
    message: string;
    status: 'ok' | 'error' | 'warning' | 'info';
    details?: Record<string, unknown>;
}

export const healthService = {
    /**
     * 1. Ping de Latência (RTT)
     * Escreve um documento e mede o tempo de resposta.
     */
    async checkLatency(): Promise<{ rtt: number; status: 'excellent' | 'acceptable' | 'slow' }> {
        const start = Date.now();
        try {
            const ref = await addDoc(collection(db, '_health_check'), {
                timestamp: start,
                type: 'ping'
            });
            await deleteDoc(ref); // Limpa logo em seguida

            const end = Date.now();
            const rtt = end - start;

            let status: 'excellent' | 'acceptable' | 'slow' = 'slow';
            if (rtt < 200) status = 'excellent';
            else if (rtt < 800) status = 'acceptable';

            return { rtt, status };
        } catch (error) {
            throw error;
        }
    },

    /**
     * 2. Verificação de Auth
     * Força refresh do token para garantir que a sessão é válida.
     */
    async checkAuthStatus(): Promise<{ isValid: boolean; uid?: string }> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado.');
        }

        try {
            await getIdToken(user, true); // Força refresh
            return { isValid: true, uid: user.uid };
        } catch (error) {
            throw error;
        }
    },

    /**
     * 3. Teste de Socket (Sync)
     * Verifica se o listener onSnapshot está recebendo atualizações.
     */
    async checkSocketSync(onLog: (log: HealthLog) => void): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const testDocRef = doc(db, '_health_check', 'socket_test');
            let receivedUpdate = false;

            // Configura o listener
            const unsubscribe = onSnapshot(testDocRef, (snapshot) => {
                if (snapshot.metadata.hasPendingWrites) {
                    // Ignora a atualização local (latência zero), queremos a do servidor
                    return;
                }
                receivedUpdate = true;
            }, (error) => {
                reject(error);
            });

            try {
                // Força uma escrita para disparar o listener
                await setDoc(testDocRef, {
                    updatedAt: Date.now(),
                    test: 'socket_sync'
                });

                // Aguarda até 5s pela confirmação do socket
                setTimeout(() => {
                    unsubscribe();
                    if (receivedUpdate) {
                        resolve(true);
                    } else {
                        reject(new Error('Timeout: Socket não recebeu atualização do servidor (Firewall/Proxy?).'));
                    }
                }, 5000);

            } catch (error) {
                unsubscribe();
                reject(error);
            }
        });
    },

    /**
     * Botão de Pânico: Forçar Reconexão
     */
    async forceReconnect() {
        await disableNetwork(db);
        await new Promise(r => setTimeout(r, 1000)); // Espera 1s
        await enableNetwork(db);
    }
};
