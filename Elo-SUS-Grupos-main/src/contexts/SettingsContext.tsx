import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
    unitName: string;
    unitAddress: string;
}

interface SettingsContextType extends Settings {
    updateSettings: (name: string, address: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
    unitName: "UBS Setor 09",
    unitAddress: "Av. Tancredo Neves, 2500, Ariquemes - RO"
};

const STORAGE_KEY = 'elosus_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse settings from local storage", e);
            }
        }
    }, []);

    const updateSettings = (name: string, address: string) => {
        const newSettings = { unitName: name, unitAddress: address };
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{
            ...settings,
            updateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
