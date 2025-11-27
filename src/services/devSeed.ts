import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const DEMO_USERS = [
    {
        email: 'admin@elosus.gov.br',
        password: 'admin123', // Weak password for demo only
        role: 'admin',
        name: 'Administrador Demo',
        unidadeSaudeId: 'all'
    },
    {
        email: 'prof@elosus.gov.br',
        password: 'prof123',
        role: 'professional',
        name: 'Profissional Demo',
        unidadeSaudeId: 'ubs-centro'
    },
    {
        email: 'paciente@elosus.gov.br',
        password: 'paciente123',
        role: 'patient',
        name: 'Paciente Demo',
        unidadeSaudeId: 'ubs-centro'
    }
];

export async function setupDevEnvironment() {
    try {
        console.log('Checking dev environment setup...');

        for (const user of DEMO_USERS) {
            await ensureUser(user);
        }

        console.log('Dev environment setup complete. (Seeding disabled)');

    } catch (error) {
        console.error('Setup dev environment failed:', error);
    }
}

async function ensureUser(userData: any) {
    try {
        // Try to create the user directly
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        console.log(`User ${userData.email} created.`);

        // Create/Update Firestore doc
        await updateUserDoc(userCredential.user.uid, userData);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log(`User ${userData.email} already exists. Updating Firestore data...`);
            try {
                const credential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
                await updateUserDoc(credential.user.uid, userData);
            } catch (loginError) {
                console.error(`Could not login as ${userData.email} to update doc:`, loginError);
            }
        } else {
            console.error(`Error ensuring user ${userData.email}:`, error);
        }
    }
}

async function updateUserDoc(uid: string, userData: any) {
    await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        unidadeSaudeId: userData.unidadeSaudeId,
        updatedAt: serverTimestamp()
    }, { merge: true });
}
