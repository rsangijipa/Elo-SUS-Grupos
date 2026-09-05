/**
 * Badge Component - Indicadores e labels
 */

import React, { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const variantConfig: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  primary: 'bg-[#0054A6]/10 text-[#0054A6]',
};

const sizeConfig: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-xs font-medium',
  md: 'px-3 py-1.5 text-sm font-medium',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className,
  ariaLabel,
}) => (
  <span
    className={`
      inline-flex items-center gap-1 rounded-full font-semibold transition-colors
      ${variantConfig[variant]}
      ${sizeConfig[size]}
      ${className || ''}
    `}
    aria-label={ariaLabel}
  >
    {icon && <span aria-hidden="true">{icon}</span>}
    {children}
  </span>
);

interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({ children, className }) => (
  <div className={`flex flex-wrap gap-2 ${className || ''}`}>{children}</div>
);
