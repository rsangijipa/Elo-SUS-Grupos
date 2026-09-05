import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const cleanupDatabase = async () => {
    console.log('Starting database cleanup...');
    try {
        // 1. Delete all Referrals
        if (!db) {
            console.error('Database not initialized');
            return false;
        }
        const referralsRef = collection(db, 'referrals');
        const referralsSnapshot = await getDocs(referralsRef);
        const referralDeletions = referralsSnapshot.docs.map(d => deleteDoc(doc(db, 'referrals', d.id)));
        await Promise.all(referralDeletions);
        console.log(`Deleted ${referralDeletions.length} referrals.`);

        // 2. Delete all Groups created (assuming we want to clear them too, or filter by some criteria)
        // For safety in this demo, let's only delete groups that look like test groups or just all if it's a dev env.
        // We'll delete all for a clean slate as requested.
        const groupsRef = collection(db, 'grupos');
        const groupsSnapshot = await getDocs(groupsRef);
        const groupDeletions = groupsSnapshot.docs.map(d => deleteDoc(doc(db, 'grupos', d.id)));
        await Promise.all(groupDeletions);
        console.log(`Deleted ${groupDeletions.length} groups.`);

        console.log('Database cleanup complete.');
        return true;
    } catch (error) {
        console.error('Error cleaning database:', error);
        return false;
    }
};
