/**
 * Grid Component - Layout responsivo
 * Mobile: 1 coluna, Tablet: 2-3 colunas, Desktop: 4+ colunas
 */

import React, { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colsClass = {
  1: 'grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
  6: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

const gapClass = {
  sm: 'gap-2 md:gap-3',
  md: 'gap-4 md:gap-6',
  lg: 'gap-6 md:gap-8',
};

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className,
}) => (
  <div
    className={`
      grid grid-cols-1
      ${colsClass[cols]}
      ${gapClass[gap]}
      ${className || ''}
    `}
  >
    {children}
  </div>
);

interface GridItemProps {
  children: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  className?: string;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan,
  className,
}) => {
  const spanClass = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
  };

  return (
    <div className={`${colSpan ? spanClass[colSpan] : ''} ${className || ''}`}>
      {children}
    </div>
  );
};
