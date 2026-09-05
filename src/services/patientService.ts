/**
 * Serviço consolidado de Pacientes
 * P1: Arquitetura unificada
 *
 * Responsável por:
 * - CRUD de pacientes com segurança
 * - Queries com isolamento por unitId
 * - Manutenção do vínculo userId ↔ patientId
 * - Auditoria de operações
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import toast from 'react-hot-toast';
import type { Patient } from '../types/patient';

/**
 * Obter paciente por ID
 * Firestore Rules valida permissão
 */
export async function getPatient(patientId: string): Promise<Patient | null> {
  try {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`[patientService] Paciente não encontrado: ${patientId}`);
      return null;
    }

    return {
      patientId: docSnap.id,
      ...docSnap.data(),
    } as Patient;
  } catch (error) {
    console.error('[patientService] Erro ao obter paciente:', error);
    throw error;
  }
}

/**
 * Obter paciente pelo userId (buscar em patients onde userId = uid)
 * Útil para mapear: auth.uid → patientId
 */
export async function getPatientByUserId(userId: string): Promise<Patient | null> {
  try {
    const q = query(
      collection(db, 'patients'),
      where('userId', '==', userId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.info(`[patientService] Nenhum paciente encontrado para userId: ${userId}`);
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      patientId: doc.id,
      ...doc.data(),
    } as Patient;
  } catch (error) {
    console.error('[patientService] Erro ao buscar paciente por userId:', error);
    throw error;
  }
}

/**
 * Listar pacientes de uma unidade (com paginação)
 * Profissionais veem seus próprios pacientes
 * Admins veem todos os pacientes da unidade
 */
export async function getPatientsInUnit(
  unitId: string,
  pageSize: number = 20,
  pageToken?: any
): Promise<{ patients: Patient[]; nextToken?: any }> {
  try {
    let q = query(
      collection(db, 'patients'),
      where('unidadeSaudeId', '==', unitId),
      where('status', '==', 'active'),
      orderBy('name'),
      limit(pageSize)
    );

    if (pageToken) {
      // Implementar pagination se necessário
    }

    const querySnapshot = await getDocs(q);

    const patients = querySnapshot.docs.map((doc) => ({
      patientId: doc.id,
      ...doc.data(),
    })) as Patient[];

    return {
      patients,
      nextToken: querySnapshot.docs.length === pageSize ? querySnapshot.docs[pageSize - 1] : undefined,
    };
  } catch (error) {
    console.error('[patientService] Erro ao listar pacientes:', error);
    throw error;
  }
}

/**
 * Listar pacientes de um grupo
 */
export async function getPatientsInGroup(groupId: string): Promise<Patient[]> {
  try {
    // Buscar todos os pacientes que têm este grupo em enrolledGroups
    const q = query(
      collection(db, 'patients'),
      where('enrolledGroups', 'array-contains', groupId)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      patientId: doc.id,
      ...doc.data(),
    })) as Patient[];
  } catch (error) {
    console.error('[patientService] Erro ao listar pacientes do grupo:', error);
    throw error;
  }
}

/**
 * Criar novo paciente
 * Requer: autenticação + profissional/admin da unidade
 */
export async function createPatient(data: Omit<Patient, 'patientId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const patientRef = doc(collection(db, 'patients'));

    const now = Timestamp.now();

    const patientData: Patient = {
      patientId: patientRef.id,
      ...data,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };

    await setDoc(patientRef, patientData);

    console.info(`[patientService] Paciente criado: ${patientRef.id}`);
    toast.success('Paciente registrado com sucesso');

    return patientRef.id;
  } catch (error) {
    console.error('[patientService] Erro ao criar paciente:', error);
    toast.error('Erro ao registrar paciente');
    throw error;
  }
}

/**
 * Atualizar dados de paciente
 */
export async function updatePatient(
  patientId: string,
  updates: Partial<Patient>
): Promise<void> {
  try {
    const patientRef = doc(db, 'patients', patientId);

    // Adicionar timestamp de atualização
    const dataToUpdate = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(patientRef, dataToUpdate);

    console.info(`[patientService] Paciente atualizado: ${patientId}`);
    toast.success('Dados atualizados');
  } catch (error) {
    console.error('[patientService] Erro ao atualizar paciente:', error);
    toast.error('Erro ao atualizar dados');
    throw error;
  }
}

/**
 * Atualizar status do paciente (com histórico)
 */
