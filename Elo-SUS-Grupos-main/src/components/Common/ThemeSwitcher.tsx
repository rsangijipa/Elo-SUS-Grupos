/**
 * Theme Switcher - Alterna entre light, dark e high-contrast
 */

import React from 'react';
import { Sun, Moon, Contrast } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        className={`p-2 rounded transition-colors focus-ring ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Sun size={18} />
      </button>

      <button
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        className={`p-2 rounded transition-colors focus-ring ${
          theme === 'dark'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Moon size={18} />
      </button>

      <button
        onClick={() => setTheme('high-contrast')}
        aria-label="High contrast mode"
        className={`p-2 rounded transition-colors focus-ring ${
          theme === 'high-contrast'
            ? 'bg-black text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Contrast size={18} />
      </button>
    </div>
  );
}
