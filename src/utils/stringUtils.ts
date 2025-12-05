export const getCleanName = (fullName: string | undefined | null): string => {
    if (!fullName) return 'Visitante';
    // Remove email se estiver concatenado e pega o primeiro nome
    const clean = fullName.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '').trim();
    return clean.split(' ')[0] || 'Visitante';
};

export const capitalizeName = (name: string): string => {
    return name
        .trim()
        .toLowerCase()
        .replace(/(?:^|\s|['"-])\S/g, (char) => char.toUpperCase());
};
