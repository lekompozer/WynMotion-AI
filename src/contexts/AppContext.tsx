'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type WynMotionTab = 'video' | 'audio' | 'images' | 'library';

interface AppContextType {
  activeTab: WynMotionTab;
  setActiveTab: (tab: WynMotionTab) => void;
  isVietnamese: boolean;
  setIsVietnamese: (val: boolean) => void;
  toggleLanguage: () => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  t: (vi: string, en: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<WynMotionTab>('video');
  const [isVietnamese, setIsVietnamese] = useState(true);
  const [credits, setCredits] = useState(100);

  // Load language preference
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('wynmotion_lang');
      if (savedLang) {
        setIsVietnamese(savedLang === 'vi');
      }
    } catch {}
  }, []);

  const toggleLanguage = () => {
    setIsVietnamese((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wynmotion_lang', next ? 'vi' : 'en');
      } catch {}
      return next;
    });
  };

  const t = (vi: string, en: string) => (isVietnamese ? vi : en);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isVietnamese,
        setIsVietnamese,
        toggleLanguage,
        credits,
        setCredits,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
