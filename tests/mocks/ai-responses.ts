export const createGoogleMockResponse = (text: string) => ({
    candidates: [{
        content: { parts: [{ text }] },
        finishReason: "STOP",
        index: 0
    }]
});

export const mockAiResponses = {
    analyzeClinicalRisk: {
        riskLevel: "high",
        riskScore: 85,
        reasoning: "Paciente reside em área de difícil acesso e apresenta histórico de faltas consecutivas. Sintomas de isolamento social identificados em relatos recentes.",
        suggestedCID: "F41.1 (Ansiedade Generalizada)",
        tfdAlert: true
    },
    humanizeReport: {
        simplifiedText: "O paciente relatou sentir-se muito desanimado e com dificuldades para dormir. Não tem tido vontade de interagir com outras pessoas. No entanto, não apresenta risco imediato à própria vida. Foi encaminhado para terapia especializada."
    },
    generateDailySupportMessage: {
        text: "Bom dia, João! Lembre-se que cada pequeno passo conta na sua jornada de autocuidado. Estamos aqui com você."
    }
};
