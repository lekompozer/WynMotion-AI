'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { AppHeader } from '@/components/navigation/AppHeader';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { AiVideoTab } from '@/components/tabs/AiVideoTab';
import { AiAudioTab } from '@/components/tabs/AiAudioTab';
import { AiImagesTab } from '@/components/tabs/AiImagesTab';
import { LibraryTab } from '@/components/tabs/LibraryTab';

export default function WynMotionMobileApp() {
  const { activeTab, isDark, isStudioOpen } = useApp();

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        isDark ? 'bg-[#080B10] text-slate-100' : 'bg-[#FAFAFC] text-slate-900'
      }`}
    >
      {/* 1. iOS App Header — only shown on Audio, Images, Library tabs when not in full studio mode */}
      {!isStudioOpen && activeTab !== 'video' && <AppHeader />}

      {/* 2. Active Tab Content with Smooth Transition */}
      <main className={`flex-1 overflow-y-auto ${isStudioOpen ? 'pb-0' : 'pb-24'}`}>
        <div key={activeTab} className="animate-in fade-in-50 duration-200 h-full">
          {activeTab === 'video' && <AiVideoTab />}
          {activeTab === 'audio' && <AiAudioTab />}
          {activeTab === 'images' && <AiImagesTab />}
          {activeTab === 'library' && <LibraryTab />}
        </div>
      </main>

      {/* 3. iOS Bottom Navigation Bar (Hidden when inside Full-Screen Creation Studio) */}
      {!isStudioOpen && <MobileBottomNav />}
    </div>
  );
}
