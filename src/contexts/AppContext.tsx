'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type WynMotionTab = 'video' | 'audio' | 'images' | 'library';

interface AppContextType {
  activeTab: WynMotionTab;
  setActiveTab: (tab: WynMotionTab) => void;
  isVietnamese: boolean;
  setIsVietnamese: (val: boolean) => void;
  toggleLanguage: () => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  toggleTheme: () => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (val: boolean) => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  t: (vi: string, en: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<WynMotionTab>('video');
  const [isVietnamese, setIsVietnamese] = useState(true);
  const [isDark, setIsDark] = useState(true); // Default to Dark Theme for WynMotion
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [credits, setCredits] = useState(100);

  // Load language & theme preference
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('wynmotion_lang');
      if (savedLang) {
        setIsVietnamese(savedLang === 'vi');
      }

      const savedTheme = localStorage.getItem('wynmotion_theme');
      if (savedTheme !== null) {
        const dark = savedTheme === 'dark';
        setIsDark(dark);
        if (dark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        // Default to dark mode for WynMotion CapCut style
        setIsDark(true);
        document.documentElement.classList.add('dark');
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

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wynmotion_theme', next ? 'dark' : 'light');
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
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
        isDark,
        setIsDark,
        toggleTheme,
        isStudioOpen,
        setIsStudioOpen,
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
