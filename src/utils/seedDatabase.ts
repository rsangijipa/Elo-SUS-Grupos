import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';

// Mock Data Definitions
const USERS = [
    {
        id: 'prof_ricardo',
        name: 'Dr. Ricardo',
        email: 'ricardo@elosus.com',
        role: 'admin', // Using admin as requested for "Dr. Ricardo (Psicólogo, Admin)"
        crp: '12345/SP',
        specialty: 'Psicologia Clínica',
        avatar: 'DR',
        unidadeSaudeId: 'all'
    },
    {
        id: 'paciente_joao',
        name: 'João Silva',
        email: 'joao.silva@email.com',
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
        role: 'patient',
        age: 40,
        condition: 'Pai Atípico',
        avatar: 'CS',
        isParentOfTEA: true, // Custom field for logic
        unidadeSaudeId: 'ubs-centro'
    }
];

export const seedDatabase = async () => {
    console.log('🌱 Starting Database Seeding...');
    const batch = writeBatch(db);

    try {
        // 1. Clean existing users (Optional - be careful in prod!)
        // For safety, we might only overwrite specific IDs or clear specific collections if running in emulator
        // Here we will just overwrite the specific demo users to ensure they are fresh.

        console.log('🧹 Preparing user documents...');

        for (const user of USERS) {
            const userRef = doc(db, 'users', user.id);

            // Prepare base user data
            const userData: any = {
                ...user,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add specific logic fields based on profile description
            if (user.role === 'patient') {
                userData.status = 'active';
                userData.active = true;
            }

            batch.set(userRef, userData, { merge: true });
        }

        await batch.commit();
        console.log('✅ Database seeded successfully with demo profiles!');

        return true;
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return false;
    }
};
