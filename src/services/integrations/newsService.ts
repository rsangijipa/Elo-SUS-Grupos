export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    date: string;
    audience: 'patient' | 'professional' | 'both';
    source: string;
}

const MOCK_NEWS: NewsItem[] = [
    {
        id: '1',
        title: 'Nova Nota Técnica - Grupos no CAPS',
        summary: 'Ministério da Saúde divulga novas diretrizes para grupos terapêuticos.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        date: '20/11/2025',
        audience: 'professional',
        source: 'Ministério da Saúde'
    },
    {
        id: '2',
        title: '5 Dicas para dormir melhor',
        summary: 'Pequenas mudanças na rotina que podem transformar a qualidade do seu sono.',
        imageUrl: 'https://images.unsplash.com/photo-1541781777621-af13943727dd?auto=format&fit=crop&w=800&q=80',
        date: '18/11/2025',
        audience: 'patient',
        source: 'EloSUS Bem-estar'
    },
    {
        id: '3',
        title: 'Campanha Setembro Amarelo',
        summary: 'Confira a programação de atividades nas unidades de saúde.',
        imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
        date: '01/09/2025',
        audience: 'both',
        source: 'Campanha Nacional'
    },
    {
        id: '4',
        title: 'Direitos do usuário SUS',
        summary: 'Conheça seus direitos e deveres no Sistema Único de Saúde.',
        imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
        date: '15/10/2025',
        audience: 'patient',
        source: 'Portal SUS'
    }
];

export const newsService = {
    getNews: (audience: 'patient' | 'professional'): Promise<NewsItem[]> => {
        const filtered = MOCK_NEWS.filter(n => n.audience === audience || n.audience === 'both');
        return Promise.resolve(filtered);
    }
};
