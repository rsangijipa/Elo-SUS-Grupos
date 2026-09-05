/**
 * Tabs Component - Navegação por abas
 * Acessível (WCAG 2.1 AA), responsivo, keyboard navigation
 */

import React, { useState, useCallback } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'line' | 'pill' | 'card';
  size?: 'sm' | 'md' | 'lg';
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  variant = 'line',
  size = 'md',
  onChange,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!tabs.find((t) => t.id === tabId)?.disabled) {
        setActiveTab(tabId);
        onChange?.(tabId);
      }
    },
    [tabs, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tabIds = tabs.map((t) => t.id);
      const currentIndex = tabIds.indexOf(activeTab);

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % tabIds.length;
          handleTabChange(tabIds[nextIndex]);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
          handleTabChange(tabIds[prevIndex]);
          break;
        case 'Home':
          e.preventDefault();
          handleTabChange(tabIds[0]);
          break;
        case 'End':
          e.preventDefault();
          handleTabChange(tabIds[tabIds.length - 1]);
          break;
      }
    },
    [activeTab, tabs, handleTabChange]
  );

  const variantClass = {
    line: 'border-b border-slate-200',
    pill: 'bg-slate-100 rounded-lg p-1',
    card: 'gap-2',
  }[variant];

  const sizeClass = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  }[size];

  const activeTabClass = {
    line: 'border-b-2 border-[#0054A6] text-[#0054A6] font-bold',
    pill: 'bg-white rounded-md shadow-sm',
    card: 'bg-white border border-slate-200 rounded-lg',
  }[variant];

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        className={`flex flex-wrap gap-1 overflow-x-auto ${variantClass}`}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 font-medium transition-all focus-ring
              ${sizeClass}
              ${activeTab === tab.id ? activeTabClass : 'text-slate-600 hover:text-slate-900'}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            hidden={activeTab !== tab.id}
            className="animate-fade-in"
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
