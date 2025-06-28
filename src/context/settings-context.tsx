
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

// Theme logic has been removed to enforce a permanent dark theme.
// The provider is kept for potential future settings.

interface SettingsContextType {}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {

  // No-op provider, as theme is now hardcoded in globals.css
  const value = {};

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
