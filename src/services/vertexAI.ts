
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { db } from "./firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GOOGLE_GEN_AI_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Models
const modelFast = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const modelPro = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: { responseMimeType: "application/json" } // For structured output
});

interface DailyMessageParams {
    patientName: string;
    groupTheme: string;
    moodLog: string; // "happy", "sad", etc.
}

interface ClinicalReportParams {
    technicalReport: string;
}

interface RiskAnalysisParams {
    patientData: any;
    attendanceRecords: any[];
    distanceKm: number;
    notes: string;
}

export const AIService = {

    /**
     * AGENTE 1: O Acolhedor
     * Generates a short, empathetic daily message.
     * Caches messages in Firestore to save tokens/costs.
     */
    async generateDailySupportMessage({ patientName, groupTheme, moodLog }: DailyMessageParams): Promise<string> {
        if (!API_KEY) return `Olá ${patientName}, que bom ter você aqui! Lembre-se de cuidar de si hoje.`;

        try {
            // 1. Check Cache in Firestore
            const messagesRef = collection(db, 'daily_messages');
            const q = query(
                messagesRef,
                where('theme', '==', groupTheme),
                where('mood', '==', moodLog),
                limit(20) // Get a pool to pick randomly
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Return a random stored message
                const randomIndex = Math.floor(Math.random() * snapshot.docs.length);
                const msg = snapshot.docs[randomIndex].data().message;
                return msg.replace('{NAME}', patientName);
            }

            // 2. Generate New Message if cache miss
            const prompt = `
                Você é um assistente de saúde mental empático e acolhedor baseada em TCC e Gestalt. 
                Gere uma mensagem curta (max 2 frases), motivadora e personalizada para o paciente {NAME} que participa do grupo sobre ${groupTheme}. 
                Se o humor dele ontem foi ${moodLog}, adapte o tom. 
                NÃO dê conselhos médicos. Foco no acolhimento. 
                Aponte os avisos de notificações do sistema também e avisos importantes de saude mental.
                Retorne apenas o texto da mensagem. Use {NAME} como placeholder para o nome.
            `;

            const result = await modelFast.generateContent(prompt);
            const text = result.response.text().trim();

            // 3. Save to Cache (Async, don't await blocking)
            addDoc(messagesRef, {
                theme: groupTheme,
                mood: moodLog,
                message: text,
                createdAt: serverTimestamp()
            }).catch(e => console.error("Error caching message:", e));

            return text.replace('{NAME}', patientName);

        } catch (error) {
            console.error("AI Service Error (Daily Message):", error);
            return `Olá ${patientName}, estamos com você nessa jornada!`;
        }
    },

    /**
     * AGENTE 2: O Tradutor
     * Simplifies technical reports for patients.
     */
    async humanizeClinicalReport({ technicalReport }: ClinicalReportParams): Promise<string> {
        if (!API_KEY) return technicalReport;

        try {
            const prompt = `
                Traduza o seguinte relatório clínico técnico para uma linguagem simples, encorajadora e fácil de entender para o paciente. 
                Explique termos difíceis. Mantenha um tom de parceria. 
                Exemplo: Em vez de 'Evolução favorável', diga 'Vimos um ótimo progresso'.
                
                Relatório Técnico: "${technicalReport}"
            `;

            const result = await modelFast.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("AI Service Error (Translator):", error);
            return technicalReport;
        }
    },

    /**
     * AGENTE 3: O Sentinela & Codificador
     * Professional tool for Risk Analysis and CID suggestion.
     * Returns structured JSON.
     */
    async analyzeRiskAndCoding({ patientData, attendanceRecords, distanceKm, notes }: RiskAnalysisParams): Promise<{
        riskScore: number;
        suggestedCID: string;
        tfdAlert: boolean;
        reasoning: string;
    }> {
        if (!API_KEY) {
            return { riskScore: 0, suggestedCID: "N/A", tfdAlert: false, reasoning: "API Key missing." };
        }

        try {
            const prompt = `
                Atue como Auditor Clínico do SUS. Analise os dados do paciente:
                - Nome: ${patientData.name}
                - Distância da Unidade: ${distanceKm} km
                - Frequência Recente: ${JSON.stringify(attendanceRecords)}
                - Anotações Clínicas: "${notes}"

                Tarefas:
                1. Calcule o Risco de Abandono (0-100%) baseado na frequência e distância.
                2. Sugira o CID-10 mais provável baseado nas anotações.
                3. Identifique se há critérios para TFD (Tratamento Fora de Domicílio, geralmente > 50km).
                
                Retorne APENAS um JSON com este formato: 
                { "riskScore": number, "suggestedCID": string, "tfdAlert": boolean, "reasoning": string }
            `;

            const result = await modelPro.generateContent(prompt);
            const text = result.response.text();

            // JSON parsing is handled by the model's responseMimeType config, but we parse explicitly to be safe
            return JSON.parse(text);

        } catch (error) {
            console.error("AI Service Error (Risk Analysis):", error);
            return {
                riskScore: 0,
                suggestedCID: "Erro",
                tfdAlert: false,
                reasoning: "Falha na análise de IA."
            };
        }
    }
};
