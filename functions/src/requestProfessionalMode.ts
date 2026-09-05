/**
 * Cloud Function: Solicitar modo profissional
 *
 * Responsável por:
 * - Receber solicitação de um paciente para virar profissional
 * - Validar CRP (em futuro: contra base de conselhos)
 * - Criar registro aguardando aprovação de admin
 * - Notificar admin
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface ProfessionalRequestData {
  cpf: string;
  crp: string;
  specialty?: string;
  approach?: string;
  bio?: string;
  unitId: string; // Unidade de saúde onde vai atuar
}

interface ProfessionalRequest {
  id: string;
  uid: string;
  email: string;
  name: string;
  cpf: string; // Criptografado em produção
  crp: string;
  specialty?: string;
  approach?: string;
  bio?: string;
  unitId: string;
  status: 'pending_admin' | 'approved' | 'rejected' | 'expired';
  createdAt: admin.firestore.Timestamp;
  expiresAt: admin.firestore.Timestamp;
  notes?: string;
}

/**
 * Valida formato de CRP (exemplo para CRM, CRP, CRMV, etc)
 * Em produção, integrar com APIs de conselhos reais
 */
function validateCRPFormat(crp: string): boolean {
  // Formato básico: letras + números
  // Exemplo: CRM/SP: 123456/SP ou CRP/RJ: 0001/RJ
  const crmRegex = /^(CRM|CRP|CRMV|CRFA|CRN|CRO)\/[A-Z]{2}\s*:\s*\d+/i;
  const basicRegex = /^\d{4,8}$/; // Apenas números

  return crmRegex.test(crp) || basicRegex.test(crp);
}

/**
 * Cloud Function para solicitar modo profissional
 * Usuário logado como paciente pode solicitar upgrade
 */
export const requestProfessionalMode = functions.https.onCall(
  async (
    data: ProfessionalRequestData,
    context: functions.https.CallableContext
  ): Promise<{ status: string; message: string; requestId: string }> => {
    // Verificação de autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário deve estar autenticado'
      );
    }

    const uid = context.auth.uid;
    const db = admin.firestore();

    // Validar que o usuário é um paciente ou role indefinido
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Perfil de usuário não encontrado');
    }

    const userData = userSnap.data() as any;

    // Bloquear se já é profissional ou admin
    if (userData.role === 'professional' || userData.role === 'admin') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Você já possui permissões profissionais'
      );
    }

    // Validar dados de entrada
    const { cpf, crp, specialty, approach, bio, unitId } = data;

    if (!cpf || cpf.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'CPF é obrigatório');
    }

    if (!crp || crp.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'CRP é obrigatório');
    }

    if (!validateCRPFormat(crp)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Formato de CRP inválido. Use o formato do seu conselho (ex: CRM/SP: 123456)'
      );
    }

    if (!unitId || unitId.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Unidade de saúde é obrigatória'
      );
    }

    // Verificar que unidade existe
    const unitSnap = await db.collection('healthUnits').doc(unitId).get();
    if (!unitSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Unidade de saúde não encontrada');
    }

    try {
      // Verificar se já existe solicitação pendente ativa
      const existingRequests = await db
        .collection('professional_requests')
        .where('uid', '==', uid)
        .where('status', '==', 'pending_admin')
        .get();

      if (existingRequests.size > 0) {
        throw new functions.https.HttpsError(
          'already-exists',
          'Você já possui uma solicitação pendente. Aguarde a aprovação.'
        );
      }

      // Criar registro de solicitação
      const requestRef = db.collection('professional_requests').doc();

      const professionalRequest: Omit<ProfessionalRequest, 'id'> = {
        uid,
        email: context.auth.token.email || '',
        name: userData.name || 'Profissional',
        cpf, // Em produção: criptografar
        crp,
        specialty: specialty || '',
        approach: approach || '',
        bio: bio || '',
        unitId,
        status: 'pending_admin',
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        ),
      };

      await requestRef.set(professionalRequest);

      // Criar notificação para admin da unidade
      const unitAdmins = await db
        .collection('users')
        .where('unidadeSaudeId', '==', unitId)
        .where('role', '==', 'admin')
        .get();

      const notifications = [];

      for (const adminDoc of unitAdmins.docs) {
        notifications.push(
          db.collection('notifications').add({
            userId: adminDoc.id,
            type: 'professional_request',
            title: 'Nova solicitação profissional',
            message: `${userData.name} solicitou acesso como profissional`,
            data: {
              requestId: requestRef.id,
              userId: uid,
              unitId,
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        );
      }

      if (notifications.length > 0) {
        await Promise.all(notifications);
      }

      // Log de auditoria
      await db.collection('audit_logs').add({
        userId: uid,
        action: 'request_professional_mode',
        resource: 'professional_requests',
        resourceId: requestRef.id,
        status: 'success',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        status: 'pending',
        message:
          'Sua solicitação foi enviada para aprovação. Você será notificado assim que o administrador revisar.',
        requestId: requestRef.id,
      };
    } catch (error) {
      console.error('[requestProfessionalMode] Erro:', error);

      // Log de auditoria
      await db.collection('audit_logs').add({
        userId: uid,
        action: 'request_professional_mode',
        resource: 'professional_requests',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw error;
    }
  }
);
