/**
 * Command Palette - Cmd+K para acesso rápido a funções
 * Similar ao VSCode command palette
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

export interface Command {
  id: string;
  title: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

export function CommandPalette({
  commands,
  isOpen,
  onClose,
  placeholder = 'Digite um comando...',
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filtered.reduce(
    (acc, cmd) => {
      const category = cmd.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
            onClose();
            setSearch('');
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          setSearch('');
          break;
      }
    },
    [filtered, selectedIndex, onClose]
  );

  // Register global Cmd+K listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle open/close
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="border-b border-slate-200 p-4 flex items-center gap-3">
          <Search size={20} className="text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none bg-transparent text-slate-900 placeholder:text-slate-400 text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum comando encontrado</div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                {category !== 'General' && (
                  <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-t border-slate-100">
                    {category}
                  </div>
                )}
                {cmds.map((cmd, idx) => {
                  const globalIndex = filtered.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                        setSearch('');
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#0054A6] text-white'
                          : 'hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {cmd.icon && (
                          <span className="shrink-0" aria-hidden="true">
                            {cmd.icon}
                          </span>
                        )}
                        <div className="text-left min-w-0">
                          <div className="font-medium text-sm">{cmd.title}</div>
                          {cmd.description && (
                            <div className="text-xs opacity-60 truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {cmd.shortcut && (
                        <div className="ml-4 text-xs opacity-60 shrink-0">
                          {cmd.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
