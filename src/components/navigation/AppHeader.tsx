'use client';

import React from 'react';
import { Sparkles, Globe, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const AppHeader: React.FC = () => {
  const { isVietnamese, toggleLanguage, credits, t } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo & Mascot */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-2xl overflow-hidden shadow-md shadow-rose-500/20 border border-rose-200 bg-gradient-to-tr from-[#FF2D55] to-[#FF5E85] flex items-center justify-center">
            <img
              src="/assets/mascot-logo.jpg"
              alt="WynMotion Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-slate-900 tracking-tight">WynMotion</h1>
              <span className="px-1.5 py-0.2 rounded-md bg-[#FFF1F2] text-[#FF2D55] text-[9px] font-black uppercase border border-rose-200">
                AI iOS
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500">
              {t('Studio Hoạt Họa & Voiceover', 'Animation & Voiceover Studio')}
            </p>
          </div>
        </div>

        {/* Top Right: Credits & Lang switcher */}
        <div className="flex items-center gap-2">
          {/* Credit balance badge */}
          <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black flex items-center gap-1 shadow-xs">
            <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>{credits} {t('Điểm', 'Pts')}</span>
          </div>

          {/* Lang switcher EN / VI */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black transition-all flex items-center gap-1 border border-slate-200 active:scale-95"
          >
            <span>{isVietnamese ? '🇻🇳 VI' : '🇺🇸 EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
