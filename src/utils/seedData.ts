import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase_config';
// import type { UserProfile } from '../types/user';
import type { Group } from '../types/group';
import type { Patient } from '../types/patient';

export const seedDatabase = async () => {
    console.log('Starting seed...');

    try {
        // 0. Create Admin User (Authentication & Firestore)
        try {
            // Note: This might fail if user already exists, which is fine.
            // Ideally we check first, but for a seed script, try/catch is acceptable.
            const adminAuth = await createUserWithEmailAndPassword(auth, 'doll.ricardoll+test@gmail.com', '123456789');
            await updateProfile(adminAuth.user, { displayName: 'Ricardo Admin' });

            await setDoc(doc(db, 'users', adminAuth.user.uid), {
                uid: adminAuth.user.uid,
                nome: 'Ricardo Admin',
                email: 'doll.ricardoll+test@gmail.com',
                role: 'administrador',
                unidadeSaudeId: 'all',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('Admin user created');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('Admin user already exists, skipping creation.');
            } else {
                console.error('Error creating admin user:', error);
            }
        }

        // 1. Create Units
        const units = [
            { nome: 'UBS Central', tipo: 'UBS', cidade: 'São Paulo', estado: 'SP' },
            { nome: 'CAPS Esperança', tipo: 'CAPS', cidade: 'São Paulo', estado: 'SP' }
        ];

        const unitRefs = [];
        for (const unit of units) {
            const ref = await addDoc(collection(db, 'unidadesSaude'), { ...unit, ativo: true });
            unitRefs.push({ id: ref.id, ...unit });
        }

        console.log('Units created:', unitRefs);

        // 2. Create Patients
        const patients: Partial<Patient>[] = [
            { nomeCompleto: 'Maria Silva', dataNascimento: '1980-05-15', sexo: 'F', telefone: '11999990001', unidadeSaudeId: unitRefs[0].id },
            { nomeCompleto: 'João Santos', dataNascimento: '1992-10-20', sexo: 'M', telefone: '11999990002', unidadeSaudeId: unitRefs[0].id },
            { nomeCompleto: 'Ana Oliveira', dataNascimento: '2015-03-10', sexo: 'F', telefone: '11999990003', nomeResponsavel: 'Clara Oliveira', unidadeSaudeId: unitRefs[1].id },
            { nomeCompleto: 'Pedro Costa', dataNascimento: '1975-12-05', sexo: 'M', telefone: '11999990004', unidadeSaudeId: unitRefs[0].id },
            { nomeCompleto: 'Lucas Pereira', dataNascimento: '2005-07-25', sexo: 'M', telefone: '11999990005', unidadeSaudeId: unitRefs[1].id }
        ];

        for (const p of patients) {
            await addDoc(collection(db, 'pacientes'), { ...p, createdAt: new Date() });
        }
        console.log('Patients created');

        // 3. Create Groups
        const groups: Partial<Group>[] = [
            {
                titulo: 'Grupo de Tabagismo - Manhã',
                tipoGrupo: 'tabagismo',
                descricao: 'Apoio para cessação do tabagismo com abordagem cognitivo-comportamental.',
                unidadeSaudeId: unitRefs[0].id,
                terapeutaResponsavelId: 'demo-therapist-id',
                capacidadeMaxima: 15,
                publicoAlvo: 'Adultos fumantes',
                dataInicio: '2023-11-01',
                periodicidade: 'semanal',
                diaSemanaPadrao: 2, // Terça
                horarioInicioPadrao: '09:00',
                duracaoMinutos: 90,
                ativo: true
            },
            {
                titulo: 'Grupo de Gestantes',
                tipoGrupo: 'gestantes',
                descricao: 'Acompanhamento pré-natal psicológico.',
                unidadeSaudeId: unitRefs[0].id,
                terapeutaResponsavelId: 'demo-therapist-id',
                capacidadeMaxima: 10,
                publicoAlvo: 'Gestantes a partir do 2º trimestre',
                dataInicio: '2023-11-05',
                periodicidade: 'quinzenal',
                diaSemanaPadrao: 4, // Quinta
                horarioInicioPadrao: '14:00',
                duracaoMinutos: 60,
                ativo: true
            }
        ];

        for (const g of groups) {
            await addDoc(collection(db, 'grupos'), { ...g, createdAt: new Date() });
        }
        console.log('Groups created');

        alert('Dados de demonstração criados com sucesso!');
    } catch (error) {
        console.error('Error seeding database:', error);
        alert('Erro ao criar dados de demonstração. Verifique o console.');
    }
};
