/**
 * Componente: Suporte em Crise
 * P2.2: Sempre visível e acessível
 *
 * Exibe botões permanentes de ajuda:
 * - CVV 188
 * - SAMU 192
 * - Polícia 190
 *
 * Deve estar presente em:
 * - Dashboard do paciente
 * - MoodTracker
 * - Qualquer página sensível de saúde mental
 */

import React, { useState } from 'react';

interface CrisisSupportProps {
  variant?: 'banner' | 'widget' | 'compact';
  className?: string;
}

export function CrisisSupport({
  variant = 'banner',
  className = '',
}: CrisisSupportProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition ${className}`}
      >
        {isExpanded ? '✕' : '🆘'} Ajuda Agora
      </button>
    );
  }

  if (variant === 'widget') {
    return (
      <div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <div className="bg-white rounded-lg shadow-xl border-2 border-red-500 p-4 max-w-sm">
          <h3 className="font-bold text-red-700 mb-3 text-lg">🆘 Precisa de Ajuda?</h3>

          <p className="text-sm text-gray-700 mb-4">
            Você não está sozinho. Existem profissionais prontos para ajudar.
          </p>

          <div className="space-y-2">
            <CrisisButton
              number="188"
              label="CVV - Centro de Valorização da Vida"
              description="Atendimento 24h para pessoas em crise emocional"
            />

            <CrisisButton
              number="192"
              label="SAMU - Emergência Médica"
              description="Para emergências de saúde"
            />

            <CrisisButton
              number="190"
              label="Polícia"
              description="Se você está em perigo imediato"
            />
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Ou converse com um profissional em sua unidade de saúde
          </p>
        </div>
      </div>
    );
  }

  // Banner (padrão)
  return (
    <div
      className={`bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🆘</span>
          <div>
            <h3 className="font-bold text-lg">Precisando de ajuda agora?</h3>
            <p className="text-sm opacity-90">Você nunca está sozinho. Existem profissionais prontos para ajudar.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-max">
          <CrisisButton
            number="188"
            label="CVV"
            compact={true}
          />
          <CrisisButton
            number="192"
            label="SAMU"
            compact={true}
          />
          <CrisisButton
            number="190"
            label="Polícia"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Botão individual de crise
 */
interface CrisisButtonProps {
  number: string;
  label: string;
  description?: string;
  compact?: boolean;
}

function CrisisButton({
  number,
  label,
  description,
  compact = false,
}: CrisisButtonProps) {
  if (compact) {
    return (
      <a
        href={`tel:${number}`}
        className="inline-block px-4 py-2 bg-white text-red-600 font-bold rounded hover:bg-gray-100 transition text-sm whitespace-nowrap"
      >
        {label}: <span className="text-lg">{number}</span>
      </a>
    );
  }

  return (
    <a
      href={`tel:${number}`}
      className="flex items-center gap-3 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition"
    >
      <div className="flex-1">
        <p className="font-bold text-lg">{number}</p>
        <p className="text-sm opacity-90">{label}</p>
        {description && <p className="text-xs opacity-75">{description}</p>}
      </div>
      <span className="text-xl">→</span>
    </a>
  );
}

export default CrisisSupport;
