/**
 * Modal Acessível com Focus Trap
 * Implementa WCAG 2.1 AA compliance para diálogos
 */

import React, { useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeButton?: boolean;
  labelledById?: string;
  describedById?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  closeButton = true,
  labelledById,
  describedById,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Aplicar focus trap
  useFocusTrap(contentRef as React.RefObject<HTMLElement>, { enabled: isOpen });

  // Fechar ao clicar no backdrop
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Fechar com Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = describedById || `modal-desc-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Accessibility: Skip link para conteúdo principal */}
      <a href="#modal-content" className="sr-only sr-only-focusable">
        Pular para conteúdo do modal
      </a>

      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById || titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className={`bg-white rounded-xl shadow-2xl ${maxWidthClass} w-full max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2
            id={titleId}
            className="text-xl font-bold text-slate-900"
          >
            {title}
          </h2>

          {closeButton && (
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus-ring"
              type="button"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          id="modal-content"
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </div>

        {/* Accessibility: Hidden close button for keyboard users */}
        <button
          onClick={onClose}
          className="sr-only sr-only-focusable"
          type="button"
        >
          Fechar modal
        </button>
      </div>
    </div>
  );
}
