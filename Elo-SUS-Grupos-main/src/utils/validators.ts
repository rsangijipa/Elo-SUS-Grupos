export const validateCNS = (cns: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCNS = cns.replace(/\D/g, '');

    if (cleanCNS.length !== 15) return false;

    // Lógica simplificada de validação (básica para UI)
    // Para validação rigorosa (algoritmo DATASUS), precisaríamos do cálculo de pesos
    // Mas apenas verificar se começa com 1, 2, 7, 8, 9 já filtra a maioria dos erros
    const firstDigit = cleanCNS.charAt(0);
    return ['1', '2', '7', '8', '9'].includes(firstDigit);
};

export const formatCNS = (cns: string): string => {
    const clean = cns.replace(/\D/g, '');
    if (clean.length !== 15) return cns;
    return clean.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};
