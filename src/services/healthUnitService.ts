import { collection, writeBatch, doc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { HealthUnit } from '../types/HealthUnit';

const COLLECTION_NAME = 'healthUnits';

const ARIQUEMES_UBS_DATA: Omit<HealthUnit, 'id' | 'active'>[] = [
    {
        name: 'UBS Zona Sul',
        address: 'Rua 16, nº 2130 – Bairro Jardim Zona Sul',
        phone: '(69) 3516-2065',
        neighborhood: 'Jardim Zona Sul'
    },
    {
        name: 'UBS Setor 02',
        address: 'Rua Canário, nº 1246 – Setor 02',
        phone: '(69) 3516-2068',
        neighborhood: 'Setor 02'
    },
    {
        name: 'UBS Setor 05',
        address: 'Setor 05',
        phone: '(69) 3516-2186',
        neighborhood: 'Setor 05'
    },
    {
        name: 'UBS Setor 06',
        address: 'Avenida Jaru, nº 4747 – Setor 06',
        phone: '(69) 3516-2070',
        neighborhood: 'Setor 06'
    },
    {
        name: 'UBS Setor 09',
        address: 'Rua Paranavaí, nº 4726 – Setor 09',
        phone: '(69) 3516-2071',
        neighborhood: 'Setor 09'
    },
    {
        name: 'UBS Setor 10',
        address: 'Rua México, nº 1001 – Setor 10',
        phone: '(69) 3516-2072',
        neighborhood: 'Setor 10'
    },
    {
        name: 'UBS 25 de Dezembro',
        address: 'Avenida Canaã, nº 5420 – Bairro 25 de Dezembro',
        phone: '(69) 3516-2073',
        neighborhood: '25 de Dezembro'
    },
    {
        name: 'UBS Marechal Rondon',
        address: 'Rua Albine Henrique, S/N – Bairro Marechal Rondon',
        phone: '(69) 3516-2108',
        neighborhood: 'Marechal Rondon'
    },
    {
        name: 'UBS Mutirão',
        address: 'Rua Floriano Peixoto, nº 885 – Bairro Monte Cristo',
        phone: '(69) 3516-2109',
        neighborhood: 'Monte Cristo'
    },
    {
        name: 'UBS Jardim Alvorada',
        address: 'Rua Lisboa, S/N – Bairro Jardim Alvorada',
        phone: '(69) 3516-2148',
        neighborhood: 'Jardim Alvorada'
    }
];

export const healthUnitService = {
    syncInitialHealthUnits: async (force = false): Promise<number> => {
        const collectionRef = collection(db, COLLECTION_NAME);

        // Check if empty unless forced
        if (!force) {
            const snapshot = await getDocs(query(collectionRef, limit(1)));
            if (!snapshot.empty) {
                console.log('Health units already exist. Skipping sync.');
                return 0;
            }
        }

        const batch = writeBatch(db);
        let count = 0;

        ARIQUEMES_UBS_DATA.forEach((ubs) => {
            const docRef = doc(collectionRef); // Auto-ID
            batch.set(docRef, {
                ...ubs,
                active: true
            });
            count++;
        });

        await batch.commit();
        return count;
    },

    getAll: async (): Promise<HealthUnit[]> => {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as HealthUnit));
    }
};
