import { useCallback, useEffect, useMemo, useState, type DependencyList } from 'react';

interface QueryState<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

interface DocState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useFirestoreQuery<T>(
    queryFn: () => Promise<T[]>,
    deps: DependencyList = []
): QueryState<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const refetch = useCallback(() => {
        setReloadKey((current) => current + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const runQuery = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await queryFn();
                if (isMounted) {
                    setData(result);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Erro ao consultar dados.'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void runQuery();

        return () => {
            isMounted = false;
        };
    }, [queryFn, reloadKey, ...deps]);

    return useMemo(() => ({ data, loading, error, refetch }), [data, error, loading, refetch]);
}

export function useFirestoreDoc<T>(
    queryFn: () => Promise<T | null>,
    deps: DependencyList = []
): DocState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const refetch = useCallback(() => {
        setReloadKey((current) => current + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const runQuery = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await queryFn();
                if (isMounted) {
                    setData(result);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Erro ao consultar documento.'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void runQuery();

        return () => {
            isMounted = false;
        };
    }, [queryFn, reloadKey, ...deps]);

    return useMemo(() => ({ data, loading, error, refetch }), [data, error, loading, refetch]);
}
