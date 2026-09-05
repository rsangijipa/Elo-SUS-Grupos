/**
 * useLazyLoad Hook - Carrega componentes lazy com preloading
 * Otimiza performance do bundle
 */

import React, { useState, useEffect, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
}

export function useLazyLoad<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', preload = false } = options;

  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  // Preload component
  useEffect(() => {
    if (preload) {
      loader()
        .then((module) => setComponent(() => module.default))
        .catch(setError);
    }
  }, [preload, loader]);

  // Setup intersection observer
  useEffect(() => {
    if (!ref.current || preload) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true);
          try {
            const module = await loader();
            setComponent(() => module.default);
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load component'));
          } finally {
            setIsLoading(false);
          }
          observer.unobserve(entries[0].target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [loader, threshold, rootMargin, preload]);

  return { Component, isLoading, error, ref };
}

/**
 * Lazy load em rota (para use com React Router)
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>
) {
  return React.lazy(loader);
}
