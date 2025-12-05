import { DischargeType } from '../types/shared';

export interface ReplacementData {
    NOME_PACIENTE: string;
    NOME_GRUPO: string;
    UBS_ORIGEM: string;
    DESTINO_SUGERIDO?: string; // Obrigatório se REFERRAL
    MOTIVO_ALTA?: string; // Texto livre adicional ou resumido
}

const TEMPLATES: Record<DischargeType, string> = {
    IMPROVEMENT:
        "O(A) paciente {NOME_PACIENTE} concluiu o ciclo terapêutico do grupo '{NOME_GRUPO}' com boa adesão e melhora clínica significativa. Recebe alta deste dispositivo, mantendo-se vinculado à sua Unidade de Origem ({UBS_ORIGEM}) para seguimento longitudinal na Atenção Primária. Orientado sobre sinais de alerta e retorno se necessário.",

    REFERRAL:
        "O(A) paciente {NOME_PACIENTE} finalizou participação no grupo '{NOME_GRUPO}'. Devido à complexidade do quadro ou necessidade de intervenção específica, sugiro regulação para {DESTINO_SUGERIDO}. O caso requer intensificação do cuidado não disponível neste dispositivo grupal no momento.",

    ABANDONMENT:
        "O(A) paciente {NOME_PACIENTE} apresentou baixa frequência no grupo '{NOME_GRUPO}', caracterizando abandono do tratamento proposto. Solicito busca ativa pela equipe da {UBS_ORIGEM} para reavaliação do vínculo e das necessidades de saúde.",

    SHARED_CARE:
        "O(A) paciente {NOME_PACIENTE} mantém participação no grupo '{NOME_GRUPO}', mas necessita de acompanhamento compartilhado com a {UBS_ORIGEM} para monitoramento clínico (ex: pressão arterial, glicemia, renovação de receitas). O cuidado deve ser integrado para garantir a integralidade da assistência."
};

export const getDischargeText = (type: DischargeType, data: ReplacementData): string => {
    let template = TEMPLATES[type];

    // Substituições Básicas
    template = template.replace(/{NOME_PACIENTE}/g, data.NOME_PACIENTE);
    template = template.replace(/{NOME_GRUPO}/g, data.NOME_GRUPO);
    template = template.replace(/{UBS_ORIGEM}/g, data.UBS_ORIGEM || "UBS de Referência");

    // Substituições Condicionais
    if (type === 'REFERRAL') {
        const destino = data.DESTINO_SUGERIDO || "[INSERIR DESTINO ACIMA]";
        template = template.replace(/{DESTINO_SUGERIDO}/g, destino);
    }

    return template;
};
