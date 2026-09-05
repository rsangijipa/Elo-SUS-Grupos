import type { FirestoreDate, FirestoreTimestamp } from '../types/shared';

const isFirestoreTimestamp = (date: FirestoreDate | number | undefined): date is FirestoreTimestamp => {
    return !!date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function';
};

export const toJsDate = (date: FirestoreDate | number | undefined): Date | null => {
    if (!date) return null;
    if (isFirestoreTimestamp(date)) {
        return date.toDate();
    }
    if (date instanceof Date) {
        return date;
    }
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
};

export const getAge = (birthDateString?: string) => {
    if (!birthDateString) return '-';
    // Use the utility for consistency if needed, but for birthDateString (which SHOULD be string) direct parsing is fine
    // However, for safety in mixed codebases:
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return '-';
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const formatDate = (dateString?: FirestoreDate) => {
    const date = toJsDate(dateString);
    if (!date) return '-';
    return date.toLocaleDateString('pt-BR');
};
