/**
 * Componente: Revisão de Engajamento
 * P2.3: Renomear de HealthRadar
 *
 * Exibe sinais de acompanhamento (NÃO diagnósticos)
 * com avisos claros de que requer avaliação profissional
 */

import React, { useState, useEffect } from 'react';
import { RiskDetectionService, type EngagementSignal } from '../../services/riskDetection';
import type { Patient } from '../../types/patient';

interface EngagementReviewProps {
  patient: Patient;
  onRequireProfessionalReview?: (signals: EngagementSignal[]) => void;
}

export function EngagementReview({
  patient,
  onRequireProfessionalReview,
}: EngagementReviewProps) {
  const [signals, setSignals] = useState<EngagementSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detectar sinais de engajamento
    const detectedSignals = RiskDetectionService.detectEngagementSignals({
      recentMood: 5, // TODO: obter do histórico de mood
      sessionAbsenceDays: 0, // TODO: calcular a partir de attendance
      participationRate: 50, // TODO: calcular
    });

    setSignals(detectedSignals);

    if (detectedSignals.some((s) => s.requiresProfessionalReview)) {
      onRequireProfessionalReview?.(detectedSignals);
    }

    setIsLoading(false);
  }, [patient, onRequireProfessionalReview]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Disclaimer Importante */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-xl">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 mb-1">Não é diagnóstico</p>
            <p className="text-sm text-amber-800">
              Esta seção exibe padrões de engajamento que podem ser úteis para a
              avaliação profissional. <strong>Sempre consulte um profissional qualificado</strong> antes de
              tomar qualquer decisão clínica.
            </p>
          </div>
        </div>
      </div>

      {/* Sinais Detectados */}
      {signals.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-xl">✅</div>
            <div>
              <p className="font-semibold text-green-900">Sem sinais especiais</p>
              <p className="text-sm text-green-800">
                Continue acompanhando o paciente regularmente.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
            <SignalCard key={signal.type} signal={signal} />
          ))}
        </div>
      )}

      {/* Link para Metodologia */}
      <div className="text-center pt-4 border-t border-gray-200">
        <a
          href="/docs/engagement-methodology"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Como interpretamos esses sinais?
        </a>
      </div>
    </div>
  );
}

/**
 * Card individual de sinal
 */
interface SignalCardProps {
  signal: EngagementSignal;
}

function SignalCard({ signal }: SignalCardProps) {
  const colors = {
    none: 'border-green-200 bg-green-50',
    low_engagement: 'border-yellow-200 bg-yellow-50',
    participation_gap: 'border-orange-200 bg-orange-50',
    behavioral_change: 'border-red-200 bg-red-50',
    crisis_indicator: 'border-red-400 bg-red-100',
  };

  const icons = {
    none: '✅',
    low_engagement: '📉',
    participation_gap: '⏸️',
    behavioral_change: '⚠️',
    crisis_indicator: '🚨',
  };

  const headingColors = {
    none: 'text-green-900',
    low_engagement: 'text-yellow-900',
    participation_gap: 'text-orange-900',
    behavioral_change: 'text-red-900',
    crisis_indicator: 'text-red-900',
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[signal.type]}`}>
      <div className="flex gap-3">
        <div className="text-2xl">{icons[signal.type]}</div>

        <div className="flex-1">
          {/* Cabeçalho */}
          <h3 className={`font-semibold ${headingColors[signal.type]} mb-2`}>
            Prioridade para Revisão: {signal.type.replace(/_/g, ' ')}
          </h3>

          {/* Nota Clínica */}
          <p className="text-sm text-gray-700 mb-3 italic">
            {signal.clinicalNote}
          </p>

          {/* Labels */}
          <div className="flex flex-wrap gap-2 mb-3">
            {signal.labels.map((label) => (
              <span
                key={label}
                className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-xs font-medium"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Confiança */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Confiança: {signal.confidence}%</div>
            <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-2">
              <div
                className="bg-gray-600 h-2 rounded-full"
                style={{ width: `${signal.confidence}%` }}
              ></div>
            </div>
          </div>

          {/* Ação Sugerida */}
          <p className="text-sm font-medium text-gray-800">
            <strong>Ação sugerida:</strong> {signal.suggestedReview}
          </p>

          {/* Alerta se requer revisão */}
          {signal.requiresProfessionalReview && (
            <p className="text-xs text-red-700 mt-2 font-semibold">
              ⚠️ Requer avaliação profissional
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EngagementReview;
