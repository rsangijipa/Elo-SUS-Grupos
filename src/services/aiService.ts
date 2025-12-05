import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface MoodAnalysisResult {
    sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
    riskFlag: boolean;
    summary: string;
    suggestion: string;
}

export const aiService = {
    analyzeMoodEntry: async (text: string, currentMood: number): Promise<MoodAnalysisResult> => {
        if (!API_KEY) {
            console.warn("Gemini API Key missing");
            // Fallback mock response if no key
            return {
                sentiment: 'neutral',
                riskFlag: false,
                summary: 'Análise indisponível (Chave API ausente).',
                suggestion: 'Continue monitorando seu humor.'
            };
        }

        const prompt = `
            Atue como um psicólogo sênior. Analise o seguinte relato de diário de um paciente do SUS.
            Entrada: '${text}'
            Humor declarado (1-5): ${currentMood}
            
            Retorne APENAS um JSON (sem markdown, sem crase) com o seguinte formato:
            {
                "sentiment": "positive" | "neutral" | "negative" | "critical",
                "riskFlag": boolean (true se houver menção a morte, autolesão, abuso ou desespero extremo),
                "summary": "Uma frase curta resumindo o gatilho emocional.",
                "suggestion": "Uma sugestão curta de ação imediata (ex: respiração, ligar para alguém, dormir)."
            }
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();

            // Clean markdown if present (e.g. ```json ... ```)
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanJson) as MoodAnalysisResult;
        } catch (error) {
            console.error("Error analyzing mood with Gemini:", error);
            // Fallback on error
            return {
                sentiment: 'neutral',
                riskFlag: false,
                summary: 'Não foi possível analisar o texto no momento.',
                suggestion: 'Se precisar de ajuda, procure um profissional.'
            };
        }
    }
};
