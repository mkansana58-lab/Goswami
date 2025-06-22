
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';

type Theme = 'light' | 'dark';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  eyeComfort: boolean;
  toggleEyeComfort: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [eyeComfort, setEyeComfort] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedComfort = localStorage.getItem('eyeComfort') === 'true';
    setThemeState(storedTheme || 'light');
    setEyeComfort(storedComfort);
  }, []);

  useEffect(() => {
    if (isClient) {
      document.body.classList.remove('light', 'dark', 'eye-comfort');
      document.body.classList.add(theme);
      if (eyeComfort) {
        document.body.classList.add('eye-comfort');
      }
    }
  }, [theme, eyeComfort, isClient]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleEyeComfort = () => {
    setEyeComfort(prev => {
      const newComfortState = !prev;
      localStorage.setItem('eyeComfort', String(newComfortState));
      return newComfortState;
    });
  };

  const value = { theme, setTheme, eyeComfort, toggleEyeComfort };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
