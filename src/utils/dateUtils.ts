export const toJsDate = (date: any): Date | null => {
    if (!date) return null;
    // Check for Firestore Timestamp (has toDate method)
    if (typeof date.toDate === 'function') {
        return date.toDate();
    }
    // Check if it's already a Date object
    if (date instanceof Date) {
        return date;
    }
    // Attempt parsing string or number
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

export const formatDate = (dateString?: string | any) => {
    const date = toJsDate(dateString);
    if (!date) return '-';
    return date.toLocaleDateString('pt-BR');
};
