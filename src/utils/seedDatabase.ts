import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { db, auth } from '../services/firebase';

// Mock Data Definitions
const USERS = [
    {
        id: 'prof_ricardo',
        name: 'Dr. Ricardo',
        email: 'ricardo@elosus.com',
        password: 'password123',
        role: 'admin',
        crp: '12345/SP',
        specialty: 'Psicologia Clínica',
        avatar: 'DR',
        unidadeSaudeId: 'all'
    },
    {
        id: 'paciente_joao',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        password: 'password123',
        role: 'patient',
        age: 35,
        condition: 'Ansiedade',
        avatar: 'JS',
        healthScreening: {
            anxietyAlert: true,
            depressionAlert: false,
            score: 15, // High anxiety
            date: new Date().toISOString()
        },
        unidadeSaudeId: 'ubs-centro'
    },
    {
        id: 'paciente_maria',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        password: 'password123',
        role: 'patient',
        age: 28,
        gestationWeeks: 30,
        condition: 'Gestante',
        avatar: 'MO',
        pregnantScreening: {
            riskLevel: 'none',
            score: 2,
            date: new Date().toISOString()
        },
        unidadeSaudeId: 'ubs-centro'
    },
    {
        id: 'paciente_carlos',
        name: 'Carlos Souza',
        email: 'carlos.souza@email.com',
        password: 'password123',
        role: 'patient',
        age: 40,
        condition: 'Pai Atípico',
        avatar: 'CS',
        isParentOfTEA: true,
        unidadeSaudeId: 'ubs-centro'
    }
];

export const seedDatabase = async () => {
    console.log('🌱 Starting Database Seeding...');

    try {
        for (const user of USERS) {
            console.log(`Processing user: ${user.email}`);
            let uid = user.id; // Default to ID if we can't get Auth UID (fallback)

            try {
                // 1. Try to Create User in Auth
                const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
                uid = userCredential.user.uid;
                console.log(`✅ Created Auth user: ${user.email}`);

                // Update Profile Name
                await updateProfile(userCredential.user, {
                    displayName: user.name
                });

            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`⚠️ User already exists: ${user.email}. Signing in to update...`);
                    // Sign in to get UID
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
                        uid = userCredential.user.uid;
                    } catch (loginError) {
                        console.error(`❌ Could not login as ${user.email}`, loginError);
                        continue; // Skip this user if we can't login
                    }
                } else {
                    console.error(`❌ Error creating user ${user.email}:`, error);
                    continue;
                }
            }

            // 2. Create/Update Firestore Document
            // Note: We use the Auth UID as the document ID to link them correctly
            const userRef = doc(db, 'users', uid);

            const userData: any = {
                ...user,
                uid: uid, // Ensure UID is in the doc
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Remove password from Firestore doc
            delete userData.password;

            if (user.role === 'patient') {
                userData.status = 'active';
                userData.active = true;
            }

            await setDoc(userRef, userData, { merge: true });
            console.log(`✅ Updated Firestore doc for: ${user.name}`);
        }

        // 3. Sign out the last user to leave the app clean
        await signOut(auth);
        console.log('✅ Database seeded successfully! Signed out.');

        return true;
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return false;
    }
};
