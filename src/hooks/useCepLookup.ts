import { useState, useCallback } from 'react';

interface CepResult {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

interface UseCepLookupReturn {
    loading: boolean;
    error: string | null;
    lookup: (cep: string) => Promise<CepResult | null>;
    formatCep: (value: string) => string;
}

/**
 * Hook para buscar endereço via CEP usando a API ViaCEP (gratuita, sem API key).
 * Retorna logradouro, bairro, localidade e UF.
 */
export function useCepLookup(): UseCepLookupReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatCep = useCallback((value: string): string => {
        let v = value.replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);
        if (v.length > 5) {
            v = v.slice(0, 5) + '-' + v.slice(5);
        }
        return v;
    }, []);

    const lookup = useCallback(async (cep: string): Promise<CepResult | null> => {
        const digits = cep.replace(/\D/g, '');
        if (digits.length !== 8) {
            setError('CEP deve ter 8 dígitos.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            if (!response.ok) {
                throw new Error('Erro na consulta');
            }
            const data: CepResult = await response.json();

            if (data.erro) {
                setError('CEP não encontrado.');
                return null;
            }

            return data;
        } catch (err) {
            setError('Erro ao consultar CEP. Tente novamente.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, lookup, formatCep };
}
