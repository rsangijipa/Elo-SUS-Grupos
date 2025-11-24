import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { MOCK_GROUPS, DEMO_PATIENTS } from '../utils/seedData';
import { groupService } from './groupService';
import { patientService } from './patientService';

export async function setupDevEnvironment() {
    // Hardcoded credentials as requested by the user for this specific fix
    const devEmail = 'admin@admin.com';
    const devPassword = 'admin123';

    try {
        console.log('Checking dev environment setup for admin...');

        let currentUser = auth.currentUser;

        if (!currentUser) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, devEmail, devPassword);
                currentUser = userCredential.user;
                console.log('Admin user logged in successfully.');
            } catch (error: any) {
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                    console.log('Admin user not found or invalid. Creating...');
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, devEmail, devPassword);
                        currentUser = userCredential.user;
                        console.log('Admin user created.');
                    } catch (createError: any) {
                        console.error('Error creating admin user:', createError);
                        return;
                    }
                } else {
                    console.error('Error signing in:', error);
                    return;
                }
            }
        }

        if (currentUser) {
            await ensureUserDoc(currentUser.uid, devEmail);
            await seedDatabase(currentUser.uid);
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
            role: 'professional', // Changed to professional to match rules
            unidadeSaudeId: 'all',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('Firestore document created.');
    } else {
        console.log('Firestore document for dev user already exists.');
    }
}

async function seedDatabase(userId: string) {
    try {
        // Check if groups exist
        const groupsSnapshot = await getDocs(collection(db, 'grupos'));
        if (groupsSnapshot.empty) {
            console.log('Seeding Groups...');
            for (const group of MOCK_GROUPS) {
                // Remove ID to let Firestore generate one, or keep it if we want consistent IDs
                // Here we let Firestore generate IDs but keep the content
                const { id, ...groupData } = group;
                await groupService.create({
                    ...groupData,
                    facilitatorId: userId // Assign to current admin
                });
            }
            console.log('Groups seeded.');
        } else {
            console.log('Groups already exist. Skipping seed.');
        }

        // Check if patients exist
        const patientsSnapshot = await getDocs(collection(db, 'pacientes'));
        if (patientsSnapshot.empty) {
            console.log('Seeding Patients...');
            for (const patient of DEMO_PATIENTS) {
                const { id, ...patientData } = patient;
                // Ensure patient data matches the interface expected by Firestore/Service
                await patientService.create({
                    name: patientData.name,
                    birthDate: patientData.birthDate,
                    phone: patientData.phone,
                    status: patientData.status as any,
                    cns: patientData.cns,
                    cpf: patientData.cpf,
                    sexo: 'Outro', // Default as seed data might not have it
                    unidadeSaudeId: 'ubs-centro'
                });
            }
            console.log('Patients seeded.');
        } else {
            console.log('Patients already exist. Skipping seed.');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}
