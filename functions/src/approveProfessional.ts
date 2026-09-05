/**
 * Cloud Function: Aprovar profissional
 *
 * Responsável por:
 * - Verificar que quem está aprovando é admin
 * - Atualizar Custom Claims do usuário
 * - Marcar solicitação como aprovada
 * - Notificar profissional
 *
 * Segurança: Apenas admins podem chamar isso
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface ApproveProfessionalRequest {
  professionalRequestId: string;
  approve: boolean;
  rejectionReason?: string;
}

/**
 * Cloud Function para aprovar/rejeitar solicitação de profissional
 * Apenas admins podem chamar isso
 */
export const approveProfessional = functions.https.onCall(
  async (
    data: ApproveProfessionalRequest,
    context: functions.https.CallableContext
  ): Promise<{ status: string; message: string }> => {
    // Verificação de autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário deve estar autenticado'
      );
    }

    const adminUid = context.auth.uid;
    const db = admin.firestore();

    // Verificar que quem está chamando é admin
    const adminUser = await db.collection('users').doc(adminUid).get();

    if (!adminUser.exists) {
      throw new functions.https.HttpsError('not-found', 'Perfil de admin não encontrado');
    }

    const adminData = adminUser.data() as any;

    // Bloquear se não é admin
    if (adminData.role !== 'admin') {
      console.warn(
        `[approveProfessional] Tentativa de aprovação por não-admin: ${adminUid}`
      );

      throw new functions.https.HttpsError(
        'permission-denied',
        'Apenas administradores podem aprovar profissionais'
      );
    }

    const { professionalRequestId, approve, rejectionReason } = data;

    if (!professionalRequestId || professionalRequestId.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID da solicitação é obrigatório'
      );
    }

    try {
      // Buscar solicitação
      const requestRef = db.collection('professional_requests').doc(professionalRequestId);
      const requestSnap = await requestRef.get();

      if (!requestSnap.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Solicitação de profissional não encontrada'
        );
      }

      const request = requestSnap.data() as any;

      // Verificar se solicitação está expirada
      const now = new Date();
      const expiresAt = request.expiresAt?.toDate() || new Date();

      if (now > expiresAt && approve) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Solicitação expirou. Solicite novamente.'
        );
      }

      // Verificar que admin é da mesma unidade
      if (adminData.unidadeSaudeId !== request.unitId) {
        console.warn(
          `[approveProfessional] Admin de unidade diferente tentando aprovar: ${adminUid} vs ${request.unitId}`
        );

        throw new functions.https.HttpsError(
          'permission-denied',
          'Você só pode aprovar profissionais de sua unidade'
        );
      }

      if (approve) {
        // ============ APROVAR ============

        // 1. Atualizar Custom Claims
        // Isso é a parte crítica: role vira "professional" e nunca mais pode ser mudado por cliente
        try {
          await admin.auth().setCustomUserClaims(request.uid, {
            role: 'professional',
            unitId: request.unitId,
            crp: request.crp,
            approvedAt: new Date().toISOString(),
            approvedBy: adminUid,
          });

          console.info(
            `[approveProfessional] Custom Claims atualizadas para ${request.uid}: professional`
          );
        } catch (claimsError) {
          console.error(
            '[approveProfessional] Erro ao atualizar Custom Claims:',
            claimsError
          );

          throw new functions.https.HttpsError(
            'internal',
            'Erro ao configurar permissões profissionais'
          );
        }

        // 2. Atualizar documento do usuário (metadata)
        await db.collection('users').doc(request.uid).update({
          role: 'professional',
          crp: request.crp,
          specialty: request.specialty || '',
          approach: request.approach || '',
          bio: request.bio || '',
          unidadeSaudeId: request.unitId,
          professionalStatus: 'approved',
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: adminUid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 3. Atualizar solicitação como aprovada
        await requestRef.update({
          status: 'approved',
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: adminUid,
        });

        // 4. Criar notificação para o profissional
        await db.collection('notifications').add({
          userId: request.uid,
          type: 'professional_approved',
          title: 'Sua solicitação foi aprovada!',
          message: `Você agora possui acesso como profissional de saúde na unidade ${request.unitId}`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          data: {
            requestId: professionalRequestId,
          },
        });

        // 5. Log de auditoria
        await db.collection('audit_logs').add({
          userId: adminUid,
          action: 'approve_professional',
          resource: 'professional_requests',
          resourceId: professionalRequestId,
          status: 'success',
          changes: {
            targetUser: request.uid,
            previousRole: 'patient',
            newRole: 'professional',
            crp: request.crp,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          status: 'approved',
          message: `Profissional ${request.name} aprovado com sucesso`,
        };
      } else {
        // ============ REJEITAR ============

        if (!rejectionReason) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Motivo da rejeição é obrigatório'
          );
        }

        // 1. Atualizar solicitação como rejeitada
        await requestRef.update({
          status: 'rejected',
          rejectionReason,
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          rejectedBy: adminUid,
        });

        // 2. Criar notificação para o profissional
        await db.collection('notifications').add({
          userId: request.uid,
          type: 'professional_rejected',
          title: 'Sua solicitação foi analisada',
          message: `Sua solicitação de acesso profissional foi analisada. Motivo: ${rejectionReason}`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          data: {
            requestId: professionalRequestId,
            reason: rejectionReason,
          },
        });

        // 3. Log de auditoria
        await db.collection('audit_logs').add({
          userId: adminUid,
          action: 'reject_professional',
          resource: 'professional_requests',
          resourceId: professionalRequestId,
          status: 'success',
          changes: {
            targetUser: request.uid,
            rejectionReason,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          status: 'rejected',
          message: `Solicitação de ${request.name} rejeitada`,
        };
      }
    } catch (error) {
      // Se for erro já tratado, relançar
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      console.error('[approveProfessional] Erro inesperado:', error);

      // Log de auditoria
      try {
        await db.collection('audit_logs').add({
          userId: adminUid,
          action: 'approve_professional',
          resource: 'professional_requests',
          resourceId: professionalRequestId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (auditError) {
        console.error('[approveProfessional] Erro ao salvar auditoria:', auditError);
      }

      throw new functions.https.HttpsError(
        'internal',
        'Erro ao processar solicitação'
      );
    }
  }
);
