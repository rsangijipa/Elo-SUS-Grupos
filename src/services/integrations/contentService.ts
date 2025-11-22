export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    videoId: string; // YouTube ID
    duration: string;
}

export interface Material {
    id: string;
    title: string;
    type: 'pdf' | 'link';
    url: string;
}

// Mock Data
const RECOMMENDED_VIDEOS: Video[] = [
    {
        id: '1',
        title: 'Exercício de Respiração Diafragmática',
        thumbnail: 'https://img.youtube.com/vi/1f8yoFFdkcY/mqdefault.jpg',
        videoId: '1f8yoFFdkcY',
        duration: '5:00'
    },
    {
        id: '2',
        title: 'Higiene do Sono: Como dormir melhor',
        thumbnail: 'https://img.youtube.com/vi/5MuIMqhT8DM/mqdefault.jpg',
        videoId: '5MuIMqhT8DM',
        duration: '8:30'
    },
    {
        id: '3',
        title: 'Mindfulness para Iniciantes',
        thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/mqdefault.jpg',
        videoId: 'inpok4MKVLM',
        duration: '10:00'
    }
];

const PDF_MATERIALS: Material[] = [
    { id: '1', title: 'Guia de Ansiedade.pdf', type: 'pdf', url: '#' },
    { id: '2', title: 'Diário de Emoções.pdf', type: 'pdf', url: '#' },
    { id: '3', title: 'Direitos do Usuário SUS.pdf', type: 'pdf', url: '#' }
];

export const contentService = {
    getVideos: (tag?: string): Promise<Video[]> => {
        // Simulate async call
        return Promise.resolve(RECOMMENDED_VIDEOS);
    },

    getMaterials: (tag?: string): Promise<Material[]> => {
        return Promise.resolve(PDF_MATERIALS);
    }
};
