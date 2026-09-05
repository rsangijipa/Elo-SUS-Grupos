export interface Challenge {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    type: 'tcc' | 'mindfulness' | 'social' | 'physical';
}

export const WEEKLY_CHALLENGES: Challenge[] = [
    {
        id: 'mindfulness-water',
        title: 'Hidratação Consciente',
        description: 'Beba um copo de água prestando atenção em cada gole, na temperatura e na sensação.',
        xpReward: 50,
        type: 'mindfulness'
    },
    {
        id: 'tcc-gratitude',
        title: 'Três Coisas Boas',
        description: 'Identifique 3 coisas pequenas que foram boas no seu dia até agora.',
        xpReward: 60,
        type: 'tcc'
    },
    {
        id: 'social-hello',
        title: 'Conexão Simples',
        description: 'Dê um "bom dia" ou "olá" genuíno para alguém hoje (pode ser online).',
        xpReward: 40,
        type: 'social'
    },
    {
        id: 'physical-stretch',
        title: 'Alongamento Rápido',
        description: 'Faça um alongamento simples de 2 minutos para soltar os ombros e pescoço.',
        xpReward: 50,
        type: 'physical'
    },
    {
        id: 'mindfulness-breath',
        title: 'Respiração 4-7-8',
        description: 'Faça 3 ciclos de respiração: inspire (4s), segure (7s), expire (8s).',
        xpReward: 70,
        type: 'mindfulness'
    },
    {
        id: 'tcc-thought',
        title: 'Detetive do Pensamento',
        description: 'Identifique um pensamento negativo hoje e pergunte: "Isso é 100% verdade?"',
        xpReward: 80,
        type: 'tcc'
    },
    {
        id: 'self-care-break',
        title: 'Pausa Digital',
        description: 'Fique 15 minutos longe de qualquer tela (celular, TV, computador).',
        xpReward: 100,
        type: 'mindfulness'
    }
];
