/**
 * Cloud Function: Análise de relato de humor/bem-estar
 *
 * Responsável por:
 * - Receber relato do paciente de forma segura
 * - Analisar com IA (Gemini) se disponível
 * - Retornar análise com fallbacks seguros
 * - Auditar acessos
 *
 * Deploy:
 * firebase deploy --only functions:analyzeMood
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UrgencyLevel } from '../../src/types/common';

interface MoodAnalysisRequest {
  moodText: string;
  tags?: string[];
  date?: string;
}

interface MoodAnalysisResponse {
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  riskFlag: boolean;
  urgencyLevel: UrgencyLevel;
  summary: string;
  suggestion: string;
  source: 'ai' | 'error';
  timestamp: string;
}

// Inicializar Gemini (usando variável de ambiente)
let genAI: GoogleGenerativeAI | null = null;

function initializeGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Log de auditoria para acessos à análise de humor
 */
async function logAuditTrail(
  userId: string,
  action: string,
  status: 'success' | 'error',
  error?: string
): Promise<void> {
  const db = admin.firestore();

  try {
    await db.collection('audit_logs').add({
      userId,
      action,
      resource: 'mood_analysis',
      status,
      error,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: null, // Pode ser extraído do contexto se necessário
      userAgent: null,
    });
  } catch (auditError) {
    console.error('[analyzeMood] Erro ao salvar log de auditoria:', auditError);
    // Não falhar a operação por causa do log
  }
}

/**
 * Parsing seguro da resposta da IA
 */
function parseAIResponse(text: string): Partial<MoodAnalysisResponse> {
  try {
    // A resposta da IA é estruturada como JSON ou texto
    // Tentar extrair campos esperados

    const sentimentMatch = text.match(
      /sentiment["\s:]*["\']?(positive|neutral|negative)["\']?/i
    );
    const riskMatch = text.match(
      /risk(?:Flag)?["\s:]*(?:true|false|sim|não|yes|no)/i
    );
    const urgencyMatch = text.match(
      /urgency["\s:]*["\']?(none|low|high|critical)["\']?/i
    );

    return {
      sentiment: sentimentMatch ? ('positive' as const) : ('unknown' as const),
      riskFlag: riskMatch
        ? riskMatch[0].toLowerCase().includes('true') ||
          riskMatch[0].toLowerCase().includes('sim')
        : false,
      urgencyLevel: (urgencyMatch ? urgencyMatch[1] : 'none') as UrgencyLevel,
      summary: text.substring(0, 200),
      suggestion: text.substring(200, 400) || 'Continue acompanhamento profissional',
    };
  } catch (parseError) {
    console.error('[analyzeMood] Erro ao parsear resposta:', parseError);
    return {
      sentiment: 'unknown' as const,
      riskFlag: false,
      urgencyLevel: 'unknown' as UrgencyLevel,
      summary: 'Análise não disponível',
      suggestion: 'Por favor, consulte um profissional',
    };
  }
}

/**
 * Cloud Function chamável para análise de humor
 */
export const analyzeMood = functions.https.onCall(
  async (
    data: MoodAnalysisRequest,
    context: functions.https.CallableContext
  ): Promise<MoodAnalysisResponse> => {
    // Verificação de autenticação
    if (!context.auth) {
      console.warn('[analyzeMood] Tentativa não autenticada');
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário deve estar autenticado'
      );
    }

    const userId = context.auth.uid;
    const { moodText, tags = [] } = data;

    // Validação básica de entrada
    if (!moodText || moodText.trim().length === 0) {
      await logAuditTrail(userId, 'analyze_mood', 'error', 'Texto vazio');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Texto do relato é obrigatório'
      );
    }

    if (moodText.length > 5000) {
      await logAuditTrail(userId, 'analyze_mood', 'error', 'Texto muito longo');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Texto não pode exceder 5000 caracteres'
      );
    }

    console.info(`[analyzeMood] Novo relato do usuário ${userId}`);

    try {
      // Inicializar Gemini
      const genAI = initializeGemini();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Montar prompt seguro
      const prompt = `
Você é um assistente de suporte emocional em um sistema de saúde pública (SUS).

IMPORTANTE: Você fornece assistência, NÃO diagnóstico. Um profissional de saúde mental sempre deve avaliar.

Paciente relatou:
"${moodText}"

Tags fornecidas: ${tags.join(', ') || 'nenhuma'}

Analise brevemente (máximo 3 parágrafos):

1. SENTIMENTO: Identifique o sentimento geral (positivo/neutro/negativo)
2. RISCO: Detecte APENAS riscos explícitos (keywords como: suicídio, morte, auto-agressão, overdose)
3. URGÊNCIA: Se risco detectado = HIGH, senão = NONE ou LOW
4. RESUMO: Uma frase sobre o que o paciente relatou
5. SUGESTÃO: Próximo passo recomendado

Se palavras-chave críticas forem detectadas (suicídio, morte, etc):
- Retorne urgencyLevel como HIGH ou CRITICAL
- Sugira contato imediato com: CVV (188) ou SAMU (192)
- Deixe claro que é EMERGÊNCIA

Formate a resposta como JSON simples:
{
  "sentiment": "positive|neutral|negative",
  "riskFlag": true|false,
  "urgencyLevel": "none|low|high|critical",
  "summary": "resumo breve",
  "suggestion": "próximo passo"
}
`;

      const response = await model.generateContent(prompt);
      const analysisText = response.response.text();

      console.info(`[analyzeMood] Análise concluída para usuário ${userId}`);

      // Parse da resposta
      let parsedAnalysis;
      try {
        // Tentar extrair JSON da resposta
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : parseAIResponse(analysisText);
      } catch (parseError) {
        console.warn('[analyzeMood] Erro ao parsear JSON:', parseError);
        parsedAnalysis = parseAIResponse(analysisText);
      }

      // Validar resultado
      const result: MoodAnalysisResponse = {
        sentiment: parsedAnalysis.sentiment || 'unknown',
        riskFlag: Boolean(parsedAnalysis.riskFlag),
        urgencyLevel: parsedAnalysis.urgencyLevel || 'none',
        summary: parsedAnalysis.summary || 'Análise concluída',
        suggestion: parsedAnalysis.suggestion || 'Consulte um profissional de saúde',
        source: 'ai',
        timestamp: new Date().toISOString(),
      };

      // Log de auditoria bem-sucedido
      await logAuditTrail(userId, 'analyze_mood', 'success');

      return result;
    } catch (error) {
      console.error('[analyzeMood] Erro durante análise:', error);

      await logAuditTrail(
        userId,
        'analyze_mood',
        'error',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );

      // Retornar erro, mas sem expor detalhes de implementação
      throw new functions.https.HttpsError(
        'internal',
        'Não foi possível analisar o relato. Por favor, tente novamente.'
      );
    }
  }
);

/**
 * Cloud Function para limpar logs antigos de auditoria
 * Executar diariamente via Cloud Scheduler
 */
export const cleanOldAuditLogs = functions.pubsub
  .schedule('every day 02:00')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
      const oldLogs = await db
        .collection('audit_logs')
        .where('timestamp', '<', thirtyDaysAgo)
        .limit(1000)
        .get();

      let deleted = 0;
      const batch = db.batch();

      for (const doc of oldLogs.docs) {
        batch.delete(doc.ref);
        deleted++;
      }

      if (deleted > 0) {
        await batch.commit();
        console.info(`[cleanOldAuditLogs] ${deleted} logs antigos deletados`);
      }

      return null;
    } catch (error) {
      console.error('[cleanOldAuditLogs] Erro:', error);
      throw error;
    }
  });
