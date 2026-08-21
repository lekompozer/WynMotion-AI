'use client';

import React from 'react';
import { Film, Mic, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { useApp, WynMotionTab } from '@/contexts/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isDark, t } = useApp();

  const TABS = [
    {
      id: 'video' as WynMotionTab,
      label: t('AI Video', 'AI Video'),
      icon: Film,
    },
    {
      id: 'audio' as WynMotionTab,
      label: t('AI Audio', 'AI Audio'),
      icon: Mic,
    },
    {
      id: 'images' as WynMotionTab,
      label: t('AI Images', 'AI Images'),
      icon: ImageIcon,
    },
    {
      id: 'library' as WynMotionTab,
      label: t('Library', 'Library'),
      icon: FolderOpen,
    },
  ];

  const handleTabClick = (tabId: WynMotionTab) => {
    if (tabId === activeTab) return;

    // Trigger native iOS haptic feedback
    if (typeof window !== 'undefined') {
      try {
        const cap = (window as any).Capacitor;
        if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
          import('@capacitor/haptics')
            .then(({ Haptics, ImpactStyle }) => {
              Haptics.impact({ style: ImpactStyle.Light });
            })
            .catch(() => {});
        }
      } catch (_) {}
    }

    setActiveTab(tabId);
  };

  return (
    <nav
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
      className={`fixed inset-x-0 bottom-0 z-40 backdrop-blur-2xl px-2 pt-1.5 transition-colors duration-200 ${
        isDark
          ? 'bg-[#080B10]/95 border-t border-slate-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]'
          : 'bg-black text-white border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? isDark
                    ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-md shadow-rose-500/25 scale-[1.02] font-black'
                    : 'bg-white/20 text-white shadow-sm scale-[1.02] font-black'
                  : isDark
                  ? 'text-slate-400 hover:text-white active:bg-slate-800/80'
                  : 'text-white/60 hover:text-white active:bg-white/10'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isSelected ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="w-full truncate px-0.5 text-center leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
