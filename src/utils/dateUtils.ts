export const getAge = (birthDateString?: string) => {
    if (!birthDateString) return '-';
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return '-';
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
};
