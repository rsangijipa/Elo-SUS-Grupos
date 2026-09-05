/**
 * Hook para gerenciar focus trap em modals e dialogs
 * Previne que foco escape para elementos fora do modal
 * Requerido para WCAG 2.1 AA compliance
 */

import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  returnFocus?: boolean;
}

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, returnFocus = true } = options;
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Salvar elemento que tinha foco antes
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    // Seletores de elementos focáveis
    const focusableSelectors =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll(focusableSelectors)
      ) as HTMLElement[];
    };

    // Handler para Tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        // Shift + Tab: navegar para trás
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: navegar para frente
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Handler para Escape key
    const handleKeyDownEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Pode ser tratado por componente pai se necessário
        container.dispatchEvent(
          new CustomEvent('focusTrapEscape', { bubbles: true })
        );
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('keydown', handleKeyDownEscape);

    // Focus no primeiro elemento focável
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('keydown', handleKeyDownEscape);

      // Restaurar foco ao elemento anterior
      if (returnFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [enabled, containerRef, returnFocus]);
}
