import toast from 'react-hot-toast';

type FirebaseLikeError = {
    code?: string;
    message?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
    'permission-denied': 'Voce nao tem permissao para realizar esta acao',
    'not-found': 'Registro nao encontrado',
    'network-request-failed': 'Sem conexao. Verifique sua internet',
    'quota-exceeded': 'Limite de operacoes atingido. Tente mais tarde'
};

const normalizeErrorCode = (error: FirebaseLikeError) => {
    if (!error.code) {
        return '';
    }

    return error.code.replace(/^firebase\//, '').replace(/^auth\//, '');
};

export function handleFirebaseError(error: unknown): string {
    const firebaseError = error as FirebaseLikeError;
    const code = normalizeErrorCode(firebaseError);

    if (code && ERROR_MESSAGES[code]) {
        return ERROR_MESSAGES[code];
    }

    if (firebaseError?.message) {
        return firebaseError.message;
    }

    return 'Ocorreu um erro. Tente novamente';
}

export async function withErrorHandling<T>(fn: () => Promise<T>, fallback?: T): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        const message = handleFirebaseError(error);
        console.error('Handled service error:', error);
        toast.error(message);

        if (fallback !== undefined) {
            return fallback;
        }

        throw new Error(message);
    }
}
