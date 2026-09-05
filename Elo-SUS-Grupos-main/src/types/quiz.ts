export interface QuizResult {
    id?: string;
    quizId: string; // ex: 'mental-health-general-13'
    score: number; // Count of "Yes"
    totalQuestions: number;
    answers: (boolean | number)[]; // Array of answers (boolean for Yes/No, number for Scale)
    riskLevel?: 'low' | 'moderate' | 'high'; // Optional now as Self-Care uses feedback
    feedback?: string; // For Self-Care Quiz
    createdAt: unknown; // Firestore Timestamp
    suggestedReferral?: string; // ex: 'group-anxiety'
}
