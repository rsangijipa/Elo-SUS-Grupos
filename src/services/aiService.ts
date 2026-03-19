import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-2.0-flash' });
const moodCache = new Map<string, MoodAnalysisResult>();

export interface MoodAnalysisResult {
    sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
    riskFlag: boolean;
    urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'emergency';
    summary: string;
    suggestion: string;
}

const getCacheKey = (text: string, currentMood: number) => {
    const today = new Date().toISOString().split('T')[0];
    const normalizedText = text.trim().toLowerCase();
    return `${today}:${currentMood}:${normalizedText}`;
};

const fallbackResult: MoodAnalysisResult = {
    sentiment: 'neutral',
    riskFlag: false,
    urgencyLevel: 'none',
    summary: 'Nao foi possivel analisar o texto no momento.',
    suggestion: 'Se precisar de ajuda, procure um profissional da sua unidade de saude.'
};

const buildEmergencySuggestion = () => 'Procure apoio imediato: CVV 188, UPA mais proxima ou SAMU 192 se houver risco atual.';

export const aiService = {
    analyzeMoodEntry: async (text: string, currentMood: number): Promise<MoodAnalysisResult> => {
        const cacheKey = getCacheKey(text, currentMood);
        const cached = moodCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        if (!API_KEY || !model) {
            console.warn('Gemini API Key missing');
            return {
                ...fallbackResult,
                summary: 'Analise indisponivel por falta de configuracao da chave da IA.',
                suggestion: 'Continue registrando seu humor e, se precisar, fale com sua equipe de referencia.'
            };
        }

        const prompt = `
Voce atua como assistente de saude mental do SUS.
Analise o relato com linguagem acessivel, acolhedora e objetiva.
Nao use termos excessivamente tecnicos. Nao diagnostique. Nao prometa cura.

Relato do usuario: "${text}"
Humor declarado (1 a 5): ${currentMood}

Retorne APENAS um JSON valido, sem markdown, sem comentarios, com este formato exato:
{
  "sentiment": "positive" | "neutral" | "negative" | "critical",
  "riskFlag": true | false,
  "urgencyLevel": "none" | "low" | "medium" | "high" | "emergency",
  "summary": "resumo curto em portugues",
  "suggestion": "acao imediata curta em portugues"
}

Considere como emergency quando houver indicios de risco iminente, autolesao, suicidio, violencia grave ou desespero extremo.
`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();
            const cleanJson = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

            let parsed: MoodAnalysisResult;
            try {
                parsed = JSON.parse(cleanJson) as MoodAnalysisResult;
            } catch (jsonError) {
                console.error('Malformed Gemini JSON:', jsonError, cleanJson);
                return {
                    ...fallbackResult,
                    summary: 'A analise ficou indisponivel porque a resposta retornou em formato invalido.',
                    suggestion: 'Tente novamente em alguns instantes ou procure apoio profissional se precisar.'
                };
            }

            const normalized: MoodAnalysisResult = {
                sentiment: parsed.sentiment || 'neutral',
                riskFlag: Boolean(parsed.riskFlag),
                urgencyLevel: parsed.urgencyLevel || (parsed.riskFlag ? 'high' : 'none'),
                summary: parsed.summary || fallbackResult.summary,
                suggestion: parsed.suggestion || fallbackResult.suggestion
            };

            if (normalized.urgencyLevel === 'emergency') {
                normalized.riskFlag = true;
                normalized.suggestion = buildEmergencySuggestion();
            }

            moodCache.set(cacheKey, normalized);
            return normalized;
        } catch (error) {
            console.error('Error analyzing mood with Gemini:', error);
            return fallbackResult;
        }
    }
};
