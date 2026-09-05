import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    fontSize: 'normal' | 'large';
    highContrast: boolean;
    toggleFontSize: () => void;
    toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
    const [highContrast, setHighContrast] = useState(false);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const savedFontSize = localStorage.getItem('elo_fontSize') as 'normal' | 'large';
        const savedContrast = localStorage.getItem('elo_highContrast') === 'true';

        if (savedFontSize) setFontSize(savedFontSize);
        if (savedContrast) setHighContrast(savedContrast);
    }, []);

    // Apply classes to body/root
    useEffect(() => {
        const root = document.documentElement;

        // Font Size Logic
        if (fontSize === 'large') {
            root.classList.add('text-lg');
            root.style.fontSize = '18px'; // Base scale
        } else {
            root.classList.remove('text-lg');
            root.style.fontSize = '16px';
        }

        // High Contrast Logic
        if (highContrast) {
            root.classList.add('high-contrast');
            // Inject dynamic style for high contrast if not using Tailwind classes everywhere
            document.body.style.filter = 'contrast(1.2) saturate(0.8)';
            document.body.style.backgroundColor = '#000';
            document.body.style.color = '#fff';
        } else {
            root.classList.remove('high-contrast');
            document.body.style.filter = '';
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        }

        // Save to localStorage
        localStorage.setItem('elo_fontSize', fontSize);
        localStorage.setItem('elo_highContrast', String(highContrast));

    }, [fontSize, highContrast]);

    const toggleFontSize = () => {
        setFontSize(prev => prev === 'normal' ? 'large' : 'normal');
    };

    const toggleHighContrast = () => {
        setHighContrast(prev => !prev);
    };

    return (
        <AccessibilityContext.Provider value={{ fontSize, highContrast, toggleFontSize, toggleHighContrast }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
