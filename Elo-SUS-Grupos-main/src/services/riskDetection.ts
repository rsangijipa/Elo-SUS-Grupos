/**
 * Serviço de detecção de risco e sinais de acompanhamento
 *
 * Responsável por:
 * - Detectar sinais de risco independentemente de IA
 * - Combinar análise local com análise remota
 * - Garantir fallback seguro se IA estiver indisponível
 *
 * IMPORTANTE: Isso é assistência à decisão profissional, não diagnóstico
 */

import type { UrgencyLevel, RiskType } from '../types/common';

export interface EngagementSignal {
  type: RiskType;
  labels: string[];
  suggestedReview: string;
  clinicalNote: string;
  confidence: number; // 0-100
  requiresProfessionalReview: boolean;
}

export interface CombinedAnalysis {
  riskFlag: boolean;
  urgencyLevel: UrgencyLevel;
  source: 'local_keywords' | 'ai' | 'combined' | 'error';
  signals: EngagementSignal[];
  aiAnalysis: unknown | null;
  lastUpdated: Date;
  disclaimer: string;
}

export class RiskDetectionService {
  /**
   * Palavras-chave que indicam risco CRÍTICO
   * (Requerem atenção imediata)
   */
  private static readonly CRITICAL_KEYWORDS = [
    // Suicídio/auto-agressão
    'suicídio',
    'suicida',
    'morrer',
    'morte',
    'pular',
    'pulo',
    'veneno',
    'corda',
    'faca',
    'facada',
    'cortar',
    'machucar',
    'magoar',
    'prejudicar',
    'cianeto',
    'overdose',
    'overdosis',
    'medicamento',
    'comprimido',
    'droga',
    'cocaína',
    'álcool',
    'álcool demais',
    'asfixia',
    'despenhadeiro',
    'precipício',
    'arma',
    'arma fogo',
    'revólver',
    'tiro',
    'bala',
    'envenenamento',
    'queimadura',
    'afogamento',
    // Pensamentos de morte
    'não aguento',
    'não aguento mais',
    'não consigo',
    'desistir',
    'disto',
    'acabar com isso',
    'fim',
    'tudo acabou',
    'tudo é culpa minha',
    'melhor morrer',
    'quero desaparecer',
    'ninguém me quer',
    'ninguém precisa de mim',
    'sou um fracasso',
    'sou inútil',
    'vou morrer',
    'todo mundo seria melhor sem mim',
    'me deixem em paz para sempre',
  ];

  /**
   * Palavras-chave que indicam risco ALTO
   * (Requerem acompanhamento próximo)
   */
  private static readonly HIGH_KEYWORDS = [
    'deprimido',
    'depressão',
    'deprimido',
    'triste',
    'tristeza',
    'ansioso',
    'ansiedade',
    'pânico',
    'ataques de pânico',
    'desespero',
    'desesperado',
    'dor',
    'dores',
    'sofrer',
    'sofrimento',
    'solitário',
    'solitária',
    'sozinho',
    'sozinha',
    'isolado',
    'isolada',
    'rejeitado',
    'rejeitada',
    'abandonado',
    'abandonada',
    'fracasso',
    'inútil',
    'culpa',
    'culpado',
    'culpada',
    'vergonha',
    'envergonhado',
    'envergonhada',
    'raiva',
    'raivoso',
    'nervoso',
    'nervosa',
    'irritação',
    'irritado',
    'irritada',
    'agressivo',
    'agressiva',
    'impulsivo',
    'impulsiva',
    'falta de esperança',
    'desesperança',
    'sem futuro',
    'sem motivo',
    'sem razão',
    'pesadelos',
    'insônia',
    'sono',
    'cansaço',
    'cansada',
    'fadiga',
    'vazio',
    'vazia',
    'nada importa',
    'nada funciona',
    'tudo errado',
    'sempre piora',
    'nunca melhora',
    'sem saída',
    'preso',
    'presa',
    'armadilha',
  ];

  /**
   * Detecta risco baseado em keywords locais (não depende de IA)
   *
   * @param text - Texto do relato do paciente
   * @returns Tipo de risco detectado
   */
  static detectLocalRisk(text: string): 'critical' | 'high' | 'low' | 'none' {
    if (!text) return 'none';

    const lower = text.toLowerCase();

    // Buscar keywords críticas
    for (const keyword of this.CRITICAL_KEYWORDS) {
      if (lower.includes(keyword)) {
        return 'critical';
      }
    }

    // Buscar keywords altas
    for (const keyword of this.HIGH_KEYWORDS) {
      if (lower.includes(keyword)) {
        return 'high';
      }
    }

    return 'none';
  }

