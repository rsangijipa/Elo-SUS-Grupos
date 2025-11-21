export type GroupType =
    | 'tabagismo'
    | 'gestantes'
    | 'familiares_TEA'
    | 'ansiedade'
    | 'depressao'
    | 'adolescentes'
    | 'saude_mental_geral'
    | 'outros';

export const GROUP_TYPES: { [key in GroupType]: string } = {
    tabagismo: 'Tabagismo',
    gestantes: 'Gestantes',
    familiares_TEA: 'Familiares de TEA',
    ansiedade: 'Ansiedade',
    depressao: 'Depressão',
    adolescentes: 'Adolescentes',
    saude_mental_geral: 'Saúde Mental Geral',
    outros: 'Outros'
};

export interface Group {
    id?: string;
    titulo: string;
    tipoGrupo: GroupType;
    descricao: string;
    unidadeSaudeId: string;
    terapeutaResponsavelId: string;
    capacidadeMaxima: number;
    publicoAlvo: string;
    dataInicio: string; // YYYY-MM-DD
    dataFimPrevista?: string;
    periodicidade: 'semanal' | 'quinzenal' | 'mensal';
    diaSemanaPadrao: number; // 0-6
    horarioInicioPadrao: string; // HH:mm
    duracaoMinutos: number;
    camposEspecificos?: Record<string, any>;
    ativo: boolean;
    createdAt?: any;
    updatedAt?: any;
}