export async function updatePatientStatus(
  patientId: string,
  newStatus: string,
  reason?: string,
  recordedBy?: string
): Promise<void> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      throw new Error('Paciente não encontrado');
    }

    const patient = patientSnap.data() as Patient;

    const transition = {
      from: patient.status,
      to: newStatus,
      reason: reason || '',
      date: new Date(),
      recordedBy: recordedBy || 'system',
    };

    await updateDoc(patientRef, {
      status: newStatus,
      statusHistory: [...(patient.statusHistory || []), transition],
      updatedAt: Timestamp.now(),
    });

    console.info(`[patientService] Status do paciente atualizado: ${patientId} → ${newStatus}`);
  } catch (error) {
    console.error('[patientService] Erro ao atualizar status:', error);
    throw error;
  }
}

/**
 * Adicionar grupo ao paciente
 */
export async function addPatientToGroup(patientId: string, groupId: string): Promise<void> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      throw new Error('Paciente não encontrado');
    }

    const patient = patientSnap.data() as Patient;
    const enrollment = {
      groupId,
      joinDate: new Date(),
      status: 'active',
    };

    await updateDoc(patientRef, {
      enrolledGroups: [...(patient.enrolledGroups || []), enrollment],
      updatedAt: Timestamp.now(),
    });

    console.info(`[patientService] Paciente adicionado ao grupo: ${patientId} → ${groupId}`);
  } catch (error) {
    console.error('[patientService] Erro ao adicionar paciente ao grupo:', error);
    throw error;
  }
}

/**
 * Remover paciente de um grupo
 */
export async function removePatientFromGroup(patientId: string, groupId: string): Promise<void> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      throw new Error('Paciente não encontrado');
    }

    const patient = patientSnap.data() as Patient;

    const updatedEnrollments = patient.enrolledGroups?.filter((e) => e.groupId !== groupId) || [];

    await updateDoc(patientRef, {
      enrolledGroups: updatedEnrollments,
      updatedAt: Timestamp.now(),
    });

    console.info(`[patientService] Paciente removido do grupo: ${patientId}`);
  } catch (error) {
    console.error('[patientService] Erro ao remover paciente do grupo:', error);
    throw error;
  }
}

/**
 * Deletar paciente (soft delete - marcar como inativo)
 */
export async function deletePatient(patientId: string): Promise<void> {
  try {
    await updatePatientStatus(patientId, 'inactive', 'Patient deleted by admin');
    console.info(`[patientService] Paciente deletado: ${patientId}`);
  } catch (error) {
    console.error('[patientService] Erro ao deletar paciente:', error);
    throw error;
  }
}

/**
 * Real-time listener para pacientes de uma unidade
 */
export function listenToPatientsInUnit(
  unitId: string,
  callback: (patients: Patient[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'patients'),
    where('unidadeSaudeId', '==', unitId),
    orderBy('name')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const patients = snapshot.docs.map((doc) => ({
        patientId: doc.id,
        ...doc.data(),
      })) as Patient[];

      callback(patients);
    },
    (error) => {
      console.error('[patientService] Erro no listener:', error);
      if (onError) onError(error as Error);
    }
  );
}

/**
 * Buscar paciente por texto (nome, CPF, CNS)
 */
export async function searchPatients(unitId: string, searchTerm: string): Promise<Patient[]> {
  try {
    const q = query(
      collection(db, 'patients'),
      where('unidadeSaudeId', '==', unitId),
      orderBy('name')
    );

    const querySnapshot = await getDocs(q);

    // Filtrar no cliente por enquanto (Firestore não tem full-text search nativo)
    const patients = querySnapshot.docs
      .map((doc) => ({
        patientId: doc.id,
        ...doc.data(),
      }) as Patient)
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.cpf.includes(term) ||
          (p.cns && p.cns.includes(term))
        );
      });

    return patients;
  } catch (error) {
    console.error('[patientService] Erro na busca:', error);
    throw error;
  }
}

/**
 * Registrar auditoria de acesso/modificação
 */
export async function logPatientAccess(
  patientId: string,
  userId: string,
  action: string
): Promise<void> {
  try {
    const auditRef = collection(db, 'audit_logs');

    await setDoc(doc(auditRef), {
      userId,
      action,
      resource: 'patient',
      resourceId: patientId,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.warn('[patientService] Erro ao registrar auditoria:', error);
    // Não falhar operação por erro na auditoria
  }
}

/**
 * Backward-compatible object export for imports expecting `{ patientService }`
 */
export const patientService = {
  getPatient,
  getPatientByUserId,
  getPatientsInUnit,
  getPatientsInGroup,
  createPatient,
  updatePatient,
  updatePatientStatus,
  addPatientToGroup,
  removePatientFromGroup,
  deletePatient,
  listenToPatientsInUnit,
  searchPatients,
  logPatientAccess,
};
