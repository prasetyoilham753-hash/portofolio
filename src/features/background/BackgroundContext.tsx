import React, { createContext, useContext, useState } from 'react';

export type BackgroundType = 'molten' | 'ghost-fibers' | 'light-pillar';

interface BackgroundContextType {
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const STORAGE_KEY = 'bp_portfolio_bg_theme';

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backgroundType, setBackgroundTypeState] = useState<BackgroundType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ghost-fibers' || saved === 'molten' || saved === 'light-pillar') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'molten';
  });

  const setBackgroundType = (type: BackgroundType) => {
    setBackgroundTypeState(type);
    try {
      localStorage.setItem(STORAGE_KEY, type);
    } catch {
      // ignore
    }
  };

  return (
    <BackgroundContext.Provider value={{ backgroundType, setBackgroundType }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
