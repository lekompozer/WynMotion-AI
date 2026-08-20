'use client';

import React from 'react';
import { Film, Mic, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { useApp, WynMotionTab } from '@/contexts/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

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
      className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 px-2 pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
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
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF4570] text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 active:bg-slate-100/80'
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
