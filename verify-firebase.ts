import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Função para ler .env manualmente
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars: Record<string, string> = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        return envVars;
    } catch (e) {
        console.error("Erro ao ler .env:", e);
        return {};
    }
}

const env = loadEnv();

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

console.log("Configuração Firebase carregada (parcial):", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyConnection() {
    console.log("Verificando conexão com Firebase...");
    try {
        const q = query(collection(db, 'users'), limit(1));
        await getDocs(q);
        console.log("✅ Conexão com Firebase estabelecida com sucesso!");
        process.exit(0);
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err.code === 'permission-denied') {
            console.log("✅ Conexão com Firebase estabelecida! (Acesso negado pelas regras de segurança, o que é esperado sem login).");
            process.exit(0);
        }
        console.error("❌ Falha na conexão com Firebase:", error);
        process.exit(1);
    }
}

verifyConnection();
