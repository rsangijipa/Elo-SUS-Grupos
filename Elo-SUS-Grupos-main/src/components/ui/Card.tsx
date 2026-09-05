/**
 * Card Component - Base responsiva para conteúdo em grid
 * Mobile-first design
 */

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  noBorder?: boolean;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover, onClick, noBorder, noPadding }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          ${!noBorder ? 'border border-slate-200' : ''}
          rounded-lg bg-white
          ${!noPadding ? 'p-4 md:p-6' : ''}
          transition-all duration-200
          ${hover ? 'hover:shadow-lg hover:border-slate-300' : 'shadow-sm'}
          ${onClick ? 'cursor-pointer' : ''}
          ${className || ''}
        `}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={`mb-4 pb-4 border-b border-slate-100 ${className || ''}`}>
    {children}
  </div>
);

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 ${className || ''}`}>
    {children}
  </div>
);
