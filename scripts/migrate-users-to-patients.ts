/**
 * Script de Migration: Consolidar users → patients
 * P1.1: Transição de arquitetura
 *
 * Objetivo:
 * - Para cada user com role 'patient', criar um registro em patients/
 * - Incluir vínculo userId = uid (chave estrangeira)
 * - Migrar dados clínicos relevantes
 * - Manter histórico e auditoria
 *
 * Execução:
 * npx ts-node scripts/migrate-users-to-patients.ts
 *
 * IMPORTANTE:
 * - Teste em DEV first
 * - Fazer backup do Firestore antes
 * - Executar fora de horário de uso
 */

import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Inicializar Firebase Admin (usar credenciais padrão do projeto)
admin.initializeApp();

const db = admin.firestore();

interface LegacyUser {
  uid: string;
  name: string;
  email: string;
  cpf?: string;
  cns?: string;
  neighborhood?: string;
  address?: string;
  phone?: string;
  role: string;
  createdAt?: admin.firestore.Timestamp;
}

interface NewPatient {
  patientId: string;
  userId: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  gender?: string;
  cpf?: string;
  cns?: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  unidadeSaudeId: string;
  status: 'active';
  statusHistory: any[];
  clinicalData: {
    primaryDiagnosis?: string;
    diagnoses: any[];
    comorbidities: any[];
    currentMedications: any[];
    allergies: any[];
  };
  screenings: any[];
  enrolledGroups: any[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  isActive: boolean;
  lastActivityDate: Date;
}

/**
 * Migrar um usuário para paciente
 */
async function migrateUserToPatient(user: LegacyUser): Promise<string> {
  const patientId = uuidv4();

  const newPatient: NewPatient = {
    patientId,
    userId: user.uid,
    name: user.name,
    email: user.email,
    dateOfBirth: undefined,
    gender: undefined,
    cpf: user.cpf || '',
    cns: user.cns || '',
    address: {
      street: '',
      neighborhood: user.neighborhood || '',
      city: '',
      state: '',
      zipCode: '',
    },
    phone: user.phone || '',
    unidadeSaudeId: 'default', // Será preenchido manualmente depois
    status: 'active',
    statusHistory: [],
    clinicalData: {
      diagnoses: [],
      comorbidities: [],
      currentMedications: [],
      allergies: [],
    },
    screenings: [],
    enrolledGroups: [],
    createdAt: user.createdAt?.toDate() || new Date(),
    updatedAt: new Date(),
    createdBy: 'system_migration',
    lastModifiedBy: 'system_migration',
    isActive: true,
    lastActivityDate: new Date(),
  };

  try {
    await db.collection('patients').doc(patientId).set(newPatient);
    console.log(`✅ Migrado: ${user.email} (${user.uid}) → patients/${patientId}`);
    return patientId;
  } catch (error) {
    console.error(`❌ Erro ao migrar ${user.email}:`, error);
    throw error;
  }
}

/**
 * Executar migração completa
 */
async function executeMigration() {
  console.log('📋 Iniciando migration: users → patients');
  console.log('=' .repeat(60));

  try {
    // 1. Buscar todos os usuários com role 'patient'
    const usersSnapshot = await db
      .collection('users')
      .where('role', '==', 'patient')
      .get();

    console.log(`\n📊 Encontrados ${usersSnapshot.size} pacientes para migrar\n`);

    const users = usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as LegacyUser[];

    // 2. Verificar se alguns já foram migrados
    const existingPatients = await db
      .collection('patients')
      .where('userId', 'in', users.map((u) => u.uid))
      .get();

    const migratedUserIds = new Set(existingPatients.docs.map((d) => d.data().userId));

    console.log(
      `⚠️  ${migratedUserIds.size} usuários já possuem registros em patients/`
    );

    const usersToMigrate = users.filter((u) => !migratedUserIds.has(u.uid));

    console.log(`🔄 Migrando ${usersToMigrate.length} novos pacientes\n`);

    // 3. Migrar em lotes
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < usersToMigrate.length; i += batchSize) {
      const batch = usersToMigrate.slice(i, i + batchSize);

      console.log(
        `\n📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          usersToMigrate.length / batchSize
        )} (${batch.length} usuários)`
      );

      const results = await Promise.allSettled(
        batch.map((user) => migrateUserToPatient(user))
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Erro:`, result.reason);
        }
      });

      // Pequeno delay entre lotes
      if (i + batchSize < usersToMigrate.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 4. Resumo
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESULTADO DA MIGRAÇÃO:');
    console.log(`✅ Sucesso: ${successCount} pacientes`);
    console.log(`❌ Erros: ${errorCount} pacientes`);
    console.log(`⏭️  Já migrados: ${migratedUserIds.size} pacientes`);
    console.log(`📊 Total: ${successCount + errorCount + migratedUserIds.size} pacientes`);
    console.log('=' .repeat(60));

    if (errorCount > 0) {
      console.log(
        '\n⚠️  ATENÇÃO: Alguns pacientes não foram migrados. Revise os erros acima.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n✅ Migration concluída com sucesso! Todos os pacientes foram migrados.'
      );
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO durante migration:', error);
    process.exit(1);
  }
}

// Executar
console.log('\n🚀 Iniciando script de migration...\n');
executeMigration().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
