import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { TobaccoAnamnesis, DependenceLevel } from '../types/protocols/tobacco';

export interface TobaccoGroupStats {
    totalPatients: number;
    averageDependenceScore: number;
    dependenceLevels: { name: string; value: number; color: string }[];
    successRate: number; // Placeholder for future logic
}

export const tobaccoService = {
    /**
     * Fetches all tobacco anamnesis records for a specific group of patients.
     * In a real scenario, we might filter by groupId if the anamnesis is linked to a group,
     * or we fetch by a list of patient IDs.
     */
    getGroupInsights: async (patientIds: string[]): Promise<TobaccoGroupStats> => {
        try {
            const anamnesisRef = collection(db, 'tobacco_anamnesis');
            let q;

            if (patientIds.includes('ALL')) {
                q = query(anamnesisRef, orderBy('createdAt', 'desc'));
            } else if (patientIds.length > 0) {
                // Firestore 'in' query is limited to 10 items. For now, we'll fetch all and filter in memory if list is long,
                // or just fetch all if list is empty.
                // Optimally: q = query(anamnesisRef, where('patientId', 'in', patientIds));
                q = query(anamnesisRef, orderBy('createdAt', 'desc'));
            } else {
                return {
                    totalPatients: 0,
                    averageDependenceScore: 0,
                    dependenceLevels: [],
                    successRate: 0
                };
            }

            const snapshot = await getDocs(q);
            let anamneses = snapshot.docs.map(doc => doc.data() as TobaccoAnamnesis);

            // Filter in memory if we have specific patient IDs and didn't use 'in' query
            if (!patientIds.includes('ALL') && patientIds.length > 0) {
                anamneses = anamneses.filter(a => patientIds.includes(a.patientId));
            }

            const totalPatients = anamneses.length;

            if (totalPatients === 0) {
                return {
                    totalPatients: 0,
                    averageDependenceScore: 0,
                    dependenceLevels: [],
                    successRate: 0
                };
            }

            // Calculate Average Dependence Score
            const totalScore = anamneses.reduce((sum, a) => sum + a.fagerstrom.score, 0);
            const averageDependenceScore = Number((totalScore / totalPatients).toFixed(1));

            // Calculate distribution
            const levels: Record<DependenceLevel, number> = {
                'Muito Baixo': 0,
                'Baixo': 0,
                'Médio': 0,
                'Elevado': 0,
                'Muito Elevado': 0
            };

            anamneses.forEach(a => {
                if (levels[a.fagerstrom.dependenceLevel] !== undefined) {
                    levels[a.fagerstrom.dependenceLevel]++;
                }
            });

            const dependenceLevels = [
                { name: 'Muito Baixo', value: levels['Muito Baixo'], color: '#4ADE80' },
                { name: 'Baixo', value: levels['Baixo'], color: '#60A5FA' },
                { name: 'Médio', value: levels['Médio'], color: '#FBBF24' },
                { name: 'Elevado', value: levels['Elevado'], color: '#F87171' },
                { name: 'Muito Elevado', value: levels['Muito Elevado'], color: '#EF4444' }
            ].filter(l => l.value > 0);

            return {
                totalPatients,
                averageDependenceScore,
                dependenceLevels,
                successRate: 0 // Logic for success rate would require longitudinal data (multiple anamneses per patient)
            };
        } catch (error) {
            console.error('Error fetching tobacco insights:', error);
            return {
                totalPatients: 0,
                averageDependenceScore: 0,
                dependenceLevels: [],
                successRate: 0
            };
        }
    }
};
