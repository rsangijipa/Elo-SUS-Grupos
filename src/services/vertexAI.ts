
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GEN_AI_KEY;

// Initialize Google AI (Web Compatible SDK)
// Note: We use @google/generative-ai because @google-cloud/vertexai is Node.js only and does not work in Vite/Browser environments.
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Fallback Messages
const FALLBACK_MESSAGES = {
    SUPPORT: "Hoje é um ótimo dia para cuidar de si mesmo. Lembre-se de respirar fundo e dar um passo de cada vez.",
    RISK: { riskLevel: 'LOW', tfdEligible: false, suggestedCID: 'Z00.0', reasoning: 'Análise indisponível no momento.' },
    REPORT: "Relatório indisponível para simplificação no momento. Consulte seu médico para mais detalhes."
};

export const AIService = {
    /**
     * Função A: O Acolhedor
     * Gera mensagem acolhedora para o dashboard do paciente.
     */
    async generateDailySupportMessage(patientName: string, mood: string, lastGroupTheme: string): Promise<string> {
        if (!API_KEY) return FALLBACK_MESSAGES.SUPPORT;

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: "Você é um psicólogo especialista em TCC e Humanização no SUS. Gere uma mensagem curta (max 250 caracteres), motivadora e pessoal. Use o nome do paciente. Valide o sentimento dele. Conecte levemente ao tema do último grupo. Tom: Empático, seguro, sem dar conselhos médicos diretos."
            });

            const prompt = `Paciente: ${patientName}. Sentimento: ${mood}. Tema do Último Grupo: ${lastGroupTheme}.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Agent 'Acolhedor' failed:", error);
            return FALLBACK_MESSAGES.SUPPORT;
        }
    },

    /**
     * Função B: O Auditor de Regulação
     * Análise de risco para o dashboard do profissional.
     */
    async analyzeClinicalRisk(patientData: any, distanceKm: number): Promise<{ riskLevel: 'LOW' | 'MEDIUM' | 'HIGH', tfdEligible: boolean, suggestedCID: string, reasoning: string }> {
        if (!API_KEY) return FALLBACK_MESSAGES.RISK as any;

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                systemInstruction: "Atue como Auditor de Regulação do SUS. Analise os dados do paciente.\n1. Verifique risco de evasão baseado na distância e frequência.\n2. Verifique elegibilidade para TFD (Tratamento Fora de Domicílio) se a distância > 50km.\n3. Sugira CID-10 baseado nas notas clínicas.\nRetorne JSON estrito: { riskLevel: 'LOW'|'MEDIUM'|'HIGH', tfdEligible: boolean, suggestedCID: string, reasoning: string }.",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            riskLevel: { type: SchemaType.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                            tfdEligible: { type: SchemaType.BOOLEAN },
                            suggestedCID: { type: SchemaType.STRING },
                            reasoning: { type: SchemaType.STRING },
                        },
                        required: ["riskLevel", "tfdEligible", "suggestedCID", "reasoning"]
                    }
                }
            });

            const prompt = `Dados do Paciente: ${JSON.stringify(patientData)}. Distância da Unidade: ${distanceKm}km.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error("AI Agent 'Auditor' failed:", error);
            return FALLBACK_MESSAGES.RISK as any;
        }
    },

    /**
     * Função C: O Tradutor (Humanizador)
     * Traduz "medicês" para o paciente ler.
     */
    async humanizeReport(technicalText: string): Promise<string> {
        if (!API_KEY) return technicalText; // Fallback to original text

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: "Reescreva o seguinte relatório clínico técnico em linguagem simples, encorajadora e clara (Nível de leitura: Ensino Fundamental). Foco nos progressos e próximos passos. Evite jargões."
            });

            const prompt = `Texto Técnico: "${technicalText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Agent 'Tradutor' failed:", error);
            return FALLBACK_MESSAGES.REPORT;
        }
    }
};
