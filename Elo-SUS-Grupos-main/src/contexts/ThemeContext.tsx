/**
 * ThemeContext - Gerencia Dark Mode, High Contrast, etc
 * Integra com AccessibilityContext
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Carregar preferência salva ou usar preferência do sistema
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    if (saved) return saved;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Salvar preferência
    localStorage.setItem('themeMode', theme);

    // Aplicar ao documento
    const html = document.documentElement;
    html.classList.remove('light', 'dark', 'high-contrast');
    html.classList.add(theme);

    // Aplicar CSS variables
    if (theme === 'dark') {
      html.style.colorScheme = 'dark';
    } else if (theme === 'high-contrast') {
      html.style.colorScheme = 'light';
      html.classList.add('high-contrast');
    } else {
      html.style.colorScheme = 'light';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDark: theme === 'dark',
        isHighContrast: theme === 'high-contrast',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