  /**
   * Detecta sinais de engajamento (humores + presença)
   * Não é diagnóstico; é sinal para revisão profissional
   */
  static detectEngagementSignals(patientData: {
    recentMood?: number;
    sessionAbsenceDays?: number;
    participationRate?: number;
    lastUpdate?: Date;
  }): EngagementSignal[] {
    const signals: EngagementSignal[] = [];

    const mood = patientData.recentMood ?? 5;
    const absenceDays = patientData.sessionAbsenceDays ?? 0;
    const participationRate = patientData.participationRate ?? 50;

    // Sinal: Humor reduzido + ausências recentes
    if (mood < 2 && absenceDays > 7) {
      signals.push({
        type: 'low_engagement',
        labels: ['Humor reduzido', 'Ausências recentes'],
        suggestedReview: 'Verificar bem-estar e barreiras de participação',
        clinicalNote:
          'Combinação de humor baixo e ausências pode indicar desafios na participação. Avaliação profissional recomendada.',
        confidence: 85,
        requiresProfessionalReview: true,
      });
    }

    // Sinal: Gap de participação
    if (absenceDays > 15) {
      signals.push({
        type: 'participation_gap',
        labels: ['Engajamento reduzido'],
        suggestedReview: 'Revisar motivos da ausência e revisar plano de cuidado',
        clinicalNote:
          'Padrão de presença pode indicar necessidade de revisão do plano de cuidado ou mudança de contexto.',
        confidence: 70,
        requiresProfessionalReview: true,
      });
    }

    // Sinal: Taxa de participação muito baixa
    if (participationRate < 25 && absenceDays > 5) {
      signals.push({
        type: 'behavioral_change',
        labels: ['Mudança comportamental'],
        suggestedReview:
          'Contatar paciente para verificar situação, saúde e necessidades',
        clinicalNote:
          'Redução significativa na participação pode indicar mudanças na situação de saúde ou contexto social.',
        confidence: 60,
        requiresProfessionalReview: true,
      });
    }

    return signals;
  }

  /**
   * Combina análise local + IA em resultado final
   *
   * Se IA falhou: usa detecção local
   * Se ambas disponíveis: prioriza maior risco
   */
  static combineAnalysis(
    aiAnalysis: CombinedAnalysis | null,
    localRiskLevel: 'critical' | 'high' | 'low' | 'none'
  ): CombinedAnalysis {
    // Se IA falhou completamente, usar apenas local
    if (!aiAnalysis) {
      return {
        riskFlag: localRiskLevel === 'critical' || localRiskLevel === 'high',
        urgencyLevel: this.riskLevelToUrgency(localRiskLevel),
        source: 'local_keywords',
        signals: this.riskLevelToSignals(localRiskLevel),
        aiAnalysis: null,
        lastUpdated: new Date(),
        disclaimer: this.getDisclaimer('local_keywords'),
      };
    }

    // Se ambas disponíveis, priorizar maior risco
    const finalRisk = this.maxRiskLevel(aiAnalysis.urgencyLevel, localRiskLevel);

    return {
      riskFlag: finalRisk !== 'none' && finalRisk !== 'low',
      urgencyLevel: finalRisk,
      source: 'combined',
      signals: [
        ...(aiAnalysis.signals || []),
        ...this.riskLevelToSignals(localRiskLevel),
      ],
      aiAnalysis,
      lastUpdated: new Date(),
      disclaimer: this.getDisclaimer('combined'),
    };
  }

  /**
   * Converte urgency em sinal de engajamento
   */
  private static riskLevelToSignals(
    level: 'critical' | 'high' | 'low' | 'none'
  ): EngagementSignal[] {
    if (level === 'critical') {
      return [
        {
          type: 'crisis_indicator',
          labels: ['Indicador de crise'],
          suggestedReview:
            'Contato urgente com profissional. Considere intervenção de crise.',
          clinicalNote:
            'Palavras-chave críticas detectadas. Requer avaliação profissional IMEDIATA.',
          confidence: 100,
          requiresProfessionalReview: true,
        },
      ];
    }

    if (level === 'high') {
      return [
        {
          type: 'behavioral_change',
          labels: ['Sinais relevantes detectados'],
          suggestedReview:
            'Revisão profissional para decisão clínica apropriada',
          clinicalNote:
            'Palavras-chave de risco detectadas. Avaliação profissional recomendada.',
          confidence: 80,
          requiresProfessionalReview: true,
        },
      ];
    }

    return [];
  }

  /**
   * Converte risco para urgência
   */
  private static riskLevelToUrgency(
    level: 'critical' | 'high' | 'low' | 'none'
  ): UrgencyLevel {
    const mapping: Record<string, UrgencyLevel> = {
      critical: 'critical',
      high: 'high',
      low: 'low',
      none: 'none',
    };
    return mapping[level] || 'unknown';
  }

  /**
   * Calcula o maior nível de risco entre dois
   */
  private static maxRiskLevel(
    aiLevel: UrgencyLevel,
    localLevel: 'critical' | 'high' | 'low' | 'none'
  ): UrgencyLevel {
    const levels: Record<UrgencyLevel | string, number> = {
      none: 0,
      low: 1,
      high: 2,
      critical: 3,
      unknown: 2, // Trata unknown como high para segurança
    };

    const aiScore = levels[aiLevel] || 2;
    const localScore = levels[localLevel] || 0;

    if (Math.max(aiScore, localScore) === 3) return 'critical';
    if (Math.max(aiScore, localScore) === 2) return 'high';
    if (Math.max(aiScore, localScore) === 1) return 'low';
    return 'none';
  }

  /**
   * Gera disclaimer apropriado baseado na fonte
   */
  private static getDisclaimer(source: 'local_keywords' | 'ai' | 'combined'): string {
    const base =
      '⚠️ Esta análise é fornecida como assistência à decisão profissional, NÃO como diagnóstico clínico.';

    const additions: Record<string, string> = {
      local_keywords:
        ' Baseada em padrões de texto. Sempre consulte um profissional de saúde.',
      ai:
        ' Análise assistida por IA. A responsabilidade clínica permanece com o profissional.',
      combined:
        ' Combinação de múltiplas fontes. Decisões clínicas devem ser tomadas por profissional qualificado.',
    };

    return `${base}${additions[source]}`;
  }
}
