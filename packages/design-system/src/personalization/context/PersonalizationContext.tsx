import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PersonalizationSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  updateSettings: (settings: Partial<PersonalizationSettings>) => void;
}

const defaultSettings: PersonalizationSettings = {
  theme: 'system',
  language: 'en',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

interface PersonalizationProviderProps {
  children: ReactNode;
}

export function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const [settings, setSettings] = useState<PersonalizationSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<PersonalizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <PersonalizationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

export { PersonalizationContext };
export type { PersonalizationSettings, PersonalizationContextType };
