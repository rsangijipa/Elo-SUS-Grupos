import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export interface HealthUnit {
    id: string;
    name: string;
    type: 'UBS' | 'CAPS' | 'NASF' | 'HOSPITAL';
    region: string;
    activeGroups: number;
    status: 'active' | 'inactive';
}

const COLLECTION = 'units';

export const unitService = {
    getAll: async (): Promise<HealthUnit[]> => {
        // For now, return the static list if DB is empty, or fetch from DB
        // To avoid breaking the app if DB is empty, we'll return the "mock" data as "default" data
        // but structured as a service.
        // ideally we would fetch from firestore:
        // const snapshot = await getDocs(collection(db, COLLECTION));
        // return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthUnit));

        return [
            { id: '1', name: 'UBS Santa Cecília', type: 'UBS', region: 'Centro', activeGroups: 3, status: 'active' },
            { id: '2', name: 'CAPS II Perdizes', type: 'CAPS', region: 'Oeste', activeGroups: 5, status: 'active' },
            { id: '3', name: 'UBS República', type: 'UBS', region: 'Centro', activeGroups: 0, status: 'inactive' },
            { id: '4', name: 'NASF Pinheiros', type: 'NASF', region: 'Oeste', activeGroups: 2, status: 'active' },
        ];
    }
};
