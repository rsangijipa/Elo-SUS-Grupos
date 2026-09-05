/**
 * Skeleton Components - Loading placeholders
 * Melhora UX durante carregamento de dados
 */

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  circle,
  className,
}) => (
  <div
    className={`
      bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
      animate-pulse
      ${circle ? 'rounded-full' : 'rounded-lg'}
      ${className || ''}
    `}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    }}
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={`space-y-2 ${className || ''}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={i === lines - 1 ? '0.75rem' : '1rem'}
        width={i === lines - 1 ? '80%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-white rounded-lg p-4 md:p-6 border border-slate-200 ${className || ''}`}>
    <div className="space-y-4">
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" width="90%" />
      <Skeleton height="1rem" width="70%" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className }) => (
  <div className={`space-y-3 ${className || ''}`}>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-3">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} height="2rem" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  return <Skeleton circle className={sizeClass} />;
};
