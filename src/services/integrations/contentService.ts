export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    videoId: string; // YouTube ID
    duration: string;
}

export interface Material {
    id: string | number;
    title: string;
    description?: string;
    type: string;
    date?: string;
    url: string;
    category?: string;
}

export interface ClinicalDocument {
    id: string;
    title: string;
    type: 'laudo' | 'encaminhamento' | 'receita';
    date: string;
    doctorName: string;
    specialty: string;
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

export const materialsData: Material[] = [
    {
        id: 1,
        title: "Programa Nacional de Controle do Tabagismo",
        description: "Diretrizes oficiais e informações sobre o tratamento no SUS.",
        type: "PDF",
        date: "2024",
        url: "https://www.gov.br/saude/pt-br/composicao/saes/dapes/doencas-cronicas-nao-transmissiveis/tabagismo/publicacoes/pcdt_tabagismo.pdf",
        category: "institucional"
    },
    {
        id: 2,
        title: "Cartilha: Deixando de Fumar sem Mistérios",
        description: "Manual do participante com estratégias práticas.",
        type: "PDF",
        date: "Material de Apoio",
        url: "https://bvsms.saude.gov.br/bvs/publicacoes/deixando_fumar_sem_misterios_manual_participante.pdf",
        category: "educativo"
    },
    {
        id: 3,
        title: "Diário de Gatilhos e Emoções",
        description: "Ferramenta para registro diário de ansiedade e consumo.",
        type: "DOC",
        date: "Exercício",
        url: "",
        category: "pratico"
    }
];

const CLINICAL_DOCUMENTS: ClinicalDocument[] = [
    {
        id: 'd1',
        title: 'Encaminhamento Psiquiatria',
        type: 'encaminhamento',
        date: '2023-10-15',
        doctorName: 'Dr. João Silva',
        specialty: 'Psicologia'
    },
    {
        id: 'd2',
        title: 'Relatório de Evolução - Outubro',
        type: 'laudo',
        date: '2023-10-30',
        doctorName: 'Dr. João Silva',
        specialty: 'Psicologia'
    }
];

export const contentService = {
    getVideos: (): Promise<Video[]> => {
        // Simulate async call
        return Promise.resolve(RECOMMENDED_VIDEOS);
    },

    getMaterials: (): Promise<Material[]> => {
        return Promise.resolve(materialsData);
    },

    getClinicalDocuments: (): Promise<ClinicalDocument[]> => {
        return Promise.resolve(CLINICAL_DOCUMENTS);
    }
};
