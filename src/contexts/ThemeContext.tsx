import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeType = 'patient' | 'professional';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    getThemeColors: () => {
        primary: string;
        secondary: string;
        background: string;
        gradient: string;
    };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>('patient');

    const getThemeColors = () => {
        if (theme === 'patient') {
            return {
                primary: 'purple-600',
                secondary: 'pink-500',
                background: 'slate-50',
                gradient: 'from-purple-100 via-pink-50 to-white'
            };
        }
        return {
            primary: 'blue-600',
            secondary: 'cyan-500',
            background: 'slate-50',
            gradient: 'from-blue-100 via-cyan-50 to-white'
        };
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, getThemeColors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
