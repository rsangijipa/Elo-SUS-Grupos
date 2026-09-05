/**
 * Button Acessível com focus states, disabled states e aria labels
 * WCAG 2.1 AA compliance
 */

import React from 'react';

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ariaLabel?: string;
}

export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      icon,
      iconPosition = 'left',
      fullWidth,
      disabled,
      children,
      ariaLabel,
      className,
      ...props
    },
    ref
  ) => {
    const variantClass = {
      primary:
        'bg-[#0054A6] text-white hover:bg-[#003D7A] disabled:bg-slate-300',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
    }[variant];

    const sizeClass = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        className={`
          ${variantClass}
          ${sizeClass}
          rounded-lg font-medium transition-all duration-200
          focus-ring focus:ring-offset-2
          hover:shadow-md active:scale-95
          disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
          flex items-center justify-center gap-2
          ${fullWidth ? 'w-full' : ''}
          ${isLoading ? 'opacity-75' : ''}
          ${className || ''}
        `}
        {...props}
      >
        {isLoading && (
          <div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}

        {icon && iconPosition === 'left' && !isLoading && (
          <span aria-hidden="true">{icon}</span>
        )}

        {children && <span>{children}</span>}

        {icon && iconPosition === 'right' && !isLoading && (
          <span aria-hidden="true">{icon}</span>
        )}

        {isLoading && !children && (
          <span className="sr-only">Carregando...</span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
