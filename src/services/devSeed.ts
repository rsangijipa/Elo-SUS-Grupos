import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase_config';

export async function setupDevEnvironment() {
    // Hardcoded credentials as requested by the user for this specific fix
    const devEmail = 'admin@admin.com';
    const devPassword = 'admin123';

    try {
        console.log('Checking dev environment setup for admin...');

        try {
            await signInWithEmailAndPassword(auth, devEmail, devPassword);
            console.log('Admin user already exists and logged in successfully.');

            const currentUser = auth.currentUser;
            if (currentUser) {
                await ensureUserDoc(currentUser.uid, devEmail);
            }

        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                console.log('Admin user not found or invalid. Creating/Resetting...');
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, devEmail, devPassword);
                    console.log('Admin user created.');
                    await ensureUserDoc(userCredential.user.uid, devEmail);
                } catch (createError: any) {
                    console.error('Error creating admin user:', createError);
                    if (createError.code === 'auth/email-already-in-use') {
                        console.warn('Email already in use. Cannot reset password via client SDK.');
                    }
                }
            } else {
                console.error('Error checking admin user:', error);
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
            nome: 'Administrador',
            email: email,
            role: 'administrador',
            unidadeSaudeId: 'all',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('Firestore document created.');
    } else {
        console.log('Firestore document for dev user already exists.');
    }
}
