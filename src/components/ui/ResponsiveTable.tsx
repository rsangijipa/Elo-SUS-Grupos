/**
 * ResponsiveTable - Tabela que se adapta a mobile (cards) e desktop (tabela)
 * WCAG 2.1 AA + Mobile-first design
 */

import React, { ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T;
  responsive?: 'mobile-first' | 'desktop-first';
  striped?: boolean;
  hover?: boolean;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  responsive = 'mobile-first',
  striped = true,
  hover = true,
  onRowClick,
  emptyState,
  loading,
  className,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return emptyState ? (
      emptyState
    ) : (
      <div className="text-center py-8 text-slate-500">Nenhum dado disponível</div>
    );
  }

  // Mobile: Cards layout
  const MobileView = () => (
    <div className="space-y-4 lg:hidden">
      {data.map((row, idx) => (
        <div
          key={String(row[rowKey])}
          onClick={() => onRowClick?.(row)}
          className={`
            border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow
            ${onRowClick ? 'cursor-pointer active:scale-95' : ''}
            ${striped && idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}
          `}
          role="region"
          aria-label={`Linha ${idx + 1}`}
        >
          {columns.map((col) => (
            <div key={String(col.key)} className="flex justify-between items-start mb-3 last:mb-0">
              <span className="text-sm font-bold text-slate-700 mr-2">{col.header}</span>
              <span className="text-sm text-slate-900 text-right font-medium">
                {col.render
                  ? col.render(row[col.key], row)
                  : typeof row[col.key] === 'object' && row[col.key] && 'toLocaleDateString' in row[col.key]
                    ? (row[col.key] as any).toLocaleDateString('pt-BR')
                    : String(row[col.key])}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Desktop: Table layout
  const DesktopView = () => (
    <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200">
      <table className={`w-full text-sm ${className}`}>
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`
                  px-6 py-3 text-left font-bold text-slate-700
                  ${col.sortable ? 'cursor-pointer hover:bg-slate-100' : ''}
                  ${col.className || ''}
                `}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && <span className="text-xs">↕</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={String(row[rowKey])}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-slate-200 transition-colors
                ${striped && idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}
                ${hover ? 'hover:bg-slate-100' : ''}
                ${onRowClick ? 'cursor-pointer active:scale-95' : ''}
              `}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-6 py-4 text-slate-900 ${col.className || ''}`}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : typeof row[col.key] === 'object' && row[col.key] && 'toLocaleDateString' in row[col.key]
                      ? (row[col.key] as any).toLocaleDateString('pt-BR')
                      : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full">
      <MobileView />
      <DesktopView />
    </div>
  );
}
