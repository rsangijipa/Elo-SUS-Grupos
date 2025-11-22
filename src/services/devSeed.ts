import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase_config';

export async function setupDevEnvironment() {
    const devEmail = import.meta.env.VITE_DEV_TEST_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_TEST_PASSWORD;

    if (!devEmail || !devPassword) {
        console.warn('Dev environment credentials not found. Skipping dev seed.');
        return;
    }

    try {
        console.log('Checking dev environment setup...');

        // Check if user exists in Firestore
        // We can't easily check Auth without trying to sign in or create, 
        // but we can check if the user doc exists in Firestore if we know the UID.
        // Since we don't know the UID beforehand without signing in, let's try to sign in first.

        try {
            await signInWithEmailAndPassword(auth, devEmail, devPassword);
            console.log('Dev user already exists and logged in successfully.');

            // Ensure Firestore doc exists
            const currentUser = auth.currentUser;
            if (currentUser) {
                await ensureUserDoc(currentUser.uid, devEmail);
            }

        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.log('Dev user not found. Creating...');
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, devEmail, devPassword);
                    console.log('Dev user created.');
                    await ensureUserDoc(userCredential.user.uid, devEmail);
                } catch (createError) {
                    console.error('Error creating dev user:', createError);
                }
            } else {
                console.error('Error checking dev user:', error);
            }
        }

    } catch (error) {
        console.error('Setup dev environment failed:', error);
    }
}

async function ensureUserDoc(uid: string, email: string) {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        console.log('Creating Firestore document for dev user...');
        await setDoc(userDocRef, {
            uid: uid,
            nome: 'Usuário de Teste',
            email: email,
            role: 'administrador',
            unidadeSaudeId: 'all', // or a specific ID if you have one seeded
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('Firestore document created.');
    } else {
        console.log('Firestore document for dev user already exists.');
    }
}
