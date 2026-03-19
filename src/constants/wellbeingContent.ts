/**
 * Conteúdo curado de saúde mental e bem-estar do SUS.
 * Substitui a dependência de uma coleção 'news' no Firestore
 * por dados estáticos reais, com fontes verificáveis.
 */

export interface WellbeingArticle {
    id: string;
    title: string;
    summary: string;
    category: 'respiracao' | 'mindfulness' | 'sono' | 'atividade' | 'nutricao' | 'vinculo';
    audience: 'patient' | 'professional' | 'both';
    source: string;
    url: string;
    icon: string;
    readTimeMin: number;
}

export const WELLBEING_CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
    respiracao: { label: 'Respiração', color: 'text-cyan-700', bg: 'bg-cyan-50' },
    mindfulness: { label: 'Mindfulness', color: 'text-purple-700', bg: 'bg-purple-50' },
    sono: { label: 'Sono', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    atividade: { label: 'Atividade Física', color: 'text-green-700', bg: 'bg-green-50' },
    nutricao: { label: 'Nutrição', color: 'text-orange-700', bg: 'bg-orange-50' },
    vinculo: { label: 'Vínculos', color: 'text-pink-700', bg: 'bg-pink-50' },
};

export const WELLBEING_CONTENT: WellbeingArticle[] = [
    // ——— Respiração ———
    {
        id: 'resp-1',
        title: 'Respiração Diafragmática: Técnica 4-7-8',
        summary: 'Inspire por 4 segundos, segure por 7 e expire por 8. Essa técnica ativa o sistema nervoso parassimpático, reduzindo ansiedade e frequência cardíaca. Recomendada pela OMS para manejo de estresse crônico.',
        category: 'respiracao',
        audience: 'both',
        source: 'Ministério da Saúde — PICS',
        url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/p/praticas-integrativas',
        icon: '🫁',
        readTimeMin: 3,
    },
    {
        id: 'resp-2',
        title: 'Respiração Quadrada (Box Breathing)',
        summary: 'Inspire por 4s, segure 4s, expire 4s, segure 4s. Utilizada por militares e socorristas para manter a calma em situações de alta pressão. Ideal para momentos antes de sessões terapêuticas.',
        category: 'respiracao',
        audience: 'both',
        source: 'Harvard Medical School',
        url: 'https://www.health.harvard.edu/mind-and-mood/relaxation-techniques-breath-control-helps-quell-errant-stress-response',
        icon: '🔲',
        readTimeMin: 2,
    },

    // ——— Mindfulness ———
    {
        id: 'mind-1',
        title: 'Escaneamento Corporal (Body Scan)',
        summary: 'Técnica de atenção plena que consiste em observar cada parte do corpo, dos pés à cabeça, notando sensações sem julgamento. Reduz tensão muscular e melhora a consciência interoceptiva.',
        category: 'mindfulness',
        audience: 'patient',
        source: 'OPAS/OMS — Guia mhGAP',
        url: 'https://www.paho.org/pt/topicos/saude-mental',
        icon: '🧘',
        readTimeMin: 5,
    },
    {
        id: 'mind-2',
        title: 'Técnica 5-4-3-2-1 para Ansiedade',
        summary: 'Identifique 5 coisas que você vê, 4 que pode tocar, 3 sons, 2 cheiros e 1 sabor. Essa técnica de grounding ajuda a interromper crises de ansiedade ao ancorar a atenção no presente.',
        category: 'mindfulness',
        audience: 'both',
        source: 'Cadernos de Atenção Básica — MS',
        url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_34_saude_mental.pdf',
        icon: '✋',
        readTimeMin: 3,
    },

    // ——— Sono ———
    {
        id: 'sono-1',
        title: 'Higiene do Sono: 7 Regras de Ouro',
        summary: '1) Horário fixo para dormir. 2) Sem telas 1h antes. 3) Ambiente escuro e fresco. 4) Evitar cafeína após 14h. 5) Exercício regular, mas não à noite. 6) Rotina de relaxamento. 7) Cama apenas para dormir.',
        category: 'sono',
        audience: 'patient',
        source: 'ABSono — Associação Brasileira do Sono',
        url: 'https://www.absono.com.br/',
        icon: '😴',
        readTimeMin: 4,
    },
    {
        id: 'sono-2',
        title: 'Insônia e Saúde Mental: O Ciclo Vicioso',
        summary: 'Evidências mostram que insônia crônica aumenta em 2x o risco de depressão. A Terapia Cognitivo-Comportamental para Insônia (TCC-I) é considerada primeira linha de tratamento, mesmo antes de medicamentos.',
        category: 'sono',
        audience: 'professional',
        source: 'Revista Brasileira de Psiquiatria',
        url: 'https://www.scielo.br/j/rbp/',
        icon: '🌙',
        readTimeMin: 6,
    },

    // ——— Atividade Física ———
    {
        id: 'atv-1',
        title: 'Caminhada de 30 Minutos: Antidepressivo Natural',
        summary: 'Meta-análises confirmam que 150 minutos semanais de atividade moderada (ex: caminhada rápida) reduzem sintomas de depressão leve em até 30%. A liberação de BDNF e endorfinas melhora a neuroplasticidade.',
        category: 'atividade',
        audience: 'patient',
        source: 'Guia de Atividade Física para a População Brasileira — MS',
        url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_atividade_fisica_populacao_brasileira.pdf',
        icon: '🚶',
        readTimeMin: 4,
    },
    {
        id: 'atv-2',
        title: 'Práticas Corporais em Grupo no SUS',
        summary: 'O SUS oferece práticas integrativas como Yoga, Tai-Chi e Lian Gong gratuitamente nas UBS. Essas atividades em grupo combinam movimento físico com socialização, ambos protetores contra a depressão.',
        category: 'atividade',
        audience: 'both',
        source: 'Política Nacional de PICS — MS',
        url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/p/praticas-integrativas',
        icon: '🧎',
        readTimeMin: 3,
    },

    // ——— Nutrição ———
    {
        id: 'nut-1',
        title: 'Alimentos que Ajudam na Ansiedade',
        summary: 'Alimentos ricos em magnésio (banana, espinafre, castanha), ômega-3 (sardinha, linhaça) e triptofano (aveia, leite) contribuem para a produção de serotonina. Evite excesso de cafeína, álcool e ultraprocessados.',
        category: 'nutricao',
        audience: 'patient',
        source: 'Guia Alimentar para a População Brasileira — MS',
        url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_populacao_brasileira_2ed.pdf',
        icon: '🥗',
        readTimeMin: 4,
    },

    // ——— Vínculos ———
    {
        id: 'vinc-1',
        title: 'O Poder do Grupo Terapêutico',
        summary: 'Pesquisas de Yalom demonstram que grupos terapêuticos oferecem fatores curativos únicos: universalidade (não estou sozinho), altruísmo (ajudar o outro cura) e esperança (outros superaram). O vínculo grupal é medicamento.',
        category: 'vinculo',
        audience: 'both',
        source: 'Psicoterapia de Grupo — Irvin D. Yalom',
        url: 'https://www.paho.org/pt/topicos/saude-mental',
        icon: '🤝',
        readTimeMin: 5,
    },
    {
        id: 'vinc-2',
        title: 'Rede de Apoio: Como Fortalecer',
        summary: 'Identifique pelo menos 3 pessoas com quem pode contar. Inclua: 1 pessoa para conversar, 1 para pedir ajuda prática e 1 para momentos de alegria. Vínculos genuínos são o maior fator de proteção em saúde mental.',
        category: 'vinculo',
        audience: 'patient',
        source: 'Cadernos de Atenção Básica — MS',
        url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_34_saude_mental.pdf',
        icon: '💙',
        readTimeMin: 3,
    },
];

/**
 * Retorna artigos filtrados por audiência e, opcionalmente, por categoria.
 */
export function getWellbeingContent(
    audience: 'patient' | 'professional',
    category?: string
): WellbeingArticle[] {
    return WELLBEING_CONTENT.filter(article => {
        const matchesAudience = article.audience === audience || article.audience === 'both';
        const matchesCategory = !category || article.category === category;
        return matchesAudience && matchesCategory;
    });
}
