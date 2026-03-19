import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { auth, db } from './firebase';

const DEMO_USERS = [
    {
        email: 'admin@elosus.gov.br',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador Demo',
        unidadeSaudeId: 'all'
    },
    {
        email: 'prof@elosus.gov.br',
        password: 'prof123',
        role: 'professional',
        name: 'Profissional Demo',
        unidadeSaudeId: 'ubs-centro',
        crp: '12/34567',
        specialty: 'Psicologia Clinica',
        approach: 'TCC'
    },
    {
        email: 'paciente@elosus.gov.br',
        password: 'paciente123',
        role: 'patient',
        name: 'Paciente Demo',
        unidadeSaudeId: 'ubs-centro',
        cns: '700000000000001'
    }
];

/**
 * Seeds the development environment with demo users.
 * Optimized to avoid rapid re-authentication which crashes Firestore listeners.
 */
export async function setupDevEnvironment() {
    // Only run if specifically in DEV mode and not already seeded this session
    if (!import.meta.env.DEV) return;
    
    const wasSeeded = sessionStorage.getItem('elosus_seeded');
    if (wasSeeded) return;

    try {
        console.log('[DevSeed] Checking core demo accounts...');
        
        for (const user of DEMO_USERS) {
            try {
                // We only try to create. If it fails (exists), we skip.
                const res = await createUserWithEmailAndPassword(auth, user.email, user.password);
                
                // If creation succeeded, we definitely need the doc.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...firestoreData } = user;
                await setDoc(doc(db, COLLECTIONS.USERS, res.user.uid), {
                    uid: res.user.uid,
                    ...firestoreData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                console.log(`[DevSeed] Created ${user.email}`);
                
                // Sign out immediately to clear for the next one
                await auth.signOut();
            } catch (err: any) {
                if (err?.code === 'auth/email-already-in-use') {
                    // Skip
                } else if (err instanceof Error) {
                    console.warn(`[DevSeed] Could not ensure ${user.email}:`, err.message);
                }
            }
        }
        
        sessionStorage.setItem('elosus_seeded', 'true');
        console.log('[DevSeed] Done.');
    } catch (error) {
        console.error('[DevSeed] Fatal error:', error);
    }
}
