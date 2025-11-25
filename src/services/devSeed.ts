import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { MOCK_GROUPS, DEMO_PATIENTS, MOCK_APPOINTMENTS } from '../utils/seedData';
import { groupService } from './groupService';
import { patientService } from './patientService';
import { appointmentService } from './appointmentService';

const DEMO_USERS = [
    {
        email: 'admin@elosus.gov.br',
        password: 'admin123', // Weak password for demo only
        role: 'professional',
        name: 'Administrador Demo',
        unidadeSaudeId: 'all'
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

        // Seed data using the first admin user found or created
        const adminUser = auth.currentUser;
        if (adminUser) {
            await seedDatabase(adminUser.uid);
        }

    } catch (error) {
        console.error('Setup dev environment failed:', error);
    }
}

async function ensureUser(userData: any) {
    try {
        // Try to create the user directly
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        console.log(`User ${userData.email} created.`);

        // Create Firestore doc
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            unidadeSaudeId: userData.unidadeSaudeId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log(`User ${userData.email} already exists.`);
            // Do NOT log in if user exists
        } else {
            console.error(`Error ensuring user ${userData.email}:`, error);
        }
    }
}

async function seedDatabase(userId: string) {
    try {
        // Check if groups exist
        const groupsSnapshot = await getDocs(collection(db, 'grupos'));
        if (groupsSnapshot.empty) {
            console.log('Seeding Groups...');
            for (const group of MOCK_GROUPS) {
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
                await patientService.create({
                    name: patientData.name,
                    birthDate: patientData.birthDate,
                    phone: patientData.phone,
                    status: patientData.status as any,
                    cns: patientData.cns,
                    cpf: patientData.cpf,
                    sexo: 'Outro',
                    unidadeSaudeId: 'ubs-centro'
                });
            }
            console.log('Patients seeded.');
        } else {
            console.log('Patients already exist. Skipping seed.');
        }

        // Check if appointments exist
        const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
        if (appointmentsSnapshot.empty) {
            console.log('Seeding Appointments...');
            for (const appointment of MOCK_APPOINTMENTS) {
                const { id, ...appointmentData } = appointment;
                await appointmentService.create({
                    ...appointmentData,
                    // Ensure date is string if it's Date object
                    date: appointmentData.date instanceof Date ? appointmentData.date.toISOString() : appointmentData.date
                });
            }
            console.log('Appointments seeded.');
        } else {
            console.log('Appointments already exist. Skipping seed.');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}
