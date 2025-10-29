'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'real' | 'simulation';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isSimulation: boolean;
  isReal: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('real');

  // Charger le mode depuis localStorage au démarrage
  useEffect(() => {
    const savedMode = localStorage.getItem('app-mode') as AppMode;
    if (savedMode && (savedMode === 'real' || savedMode === 'simulation')) {
      setModeState(savedMode);
    }
  }, []);

  // Sauvegarder le mode dans localStorage
  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('app-mode', newMode);
  };

  const value = {
    mode,
    setMode,
    isSimulation: mode === 'simulation',
    isReal: mode === 'real',
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
