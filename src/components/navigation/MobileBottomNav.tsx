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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-slate-200/80 px-3 pt-2 pb-[max(env(safe-area-inset-bottom,0px),12px)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'text-[#FF2D55]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[#FFF1F2] text-[#FF2D55] shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF2D55] ring-2 ring-white" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isSelected ? 'font-black text-[#FF2D55]' : 'font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
